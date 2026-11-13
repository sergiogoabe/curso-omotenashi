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

// Carrega o módulo no realm principal (sem vm): necessário para libs que
// validam tipos com `instanceof` (ex.: pdf-lib validando objetos de options).
function loadMainRealm(file, mocks = {}, globals = {}) {
  const module = { exports: {} }
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const requireShim = (name) => (Object.hasOwn(mocks, name) ? mocks[name] : require(name))
  const fn = new Function(
    'require', 'module', 'exports', 'process', 'Buffer', 'console', 'TextEncoder', 'URL', 'URLSearchParams',
    code
  )
  fn(
    requireShim,
    module,
    module.exports,
    globals.process ?? process,
    globals.Buffer ?? Buffer,
    globals.console ?? console,
    globals.TextEncoder ?? TextEncoder,
    globals.URL ?? URL,
    globals.URLSearchParams ?? URLSearchParams
  )
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

function webhookHarness({ tokenOk = true, pending = null, existingUser = null, pendingSelo = null, ativarError = null } = {}) {
  const deleted = []
  const createdUser = []
  const createdToken = []
  const createdPayment = []
  const sync = []
  const sent = []
  const activated = []
  const activatedSelo = []
  const pings = []
  const prisma = {
    pendingRegistration: {
      findFirst: async () => pending,
      delete: async ({ where }) => { deleted.push(where.id) },
    },
    pendingCertification: {
      findFirst: async () => pendingSelo,
    },
    user: { findUnique: async () => typeof existingUser === 'function' ? existingUser() : existingUser },
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
    '@/lib/asaas/ativar': { ativarRegistro: async (reg, paymentId) => {
      if (ativarError) throw ativarError
      activated.push({ reg, paymentId })
      return { userId: 'user-1', verifyLink: 'https://example.com/verify-email?token=t', emailSent: true }
    } },
    '@/lib/selo/ativar': { ativarCertificacao: async (pending, paymentId) => { activatedSelo.push({ pending, paymentId }); return { companyId: 'company-1', certificationId: 'cert-1', verifyCode: 'OMO-TEST-TEST' } } },
    '@/lib/email': { emailEnabled: () => true, sendEmail: async (opts) => { sent.push(opts); return true }, verifyEmailTemplate: (link) => ({ subject: 'verify', html: `<a href="${link}">verify</a>` }) },
    '@/lib/email-verify': { newEmailToken: () => ({ token: 'raw-token', hash: 'hashed-token', expires: new Date() }), verifyEmailLink: (t) => `https://example.com/verify-email?token=${t}` },
  }, { process: { env: {} } })
  const call = (payload, token = 'tok') => POST(new Request('http://localhost/api/webhooks/asaas', {
    method: 'POST',
    headers: { 'asaas-access-token': token },
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  }))
  return { call, deleted, createdUser, createdToken, createdPayment, sync, sent, activated, activatedSelo, pings }
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

function ativarHarness({ paymentError = null, enrollmentError = null } = {}) {
  const deleted = []
  const createdUser = []
  const createdToken = []
  const createdPayment = []
  const createdEnrollment = []
  const sync = []
  const sent = []
  const paymentCreate = async ({ data }) => {
    if (paymentError) throw paymentError
    createdPayment.push(data)
    return { id: 'pay-row' }
  }
  const enrollmentCreate = async ({ data }) => {
    if (enrollmentError) throw enrollmentError
    createdEnrollment.push(data)
    return { id: 'enroll-row' }
  }
  const prisma = {
    $transaction: async (fn) => fn({
      user: { create: async ({ data }) => { createdUser.push(data); return { id: 'user-1', ...data } } },
      pendingRegistration: { delete: async ({ where }) => { deleted.push(where.id) } },
      payment: { create: paymentCreate },
      enrollment: { create: enrollmentCreate },
    }),
    verificationToken: { create: async ({ data }) => { createdToken.push(data) } },
    payment: { create: paymentCreate },
  }
  const { ativarRegistro } = load('lib/asaas/ativar.ts', {
    '@/lib/prisma': { prisma },
    '@/lib/access': { syncCourseAccess: async (input) => { sync.push(input) } },
    '@/lib/email': { emailEnabled: () => true, sendEmail: async (opts) => { sent.push(opts); return true }, verifyEmailTemplate: (link) => ({ subject: 'verify', html: `<a href="${link}">verify</a>` }) },
    '@/lib/email-verify': { newEmailToken: () => ({ token: 'raw-token', hash: 'hashed-token', expires: new Date() }), verifyEmailLink: (t) => `https://example.com/verify-email?token=${t}` },
  }, { process: { env: {} } })
  return { ativarRegistro, deleted, createdUser, createdToken, createdPayment, createdEnrollment, sync, sent }
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
  // Pending registration consumed, enrollment created in the same transaction, payment recorded with Asaas id
  assert.deepEqual(h.deleted, ['registration-test'])
  assert.equal(h.createdEnrollment.length, 1)
  assert.equal(h.createdEnrollment[0].userId, 'user-1')
  assert.equal(h.createdEnrollment[0].plan, 'individual')
  assert.equal(h.createdEnrollment[0].active, true)
  assert.equal(h.createdUser[0].courseAccess, true)
  assert.equal(h.createdUser[0].coursePlan, 'individual')
  assert.equal(h.createdPayment[0].asaasId, 'pay_123')
  assert.equal(h.createdPayment[0].status, 'paid')
  // Verification email issued with hashed token
  assert.equal(h.createdToken[0].token, 'hashed-token')
  assert.equal(h.sent.length, 1)
  assert.match(h.sent[0].html, /raw-token/)
})

