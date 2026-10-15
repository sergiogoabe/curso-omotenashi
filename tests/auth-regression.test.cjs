const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function load(file, mocks = {}, globals = {}) {
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  vm.runInNewContext(code, {
    module, exports: module.exports, TextEncoder, URL, URLSearchParams, console, ...globals,
    require(name) { return Object.hasOwn(mocks, name) ? mocks[name] : require(name) },
  }, { filename: file })
  return module.exports
}

const { registrationSchema } = load('lib/registration.ts')
const { gerarPixPayload, crc16 } = load('lib/pix.ts')
const valid = { name: 'Aluno Teste', email: '  ALUNO@example.com ', password: 'teste123', plan: 'individual' }

test('registration trims name and normalizes email', () => {
  const result = registrationSchema.parse({ ...valid, name: '  Aluno Teste  ' })
  assert.equal(result.email, 'aluno@example.com')
  assert.equal(result.name, 'Aluno Teste')
})
for (const [label, input] of Object.entries({
  'invalid email': { ...valid, email: 'invalid' },
  'short password': { ...valid, password: '123' },
  'bcrypt byte truncation': { ...valid, password: 'é'.repeat(37) },
  'unknown plan': { ...valid, plan: 'toString' },
  'non-string name': { ...valid, name: {} },
  'missing fields': {},
  'null body': null,
})) {
  test(`registration rejects ${label}`, () => assert.equal(registrationSchema.safeParse(input).success, false))
}

function parseTLV(value) {
  const fields = {}
  for (let pos = 0; pos < value.length;) {
    const id = value.slice(pos, pos + 2)
    const size = Number(value.slice(pos + 2, pos + 4))
    assert.ok(Number.isInteger(size))
    const end = pos + 4 + size
    assert.ok(end <= value.length, `invalid length for field ${id}`)
    fields[id] = value.slice(pos + 4, end)
    pos = end
  }
  return fields
}
for (const amount of [197, 1497, 2497, 3200]) {
  test(`PIX valid TLV and decimal amount ${amount}`, () => {
    const payload = gerarPixPayload(amount)
    const fields = parseTLV(payload)
    assert.equal(fields['54'], amount.toFixed(2))
    assert.equal(parseTLV(fields['26'])['01'], '07030124600')
    assert.equal(parseTLV(fields['26'])['00'], 'BR.GOV.BCB.PIX')
    assert.equal(fields['63'], crc16(payload.slice(0, -4)))
  })
}
test('CRC matches standard CCITT-FALSE vector', () => assert.equal(crc16('123456789'), '29B1'))

function findForm(element) {
  if (!element || typeof element !== 'object') return null
  if (element.type === 'form') return element
  for (const child of [element.props?.children].flat(Infinity)) {
    const form = findForm(child)
    if (form) return form
  }
  return null
}
function loginHarness(signIn, search = '') {
  const states = [' aluno@example.com ', 'test-password', '', false]
  const updates = {}
  let index = 0
  const pushes = []
  const mocks = {
    react: { useState() { const i = index++; return [states[i], value => { updates[i] = value }] } },
    'next-auth/react': { signIn },
    'next/navigation': { useRouter: () => ({ push: url => pushes.push(url), refresh() {} }) },
    'next/link': { default: 'a', __esModule: true },
    '@/components/ui/button': { Button: 'button' },
    '@/components/ui/input': { Input: 'input' },
    '@/components/ui/label': { Label: 'label' },
    '@/components/ui/card': Object.fromEntries(['Card', 'CardContent', 'CardDescription', 'CardFooter', 'CardHeader', 'CardTitle'].map(k => [k, 'div'])),
  }
  const Login = load('app/auth/login/page.tsx', mocks, { window: { location: { origin: 'https://example.com', search } } }).default
  return { submit: findForm(Login()).props.onSubmit, pushes, updates }
}
test('login network error releases loading state and reports error', async () => {
  const h = loginHarness(async () => { throw new Error('network') })
  await h.submit({ preventDefault() {} })
  assert.equal(h.updates[3], false)
  assert.match(h.updates[2], /conexão/)
  assert.equal(h.pushes.length, 0)
})
test('undefined login result must not navigate', async () => {
  const h = loginHarness(async () => undefined)
  await h.submit({ preventDefault() {} })
  assert.equal(h.pushes.length, 0)
  assert.match(h.updates[2], /inválidos/)
})
for (const [label, callback, expected] of [
  ['local callback', '/curso/aula?x=1', '/curso/aula?x=1'],
  ['external callback', 'https://evil.example/phishing', '/dashboard'],
  ['auth loop', '/auth/login', '/dashboard'],
  ['malformed callback', 'http://[', '/dashboard'],
]) {
  test(`login handles ${label}`, async () => {
    const h = loginHarness(async options => ({ ok: true }), `?callbackUrl=${encodeURIComponent(callback)}`)
    await h.submit({ preventDefault() {} })
    assert.equal(h.pushes[0], expected)
    assert.equal(h.updates[3], false)
  })
}

