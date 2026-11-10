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

const { registrationSchema, isValidCpf } = load('./lib/registration.ts')
const { hashEmailToken } = load('./lib/email-verify.ts', { 'node:crypto': require('node:crypto') })
const { gerarPixPayload, crc16 } = load('./lib/pix.ts')
const valid = { name: 'Aluno Teste', email: '  ALUNO@example.com ', password: 'teste123', plan: 'individual', cpf: '529.982.247-25' }

test('email verify token is hashed, not stored raw', () => {
  const raw = 'a'.repeat(64)
  const hash = hashEmailToken(raw)
  assert.equal(hash.length, 64)
  assert.notEqual(hash, raw)
})

test('PIX payload embeds the shared PIX key', () => {
  const { PIX_KEY } = load('./lib/pix.ts')
  const payload = gerarPixPayload(197)
  const fields = parseTLV(payload)
  const merchant = parseTLV(fields['26'])
  assert.equal(merchant['01'], PIX_KEY)
})

test('escapeHtml neutralizes markup before email interpolation', () => {
  const { escapeHtml } = load('./lib/email.ts', {}, { process: { env: {} } })
  assert.equal(escapeHtml('<script>alert("x")&</script>'), '&lt;script&gt;alert(&quot;x&quot;)&amp;&lt;/script&gt;')
})

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
for (const [label, cpf] of Object.entries({
  'repeated digits': '111.111.111-11',
  'wrong check digit': '529.982.247-24',
  'too short': '1234567890',
  'letters': 'abc.def.ghi-jk',
  'missing': undefined,
})) {
  test(`registration rejects CPF ${label}`, () => assert.equal(registrationSchema.safeParse({ ...valid, cpf }).success, false))
}
test('registration normalizes CPF to digits', () => {
  assert.equal(registrationSchema.parse(valid).cpf, '52998224725')
})
test('isValidCpf accepts known valid CPF', () => {
  assert.ok(isValidCpf('52998224725'))
  assert.ok(isValidCpf('529.982.247-25'))
  assert.equal(isValidCpf('11111111111'), false)
})

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

test('Asaas checkout creates PIX payment without sending password', async () => {
  let persisted, asaasResult
  const prisma = {
    user: { findUnique: async () => null },
    pendingRegistration: {
      findUnique: async () => null,
      create: async ({ data }) => { persisted = data; return { ...data, id: 'registration-test' } },
    },
    payment: { upsert: async () => ({}) },
  }
  const { gerarPixPayload } = load('./lib/pix.ts')
  const { PLANS } = load('./lib/plans.ts')
  const { POST } = load('app/api/register/route.ts', {
    '@/lib/prisma': { prisma },
    '@/lib/registration': { registrationSchema },
    '@/lib/rate-limit': { rateLimit: async () => ({ ok: true, remaining: 99, retryAfter: 0 }), clientIp: () => 'unit', tooMany: () => new Response(null, { status: 429 }) },
    '@/lib/pix': { gerarPixPayload },
    '@/lib/plans': { PLANS },
    '@/lib/email': { sendEmail: async () => true, escapeHtml: (v) => v },
    qrcode: { toDataURL: async () => 'data:image/png;base64,dGVzdA==' },
  }, { process: { env: {} }, fetch: async () => ({ ok: true, json: async () => ({}) }) })
  const response = await POST(new Request('http://localhost/api/register', { method: 'POST', body: JSON.stringify(valid) }))
  assert.equal(response.status, 200)
  const body = await response.json()
  // Password hash stored locally, never sent to payment provider
  assert.ok(persisted.password.startsWith('$2'), 'password should be bcrypt hash')
  assert.ok(!persisted.password.includes(valid.password), 'raw password not in hash')
  // Response contains PIX payload and QR code, no password
  assert.ok(body.pixPayload)
  assert.ok(body.pixQR)
  assert.equal(body.plan, 'individual')
  assert.ok(!Object.hasOwn(body, 'password'))
})