test('ativarRegistro nao engole falha ao registrar pagamento', async () => {
  const h = ativarHarness({ paymentError: new Error('payment db failed') })
  const pending = { id: 'registration-test', name: 'Aluno Teste', email: 'aluno@example.com', password: '$2hash', plan: 'individual', value: 197 }
  await assert.rejects(() => h.ativarRegistro(pending, 'pay_123'), /payment db failed/)
})

test('ativarRegistro nao engole falha ao criar matricula', async () => {
  const h = ativarHarness({ enrollmentError: new Error('enrollment db failed') })
  const pending = { id: 'registration-test', name: 'Aluno Teste', email: 'aluno@example.com', password: '$2hash', plan: 'individual', value: 197 }
  await assert.rejects(() => h.ativarRegistro(pending, 'pay_123'), /enrollment db failed/)
})

test('webhook is idempotent when registration already processed', async () => {
  const h = webhookHarness({ pending: null })
  const response = await h.call({ event: 'PAYMENT_RECEIVED', payment: webhookPayment })
  assert.equal(response.status, 200)
  assert.equal(h.createdUser.length, 0)
})

test('webhook responde 200 em reentrega concorrente quando a conta ja foi criada', async () => {
  let lookups = 0
  const h = webhookHarness({
    pending: { id: 'registration-test', name: 'Aluno', email: 'aluno@example.com', password: 'hash', plan: 'individual', value: 197, asaasPaymentId: 'pay_123' },
    existingUser: () => (++lookups === 1 ? null : { id: 'user-1' }),
    ativarError: { code: 'P2002', message: 'Unique constraint failed on User.email' },
  })
  const response = await h.call({ event: 'PAYMENT_RECEIVED', payment: webhookPayment })
  assert.equal(response.status, 200)
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
function cronHarness({ pendings = [], users = [], consultar = null, ping = null, pendingsSelo = [], vencidos = 0, vencendo = [] } = {}) {
  const activated = []
  const activatedSelo = []
  const sent = []
  const expired = []
  const prisma = {
    pendingRegistration: { findMany: async () => pendings },
    user: { findMany: async () => users },
    pendingCertification: { findMany: async () => pendingsSelo },
    certification: {
      updateMany: async (args) => { expired.push(args); return { count: vencidos } },
      findMany: async () => vencendo,
    },
    webhookPing: { findFirst: async () => ping },
  }
  const { GET } = load('app/api/cron/conciliacao/route.ts', {
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/lib/prisma': { prisma },
    '@/lib/asaas/asaas': { consultarPagamento: consultar ?? (async (id) => ({ id, status: 'PENDING', invoiceUrl: null })) },
    '@/lib/asaas/ativar': { ativarRegistro: async (reg, paymentId) => { activated.push({ reg, paymentId }); return { userId: 'user-1', verifyLink: 'https://example.com/verify?t=1', emailSent: true } } },
    '@/lib/selo/ativar': { ativarCertificacao: async (pending, paymentId) => { activatedSelo.push({ pending, paymentId }); return { companyId: 'company-1', certificationId: 'cert-1', verifyCode: 'OMO-TEST-TEST' } } },
    '@/lib/email': {
      emailEnabled: () => true,
      sendEmail: async (opts) => { sent.push(opts); return true },
      conciliacaoEmailTemplate: (resumo) => ({ subject: 'cron subject', html: `<pre>${JSON.stringify(resumo)}</pre>` }),
    },
  }, { process: { env: { CRON_SECRET: 'segredo-do-cron', ADMIN_ALERT_EMAIL: 'admin@example.com' } }, Buffer })
  const call = (token = 'segredo-do-cron') => GET(new Request('http://localhost/api/cron/conciliacao', {
    headers: token === null ? {} : { authorization: `Bearer ${token}` },
  }))
  return { call, activated, activatedSelo, sent, expired }
}

const cronPending = (email, paymentId = 'pay_9') => ({ id: 'reg-' + email, name: 'Aluno', email, plan: 'individual', value: 197, asaasPaymentId: paymentId })

test('cron conciliacao rejects requests without valid secret', async () => {
  for (const token of [null, 'errado']) {
    const h = cronHarness({ pendings: [cronPending('a@example.com')] })
    const response = await h.call(token)
    assert.equal(response.status, 401)
    assert.equal(h.activated.length, 0)
    assert.equal(h.sent.length, 0)
  }
})

test('cron conciliacao activates paid pending the webhook missed', async () => {
  const h = cronHarness({
    pendings: [cronPending('pago@example.com')],
    consultar: async (id) => ({ id, status: 'RECEIVED', invoiceUrl: null }),
    ping: { createdAt: new Date() },
  })
  const response = await h.call()
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(h.activated.length, 1)
  assert.equal(h.activated[0].paymentId, 'pay_9')
  assert.equal(body.ativados.length, 1)
  assert.equal(body.conferidos, 1)
  // Daily heartbeat email sent to the admin
  assert.equal(h.sent.length, 1)
  assert.equal(h.sent[0].to, 'admin@example.com')
})

test('cron conciliacao reports paid-with-existing-account instead of activating', async () => {
  const h = cronHarness({
    pendings: [cronPending('existente@example.com')],
    users: [{ email: 'Existente@example.com' }],
    consultar: async (id) => ({ id, status: 'CONFIRMED', invoiceUrl: null }),
  })
  const response = await h.call()
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(h.activated.length, 0)
  assert.deepEqual(body.conflitos, ['existente@example.com'])
})

test('cron conciliacao collects Asaas failures and still reports', async () => {
  const h = cronHarness({
    pendings: [cronPending('falha@example.com'), cronPending('ok@example.com', 'pay_10')],
    consultar: async (id) => { if (id === 'pay_9') throw new Error('Asaas indisponível'); return { id, status: 'PENDING', invoiceUrl: null } },
  })
  const response = await h.call()
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.erros.length, 1)
  assert.match(body.erros[0].motivo, /Asaas indisponível/)
  assert.equal(body.aguardando.length, 1)
  assert.equal(h.sent.length, 1)
})

// ---------------------------------------------------------------------------
// Selo Omotenashi
// ---------------------------------------------------------------------------

const { seloCheckoutSchema, isValidCnpj, SELO_TIERS, isSeloVencido } = load('./lib/selo.ts')

const seloValido = {
  companyName: 'Empresa Teste Ltda',
  email: '  CONTATO@EMPRESA.COM.BR ',
  cnpj: '11.222.333/0001-81',
  tier: 'ouro',
}

test('selo checkout normaliza email e CNPJ', () => {
  const parsed = seloCheckoutSchema.parse(seloValido)
  assert.equal(parsed.email, 'contato@empresa.com.br')
  assert.equal(parsed.cnpj, '11222333000181')
  assert.equal(parsed.tier, 'ouro')
})

test('selo checkout aceita CNPJ válido com e sem máscara', () => {
  assert.ok(isValidCnpj('11.222.333/0001-81'))
  assert.ok(isValidCnpj('11222333000181'))
  assert.equal(isValidCnpj('11222333000180'), false)
  assert.equal(isValidCnpj('11111111111111'), false)
  assert.equal(isValidCnpj('1122233300018'), false)
})

test('selo checkout rejeita entradas inválidas', () => {
  const casos = [
    ['nome curto', { ...seloValido, companyName: 'A' }],
    ['email inválido', { ...seloValido, email: 'nao-e-email' }],
    ['cnpj inválido', { ...seloValido, cnpj: '11222333000180' }],
    ['tier inexistente', { ...seloValido, tier: 'platina' }],
  ]
  for (const [label, input] of casos) {
    test(`selo checkout rejeita ${label}`, () => assert.equal(seloCheckoutSchema.safeParse(input).success, false))
  }
})

test('selo tiers cobrem os tres niveis com preco', () => {
  assert.deepEqual(Object.keys(SELO_TIERS), ['prata', 'ouro', 'diamante'])
  assert.equal(SELO_TIERS.prata.value, 1497)
  assert.equal(SELO_TIERS.ouro.value, 2497)
  assert.equal(SELO_TIERS.diamante.value, 3200)
})

test('selo vencido considera expiracao mesmo com status certificado', () => {
  assert.equal(isSeloVencido('certificado', new Date('2026-01-01'), new Date('2026-02-01')), true)
  assert.equal(isSeloVencido('certificado', new Date('2026-03-01'), new Date('2026-02-01')), false)
  assert.equal(isSeloVencido('vencido', null, new Date('2026-02-01')), true)
})

test('webhook ativa selo pendente quando o pagamento chega', async () => {
  const h = webhookHarness({
    pending: null,
    pendingSelo: { id: 'selo-1', companyName: 'Empresa Selo', email: 'selo@empresa.com.br', cnpj: '11222333000181', tier: 'ouro', value: 2497, asaasPaymentId: 'pay_selo' },
  })
  const response = await h.call({ event: 'PAYMENT_RECEIVED', payment: { id: 'pay_selo', externalReference: 'selo-1', value: 2497, status: 'RECEIVED' } })
  assert.equal(response.status, 200)
  assert.equal(h.activatedSelo.length, 1)
  assert.equal(h.activatedSelo[0].paymentId, 'pay_selo')
  assert.equal(h.activatedSelo[0].pending.companyName, 'Empresa Selo')
  // Curso nao e afetado pelo fluxo de selo
  assert.equal(h.activated.length, 0)
})

test('webhook ignora selo sem pending correspondente', async () => {
  const h = webhookHarness({ pending: null, pendingSelo: null })
  const response = await h.call({ event: 'PAYMENT_RECEIVED', payment: { id: 'pay_selo', externalReference: 'selo-1', value: 2497, status: 'RECEIVED' } })
  assert.equal(response.status, 200)
  assert.equal(h.activatedSelo.length, 0)
})

test('cron conciliacao ativa selo pago e expira certificados vencidos', async () => {
  const h = cronHarness({
    pendingsSelo: [{ id: 'selo-1', companyName: 'Empresa Selo', email: 'selo@empresa.com.br', cnpj: '11222333000181', tier: 'ouro', value: 2497, asaasPaymentId: 'pay_selo' }],
    consultar: async (id) => ({ id, status: 'RECEIVED', invoiceUrl: null }),
    vencidos: 2,
    vencendo: [{ id: 'cert-1', tier: 'prata', expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), company: { name: 'Empresa Selo' } }],
  })
  const response = await h.call()
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(h.activatedSelo.length, 1)
  assert.equal(body.selos.ativados.length, 1)
  assert.equal(body.selos.ativados[0].company, 'Empresa Selo')
  assert.equal(body.selos.vencidosHoje, 2)
  assert.equal(body.selos.vencendo.length, 1)
  assert.equal(body.selos.vencendo[0].dias, 10)
})