function paymentHarness(overrides = {}) {
  const state = { status: 'pending', grants: 0, deleted: false }
  const tx = {
    payment: {
      findUnique: async () => ({ id: 'payment', email: 'aluno@example.com', value: 197, plan: 'individual', status: state.status }),
      updateMany: async () => { state.status = 'completed'; return { count: 1 } },
      update: async () => ({}),
    },
    pendingRegistration: {
      findUnique: async () => ({ id: 'pending', email: 'aluno@example.com', password: 'hashed', name: 'Aluno', value: 197, plan: 'individual' }),
      delete: async () => { state.deleted = true },
    },
    user: { upsert: async () => ({ id: 'user' }) },
    enrollment: { create: async () => { state.grants++ } },
    ...overrides,
  }
  const prisma = { $transaction: async fn => {
    const before = { ...state }
    try { return await fn(tx) } catch (error) { Object.assign(state, before); throw error }
  } }
  const { fulfillPayment } = load('lib/fulfill-payment.ts', { '@/lib/prisma': { prisma } })
  const checkout = { id: 'cs_test_123', payment_status: 'paid', currency: 'brl', amount_total: 19700, metadata: { registrationId: 'pending' } }
  return { fulfillPayment, checkout, state }
}
test('unpaid checkout cannot grant access', async () => {
  const h = paymentHarness()
  assert.equal(await h.fulfillPayment({ ...h.checkout, payment_status: 'unpaid' }), false)
  assert.equal(h.state.grants, 0)
})
test('duplicate confirmations grant exactly once', async () => {
  const h = paymentHarness()
  assert.equal(await h.fulfillPayment(h.checkout), true)
  assert.equal(await h.fulfillPayment(h.checkout), true)
  assert.equal(h.state.grants, 1)
})
test('wrong amount is rejected without granting access', async () => {
  const h = paymentHarness()
  await assert.rejects(h.fulfillPayment({ ...h.checkout, amount_total: 1 }), /amount mismatch/)
  assert.equal(h.state.grants, 0)
})
test('legacy checkout never falls back to a default password', async () => {
  const h = paymentHarness()
  await assert.rejects(h.fulfillPayment({ ...h.checkout, metadata: {} }), /manual reconciliation/)
  assert.equal(h.state.grants, 0)
})
test('failed enrollment rolls back payment claim', async () => {
  const h = paymentHarness({ enrollment: { create: async () => { throw new Error('db failure') } } })
  await assert.rejects(h.fulfillPayment(h.checkout), /db failure/)
  assert.equal(h.state.status, 'pending')
  assert.equal(h.state.deleted, false)
})

test('checkout keeps password hash local and sends stable registration metadata', async () => {
  let persisted, payload, options
  const prisma = {
    user: { findUnique: async () => null },
    pendingRegistration: {
      findUnique: async () => null,
      create: async ({ data }) => { persisted = data; return { ...data, id: 'registration-test' } },
    },
    payment: { upsert: async () => ({}) },
  }
  const stripe = { checkout: { sessions: { create: async (data, opts) => {
    payload = data; options = opts
    return { id: 'cs_test_fixture', url: 'https://checkout.stripe.com/test-fixture', status: 'open' }
  } } } }
  const { POST } = load('app/api/stripe/checkout/route.ts', {
    '@/lib/prisma': { prisma },
    '@/lib/stripe': { getStripe: () => stripe, PLANS: { individual: { label: 'Individual', description: 'Teste', value: 197, valueInCents: 19700 } } },
    '@/lib/registration': { registrationSchema },
    '@/lib/rate-limit': { rateLimit: async () => ({ ok: true, remaining: 99, retryAfter: 0 }), clientIp: () => 'unit', tooMany: () => new Response(null, { status: 429 }) },
  }, { process: { env: { STRIPE_SECRET_KEY: 'synthetic-unit-fixture' } } })
  const response = await POST(new Request('http://localhost/api/stripe/checkout', { method: 'POST', body: JSON.stringify(valid) }))
  assert.equal(response.status, 200)
  assert.equal(payload.metadata.registrationId, 'registration-test')
  assert.equal(Object.hasOwn(payload.metadata, 'password'), false)
  assert.equal(JSON.stringify(payload).includes(valid.password), false)
  assert.equal(options.idempotencyKey, 'registration-registration-test')
  assert.ok(await require('bcryptjs').compare(valid.password, persisted.password))
})