function registerAsaasHarness(asaasMocks, env) {
  let persisted, updated
  const prisma = {
    user: { findUnique: async () => null },
    pendingRegistration: {
      findUnique: async () => null,
      create: async ({ data }) => { persisted = data; return { ...data, id: 'registration-test' } },
      update: async ({ where, data }) => { updated = { where, data }; return { ...data, id: where.id } },
    },
    payment: { upsert: async () => ({}) },
  }
  const { gerarPixPayload } = load('./lib/pix.ts')
  const { PLANS } = load('./lib/plans.ts')
  const { POST } = load('app/api/register/route.ts', {
    '@/lib/prisma': { prisma },
    '@/lib/registration': { registrationSchema },
    '@/lib/rate-limit': { rateLimit: async () => ({ ok: true, remaining: 99, retryAfter: 0 }), clientIp: () => 'unit', tooMany: () => new Response(null, { status: 429 }) },
    '@/lib/pix': { gerarPixPayload },
    '@/lib/plans': { PLANS },
    '@/lib/email': { sendEmail: async () => true, escapeHtml: (v) => v },
    qrcode: { toDataURL: async () => 'data:image/png;base64,dGVzdA==' },
    '@/lib/asaas/asaas': asaasMocks,
  }, { process: { env }, fetch: async () => ({ ok: true, json: async () => ({}) }) })
  return { POST, persisted: () => persisted, updated: () => updated, gerarPixPayload }
}

test('register creates dynamic Asaas PIX when API key present', async () => {
  const calls = []
  const h = registerAsaasHarness({
    criarCliente: async (name, email, cpf) => { calls.push(['customer', name, email, cpf]); return { id: 'cus_1', name, email, cpfCnpj: cpf } },
    criarCobrancaPix: async (input) => { calls.push(['charge', input]); return { id: 'pay_123', value: input.valorCentavos / 100, status: 'PENDING', dueDate: input.vencimento, invoiceUrl: 'https://sandbox.asaas.com/i/pay_123' } },
    obterPixQrCode: async (id) => { calls.push(['qr', id]); return { payload: 'PIX-DYNAMIC-PAYLOAD', encodedImage: 'QUJD' } },
  }, { ASAAS_API_KEY: 'test-key' })
  const response = await h.POST(new Request('http://localhost/api/register', { method: 'POST', body: JSON.stringify(valid) }))
  assert.equal(response.status, 200)
  const body = await response.json()
  // Customer created with normalized CPF and charge tied to registration id
  assert.deepEqual(calls[0], ['customer', 'Aluno Teste', 'aluno@example.com', '52998224725'])
  assert.equal(calls[1][1].customerId, 'cus_1')
  assert.equal(calls[1][1].valorCentavos, 19700)
  assert.equal(calls[1][1].externalReference, 'registration-test')
  assert.equal(calls[2][1], 'pay_123')
  // Pending registration persisted with CPF and linked to Asaas payment
  assert.equal(h.persisted().cpf, '52998224725')
  assert.equal(h.updated().where.id, 'registration-test')
  assert.equal(h.updated().data.asaasPaymentId, 'pay_123')
  assert.equal(h.updated().data.pixPayload, 'PIX-DYNAMIC-PAYLOAD')
  // Response returns dynamic payload and normalized data URL image
  assert.equal(body.pixPayload, 'PIX-DYNAMIC-PAYLOAD')
  assert.equal(body.pixQR, 'data:image/png;base64,QUJD')
  assert.ok(!Object.hasOwn(body, 'password'))
})

test('register falls back to static PIX when Asaas fails', async () => {
  const h = registerAsaasHarness({
    criarCliente: async () => { throw new Error('asaas down') },
  }, { ASAAS_API_KEY: 'test-key' })
  const response = await h.POST(new Request('http://localhost/api/register', { method: 'POST', body: JSON.stringify(valid) }))
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.pixPayload, h.gerarPixPayload(197))
  assert.equal(body.pixQR, 'data:image/png;base64,dGVzdA==')
})

test('asaas webhook validates static access token', () => {
  const { validarTokenWebhook } = load('./lib/asaas/asaas.ts', {}, { process: { env: { ASAAS_WEBHOOK_SECRET: 'tok_32chars_de_teste_secreto_abcdef' } }, Buffer })
  assert.equal(validarTokenWebhook('tok_32chars_de_teste_secreto_abcdef'), true)
  assert.equal(validarTokenWebhook('tok_32chars_de_teste_secreto_abcdeg'), false)
  assert.equal(validarTokenWebhook(''), false)
})