test('cron conciliacao marca selo nao pago como aguardando', async () => {
  const h = cronHarness({
    pendingsSelo: [{ id: 'selo-2', companyName: 'Empresa Selo', email: 'selo2@empresa.com.br', cnpj: null, tier: 'prata', value: 1497, asaasPaymentId: 'pay_selo_2' }],
    consultar: async (id) => ({ id, status: 'PENDING', invoiceUrl: null }),
  })
  const response = await h.call()
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(h.activatedSelo.length, 0)
  assert.equal(body.selos.aguardando.length, 1)
  assert.equal(body.selos.aguardando[0].status, 'PENDING')
})

test('cron registra erro de conciliation do selo sem travar o relatorio', async () => {
  const h = cronHarness({
    pendingsSelo: [{ id: 'selo-3', companyName: 'Empresa Selo', email: 'selo3@empresa.com.br', cnpj: null, tier: 'prata', value: 1497, asaasPaymentId: 'pay_selo_3' }],
    consultar: async () => { throw new Error('Asaas indisponível') },
  })
  const response = await h.call()
  const body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(body.erros.length, 1)
  assert.match(body.erros[0].email, /selo Empresa Selo/)
  assert.match(body.erros[0].motivo, /Asaas indisponível/)
})

function seloAtivarHarness({ company = null, paymentError = null } = {}) {
  const created = []
  const deleted = []
  const payments = []
  const certifications = []
  const tx = {
    company: {
      findUnique: async () => company,
      create: async ({ data }) => { created.push(data); return { id: 'company-1', ...data } },
    },
    certification: {
      create: async ({ data }) => { certifications.push(data); return { id: 'cert-1', ...data } },
    },
    pendingCertification: { delete: async ({ where }) => { deleted.push(where.id) } },
    payment: { create: async ({ data }) => {
      if (paymentError) throw paymentError
      payments.push(data)
      return { id: 'payment-1' }
    } },
  }
  const { ativarCertificacao } = load('lib/selo/ativar.ts', {
    '@/lib/prisma': { prisma: { $transaction: async (fn) => fn(tx) } },
    '@/lib/selo': { isSeloTier: (v) => ['prata', 'ouro', 'diamante'].includes(v) },
  }, { process: { env: {} }, Buffer })
  return { ativarCertificacao, created, deleted, payments, certifications }
}

test('ativarCertificacao cria empresa, certificacao e pagamento do selo', async () => {
  const h = seloAtivarHarness()
  const result = await h.ativarCertificacao(
    { id: 'selo-1', companyName: 'Empresa Selo', email: 'selo@empresa.com.br', cnpj: '11222333000181', tier: 'ouro', value: 2497 },
    'pay_selo'
  )
  assert.equal(h.created.length, 1)
  assert.equal(h.created[0].email, 'selo@empresa.com.br')
  assert.equal(h.certifications.length, 1)
  assert.equal(h.certifications[0].status, 'treinando')
  assert.equal(h.certifications[0].tier, 'ouro')
  assert.match(h.certifications[0].verifyCode, /^OMO-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
  assert.deepEqual(h.deleted, ['selo-1'])
  assert.equal(h.payments.length, 1)
  assert.equal(h.payments[0].plan, 'selo-ouro')
  assert.equal(h.payments[0].asaasId, 'pay_selo')
  assert.equal(h.payments[0].status, 'paid')
  assert.equal(result.companyId, 'company-1')
})

test('ativarCertificacao nao engole falha ao registrar pagamento', async () => {
  const h = seloAtivarHarness({ paymentError: new Error('payment db failed') })
  await assert.rejects(() => h.ativarCertificacao(
    { id: 'selo-3', companyName: 'Empresa Selo', email: 'selo3@empresa.com.br', cnpj: null, tier: 'prata', value: 1497 },
    'pay_selo_3'
  ), /payment db failed/)
})

test('ativarCertificacao reaproveita empresa ja existente', async () => {
  const h = seloAtivarHarness({ company: { id: 'company-9', name: 'Empresa Existente' } })
  await h.ativarCertificacao(
    { id: 'selo-2', companyName: 'Empresa Selo', email: 'selo@empresa.com.br', cnpj: null, tier: 'prata', value: 1497 },
    'pay_selo_2'
  )
  assert.equal(h.created.length, 0)
  assert.equal(h.certifications.length, 1)
})

function certificadoHarness({ certificado = null } = {}) {
  const prisma = {
    certification: {
      findUnique: async () => certificado,
    },
  }
  class MockNextResponse extends Response {
    static json(body, init) { return Response.json(body, init) }
  }
  const { GET } = loadMainRealm('app/api/certificados/[codigo]/route.ts', {
    'next/server': { NextResponse: MockNextResponse },
    '@/lib/prisma': { prisma },
    '@/lib/selo': { SELO_TIERS: { prata: { label: 'Selo Prata' }, ouro: { label: 'Selo Ouro' }, diamante: { label: 'Selo Diamante' } }, isSeloVencido },
  }, { process: { env: { NEXT_PUBLIC_APP_URL: 'https://exemplo.test' } }, Buffer })
  const call = () => GET(new Request('https://exemplo.test/api/certificados/OMO-TEST-TEST'), { params: Promise.resolve({ codigo: 'OMO-TEST-TEST' }) })
  return { call }
}

test('certificado PDF é emitido apenas para selos certificados', async () => {
  const valido = { id: 'cert-1', verifyCode: 'OMO-TEST-TEST', tier: 'ouro', status: 'certificado', issuedAt: new Date('2026-01-10'), expiresAt: new Date('2027-01-10'), company: { name: 'Empresa Selo' } }
  const h = certificadoHarness({ certificado: valido })
  const response = await h.call()
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('content-type'), 'application/pdf')
  assert.match(response.headers.get('content-disposition'), /certificado-omotenashi-OMO-TEST-TEST\.pdf/)
  const bytes = Buffer.from(await response.arrayBuffer())
  assert.equal(bytes.subarray(0, 4).toString(), '%PDF')
})