function webhookHarness({ tokenOk = true, pending = null, existingUser = null } = {}) {
  const deleted = []
  const createdUser = []
  const createdToken = []
  const createdPayment = []
  const sync = []
  const sent = []
  const activated = []
  const pings = []
  const prisma = {
    pendingRegistration: {
      findFirst: async () => pending,
      delete: async ({ where }) => { deleted.push(where.id) },
    },
    user: { findUnique: async () => existingUser },
    $transaction: async (fn) => fn({
      user: { create: async ({ data }) => { createdUser.push(data); return { id: 'user-1', ...data } } },
      pendingRegistration: { delete: async ({ where }) => { deleted.push(where.id) } },
    }),
    verificationToken: { create: async ({ data }) => { createdToken.push(data) } },
    payment: { create: async ({ data }) => { createdPayment.push(data) } },
    webhookPing: { create: async ({ data }) => { pings.push(data); return { id: 'ping-1', ...data } } },
  }
  const { POST } = load('app/api/webhooks/asaas/route.ts', {
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/lib/prisma': { prisma },
    '@/lib/access': { syncCourseAccess: async (input) => { sync.push(input) } },
    '@/lib/asaas/asaas': { validarTokenWebhook: () => tokenOk },
    '@/lib/asaas/ativar': { ativarRegistro: async (reg, paymentId) => { activated.push({ reg, paymentId }); return { userId: 'user-1', verifyLink: 'https://example.com/verify-email?token=t', emailSent: true } } },
    '@/lib/email': { emailEnabled: () => true, sendEmail: async (opts) => { sent.push(opts); return true }, verifyEmailTemplate: (link) => ({ subject: 'verify', html: `<a href="${link}">verify</a>` }) },
    '@/lib/email-verify': { newEmailToken: () => ({ token: 'raw-token', hash: 'hashed-token', expires: new Date() }), verifyEmailLink: (t) => `https://example.com/verify-email?token=${t}` },
  }, { process: { env: {} } })
  const call = (payload, token = 'tok') => POST(new Request('http://localhost/api/webhooks/asaas', {
    method: 'POST',
    headers: { 'asaas-access-token': token },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  }))
  return { call, deleted, createdUser, createdToken, createdPayment, sync, sent, activated, pings }
}

const webhookPayment = { id: 'pay_123', externalReference: 'registration-test', value: 197, status: 'RECEIVED' }

test('webhook rejects missing token', async () => {
  const h = webhookHarness()
  const response = await h.call({ event: 'PAYMENT_RECEIVED', payment: webhookPayment }, '')
  assert.equal(response.status, 400)
  assert.equal(h.createdUser.length, 0)
})

test('webhook rejects invalid token', async () => {
  const h = webhookHarness({ tokenOk: false })
  const response = await h.call({ event: 'PAYMENT_RECEIVED', payment: webhookPayment })
  assert.equal(response.status, 400)
  assert.equal(h.createdUser.length, 0)
})

test('webhook ignores non-payment events', async () => {
  const h = webhookHarness({ pending: { id: 'registration-test', name: 'Aluno', email: 'a@example.com', password: 'hash', plan: 'individual', value: 197, asaasPaymentId: 'pay_123' } })
  const response = await h.call({ event: 'PAYMENT_CREATED', payment: webhookPayment })
  assert.equal(response.status, 200)
  assert.equal(h.createdUser.length, 0)
})

test('webhook activates account on PAYMENT_RECEIVED', async () => {
  const h = webhookHarness({ pending: { id: 'registration-test', name: 'Aluno Teste', email: 'aluno@example.com', password: '$2hash', plan: 'individual', value: 197, asaasPaymentId: 'pay_123' } })
  const response = await h.call({ event: 'PAYMENT_RECEIVED', payment: webhookPayment })
  assert.equal(response.status, 200)
  // Activation delegated to the shared lib with pending + Asaas payment id
  assert.equal(h.activated.length, 1)
  assert.equal(h.activated[0].reg.email, 'aluno@example.com')
  assert.equal(h.activated[0].paymentId, 'pay_123')
  // Health ping recorded for the delivery
  assert.equal(h.pings.length, 1)
  assert.equal(h.pings[0].event, 'PAYMENT_RECEIVED')
  assert.equal(h.pings[0].paymentId, 'pay_123')
})