test('certificado PDF recusa selo ainda em treinamento', async () => {
  const h = certificadoHarness({ certificado: { id: 'cert-2', tier: 'prata', status: 'treinando', company: { name: 'Empresa Selo' } } })
  const response = await h.call()
  assert.equal(response.status, 404)
})

test('certificado PDF recusa selo expirado mesmo com status certificado', async () => {
  const h = certificadoHarness({ certificado: { id: 'cert-3', verifyCode: 'OMO-TEST-TEST', tier: 'ouro', status: 'certificado', issuedAt: new Date('2025-01-10'), expiresAt: new Date('2026-01-10'), company: { name: 'Empresa Selo' } } })
  const response = await h.call()
  assert.equal(response.status, 404)
})

test('certificado PDF devolve 404 para codigo inexistente', async () => {
  const h = certificadoHarness({ certificado: null })
  const response = await h.call()
  assert.equal(response.status, 404)
})

// ---------------------------------------------------------------------------
// Acesso ao curso (lib/course-access.ts)
// ---------------------------------------------------------------------------

function courseAccessHarness({ user, enrollments = [] }) {
  const now = new Date()
  const prisma = {
    user: { findFirst: async () => user },
    enrollment: {
      findFirst: async () => enrollments.find((e) => e.active && (!e.expiresAt || e.expiresAt > now)) ?? null,
      findMany: async () => enrollments,
    },
  }
  return load('./lib/course-access.ts', {
    'next-auth': { getServerSession: async () => ({ user: { email: 'aluno@example.com', role: 'student' } }) },
    '@/lib/auth': { authOptions: {} },
    '@/lib/prisma': { prisma },
    '@/lib/course-access-rule': load('./lib/course-access-rule.ts'),
  })
}

test('matricula expirada revoga acesso mesmo com flag de acesso ativa', async () => {
  const { hasCourseAccess } = courseAccessHarness({
    user: { id: 'u1', courseAccess: true, courseExpiresAt: null },
    enrollments: [{ active: true, expiresAt: new Date('2020-01-01') }],
  })
  assert.equal(await hasCourseAccess(), false)
})

test('matricula ativa sem prazo concede acesso', async () => {
  const { hasCourseAccess } = courseAccessHarness({
    user: { id: 'u1', courseAccess: true, courseExpiresAt: null },
    enrollments: [{ active: true, expiresAt: null }],
  })
  assert.equal(await hasCourseAccess(), true)
})

test('liberacao manual sem matricula usa a flag do usuario', async () => {
  const { hasCourseAccess } = courseAccessHarness({
    user: { id: 'u1', courseAccess: true, courseExpiresAt: null },
    enrollments: [],
  })
  assert.equal(await hasCourseAccess(), true)
})

test('flag de acesso expirada sem matricula nega acesso', async () => {
  const { hasCourseAccess } = courseAccessHarness({
    user: { id: 'u1', courseAccess: true, courseExpiresAt: new Date('2020-01-01') },
    enrollments: [],
  })
  assert.equal(await hasCourseAccess(), false)
})