function ativarHarness() {
  const deleted = []
  const createdUser = []
  const createdToken = []
  const createdPayment = []
  const sync = []
  const sent = []
  const prisma = {
    $transaction: async (fn) => fn({
      user: { create: async ({ data }) => { createdUser.push(data); return { id: 'user-1', ...data } } },
      pendingRegistration: { delete: async ({ where }) => { deleted.push(where.id) } },
    }),
    verificationToken: { create: async ({ data }) => { createdToken.push(data) } },
    payment: { create: async ({ data }) => { createdPayment.push(data); return { id: 'pay-row' } } },
  }
  const { ativarRegistro } = load('lib/asaas/ativar.ts', {
    '@/lib/prisma': { prisma },
    '@/lib/access': { syncCourseAccess: async (input) => { sync.push(input) } },
    '@/lib/email': { emailEnabled: () => true, sendEmail: async (opts) => { sent.push(opts); return true }, verifyEmailTemplate: (link) => ({ subject: 'verify', html: `<a href="${link}">verify</a>` }) },
    '@/lib/email-verify': { newEmailToken: () => ({ token: 'raw-token', hash: 'hashed-token', expires: new Date() }), verifyEmailLink: (t) => `https://example.com/verify-email?token=${t}` },
  }, { process: { env: {} } })
  return { ativarRegistro, deleted, createdUser, createdToken, createdPayment, sync, sent }
}

test('ativarRegistro creates account, payment and verification email', async () => {
  const h = ativarHarness()
  const pending = { id: 'registration-test', name: 'Aluno Teste', email: 'aluno@example.com', password: '$2hash', plan: 'individual', value: 197 }
  const result = await h.ativarRegistro(pending, 'pay_123')
  // User created from pending registration data, no password leak in return
  assert.equal(h.createdUser.length, 1)
  assert.equal(h.createdUser[0].email, 'aluno@example.com')
  assert.equal(h.createdUser[0].password, '$2hash')
  assert.equal(h.createdUser[0].plan, 'individual')
  assert.equal(h.createdUser[0].role, 'student')
  assert.equal(result.userId, 'user-1')
  assert.equal(result.emailSent, true)
  // Pending registration consumed, access synced, payment recorded with Asaas id
  assert.deepEqual(h.deleted, ['registration-test'])
  assert.equal(h.sync[0].active, true)
  assert.equal(h.sync[0].plan, 'individual')
  assert.equal(h.createdPayment[0].asaasId, 'pay_123')
  assert.equal(h.createdPayment[0].status, 'paid')
  // Verification email issued with hashed token
  assert.equal(h.createdToken[0].token, 'hashed-token')
  assert.equal(h.sent.length, 1)
  assert.match(h.sent[0].html, /raw-token/)
})

test('webhook is idempotent when registration already processed', async () => {
  const h = webhookHarness({ pending: null })
  const response = await h.call({ event: 'PAYMENT_RECEIVED', payment: webhookPayment })
  assert.equal(response.status, 200)
  assert.equal(h.createdUser.length, 0)
})

test('webhook cleans pending when user already exists', async () => {
  const h = webhookHarness({ pending: { id: 'registration-test', name: 'Aluno', email: 'aluno@example.com', password: 'x', plan: 'individual', value: 197, asaasPaymentId: 'pay_123' }, existingUser: { id: 'user-existing' } })
  const response = await h.call({ event: 'PAYMENT_CONFIRMED', payment: webhookPayment })
  assert.equal(response.status, 200)
  assert.deepEqual(h.deleted, ['registration-test'])
  assert.equal(h.createdUser.length, 0)
})

function healthHarness(queryRaw) {
  return load('app/api/health/route.ts', {
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/lib/prisma': { prisma: { $queryRaw: queryRaw } },
  }, { process: { uptime: () => 1, env: { NODE_ENV: 'test' } } }).GET
}

test('health check reports database availability without exposing runtime details', async () => {
  const response = await healthHarness(async () => 1)()
  const body = await response.json()
  assert.equal(response.status, 200, JSON.stringify(body))
  assert.equal(body.status, 'ok')
  assert.equal(body.database, 'connected')
  assert.equal(Object.hasOwn(body, 'environment'), false)
})

test('health check hides database error details from public responses', async () => {
  const response = await healthHarness(async () => { throw new Error('postgres://private-host:5432/internal') })()
  const body = await response.json()
  assert.equal(response.status, 503)
  assert.equal(body.status, 'error')
  assert.equal(body.database, 'disconnected')
  assert.equal(JSON.stringify(body).includes('private-host'), false)
  assert.equal(Object.hasOwn(body, 'error'), false)
})