test('regra de acesso: matricula vencida nega mesmo com flag ativa', () => {
  const { courseAccessFrom } = load('./lib/course-access-rule.ts')
  assert.equal(courseAccessFrom({ courseAccess: true, enrollments: [{ active: true, expiresAt: new Date('2020-01-01') }] }), false)
})

test('regra de acesso: matricula ativa sem prazo concede', () => {
  const { courseAccessFrom } = load('./lib/course-access-rule.ts')
  assert.equal(courseAccessFrom({ courseAccess: true, enrollments: [{ active: true, expiresAt: null }] }), true)
})

test('regra de acesso: sem matricula vale a flag do usuario', () => {
  const { courseAccessFrom } = load('./lib/course-access-rule.ts')
  assert.equal(courseAccessFrom({ courseAccess: true, enrollments: [] }), true)
  assert.equal(courseAccessFrom({ courseAccess: false, enrollments: [] }), false)
})

// ---------------------------------------------------------------------------
// GET /api/enroll — telas do curso/e-book usam o mesmo gate do servidor
// ---------------------------------------------------------------------------

function enrollRouteHarness({ hasAccess, enrollments = [] }) {
  const prisma = { user: { findFirst: async () => ({ enrollments }) } }
  const { GET } = load('./app/api/enroll/route.ts', {
    'next/server': { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
    'next-auth': { getServerSession: async () => ({ user: { email: 'aluno@example.com', role: 'student' } }) },
    '@/lib/auth': { authOptions: {} },
    '@/lib/prisma': { prisma },
    '@/lib/course-access': { hasCourseAccess: async () => hasAccess },
  })
  return GET
}

test('GET /api/enroll: liberacao manual (flag, sem matricula) aparece como acesso', async () => {
  const GET = enrollRouteHarness({ hasAccess: true, enrollments: [] })
  const res = await GET()
  assert.equal(res.body.hasAccess, true)
  assert.equal(res.body.enrollments.length, 0)
})

test('GET /api/enroll: matricula vencida nao e listada e nao concede acesso', async () => {
  const GET = enrollRouteHarness({ hasAccess: false, enrollments: [{ id: 'e1', active: true, expiresAt: new Date('2020-01-01') }] })
  const res = await GET()
  assert.equal(res.body.hasAccess, false)
  assert.equal(res.body.enrollments.length, 0)
})
