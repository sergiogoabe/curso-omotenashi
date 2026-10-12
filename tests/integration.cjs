// Real HTTP + PostgreSQL integration tests, isolated from the configured database.
// Requires initdb/pg_ctl on PATH and a completed npm run build. Stripe events
// are signed local fixtures; this does not test Stripe's external service.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const net = require('node:net')
const crypto = require('node:crypto')
const { spawn, spawnSync } = require('node:child_process')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')
const Stripe = require('stripe')

async function freePort() {
  const server = net.createServer()
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  await new Promise(resolve => server.close(resolve))
  return port
}
function command(name, args) {
  const result = spawnSync(name, args, { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`${name} failed: ${result.error?.message || result.stderr}`)
}
function quote(value) { return '"' + value.replaceAll('"', '""') + '"' }
// The fixture supports the scalar fields used by this repo's schema only.
// It is not a migration tool and never touches the configured database.
async function testSchema(db) {
  const types = { String: 'TEXT', DateTime: 'TIMESTAMP(3)', Boolean: 'BOOLEAN', Int: 'INTEGER', Float: 'DOUBLE PRECISION' }
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8')
  const models = [...schema.matchAll(/model\s+(\w+)\s*\{([^}]+)\}/g)]
  const relations = []
  for (const [, model, body] of models) {
    const columns = []
    for (const line of body.split('\n')) {
      const field = line.trim().match(/^(\w+)\s+(\w+)(\?|\[\])?\s*(.*)$/)
      if (!field) continue
      const [, name, type, modifier, attributes] = field
      if (!types[type]) {
        const relation = attributes.match(/@relation\(fields: \[([^\]]+)\], references: \[([^\]]+)\]/)
        if (relation) relations.push({ model, type, from: relation[1].split(',').map(s => s.trim()), to: relation[2].split(',').map(s => s.trim()) })
        continue
      }
      assert.notEqual(modifier, '[]', 'scalar arrays unsupported by fixture')
      let sql = `${quote(name)} ${types[type]}${modifier === '?' ? '' : ' NOT NULL'}`
      if (attributes.includes('@id')) sql += ' PRIMARY KEY'
      if (attributes.includes('@unique')) sql += ' UNIQUE'
      const value = attributes.match(/@default\(("[^"]*"|true|false|-?[0-9.]+|now\(\))\)/)?.[1]
      if (value === 'now()') sql += ' DEFAULT CURRENT_TIMESTAMP'
      else if (value?.startsWith('"')) sql += " DEFAULT '" + JSON.parse(value).replaceAll("'", "''") + "'"
      else if (value) sql += ` DEFAULT ${value}`
      columns.push(sql)
    }
    for (const [, fields] of body.matchAll(/@@unique\(\[([^\]]+)\]\)/g)) columns.push(`UNIQUE (${fields.split(',').map(s => quote(s.trim())).join(', ')})`)
    await db.$executeRawUnsafe(`CREATE TABLE ${quote(model)} (${columns.join(', ')})`)
  }
  for (const r of relations) {
    await db.$executeRawUnsafe(`ALTER TABLE ${quote(r.model)} ADD FOREIGN KEY (${r.from.map(quote).join(', ')}) REFERENCES ${quote(r.type)} (${r.to.map(quote).join(', ')})`)
  }
}

async function main() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'omotenashi-integration-'))
  const data = path.join(temp, 'postgres')
  const marker = crypto.randomUUID()
  fs.writeFileSync(path.join(temp, 'owner'), marker)
  const dbPort = await freePort()
  const appPort = await freePort()
  const base = `http://127.0.0.1:${appPort}`
  let db, server, pgStarted = false, passed = 0
  const ok = label => { passed++; console.log(`PASS ${label}`) }
  try {
    command('initdb', ['-D', data, '-U', 'hermes_test', '--auth=trust', '--no-locale'])
    command('pg_ctl', ['-D', data, '-l', path.join(temp, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${dbPort} -k ${temp}`, '-w', 'start'])
    pgStarted = true
    const databaseUrl = `postgresql://hermes_test@127.0.0.1:${dbPort}/postgres`
    db = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })
    await testSchema(db)
    const webhookSecret = 'whsec_local_integration_fixture'
    const stripe = new Stripe('sk_test_local_integration_fixture')
    server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(appPort)], {
      env: { ...process.env, DATABASE_URL: databaseUrl, NEXTAUTH_URL: base, NEXTAUTH_SECRET: crypto.randomBytes(32).toString('hex'), ADMIN_USERNAME: '', ADMIN_PASSWORD: '', STRIPE_SECRET_KEY: 'sk_test_local_integration_fixture', STRIPE_WEBHOOK_SECRET: webhookSecret, NODE_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let serverOutput = ''
    server.stdout.on('data', d => { serverOutput += d })
    server.stderr.on('data', d => { serverOutput += d })
    let ready = false
    for (let attempt = 0; attempt < 150; attempt++) {
      try { ready = (await fetch(`${base}/auth/login`)).ok } catch {}
      if (ready) break
      if (server.exitCode !== null) throw new Error(`Server exited: ${serverOutput}`)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    assert.ok(ready, 'server readiness')
    function client() {
      const cookies = new Map()
      return async (url, options = {}) => {
        const res = await fetch(base + url, { ...options, redirect: 'manual', headers: { ...options.headers, cookie: [...cookies].map(([k, v]) => `${k}=${v}`).join('; ') } })
        for (const cookie of res.headers.getSetCookie()) {
          const part = cookie.split(';')[0], eq = part.indexOf('=')
          cookies.set(part.slice(0, eq), part.slice(eq + 1))
        }
        return res
      }
    }
    const anon = client()
    const post = (http, url, body) => http(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    async function login(http, email, password) {
      const csrf = await (await http('/api/auth/csrf')).json()
      return http('/api/auth/callback/credentials', {
        method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ csrfToken: csrf.csrfToken, email, password, json: 'true', callbackUrl: base + '/dashboard' }).toString(),
      })
    }
    for (const url of ['/auth/login', '/auth/register']) {
      const res = await anon(url)
      assert.equal(res.status, 200)
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
      assert.ok((await res.text()).includes('<form'))
      ok(`HTML and security headers ${url}`)
    }
    const invalid = await post(anon, '/api/register', { name: {}, email: 'bad', password: 'a', plan: 'toString' })
    assert.equal(invalid.status, 400); ok('invalid registration rejected')
    const password = 'synthetic-test-password'
    const registration = await post(anon, '/api/register', { name: ' Aluno Teste ', email: ' ALUNO@example.com ', password, plan: 'individual' })
    assert.equal(registration.status, 200)
    const pix = await registration.json()
    assert.equal(pix.value, 197)
    assert.ok(pix.pixPayload.includes('5406197.00'))
    const pending = await db.pendingRegistration.findUnique({ where: { email: 'aluno@example.com' } })
    assert.equal(pending.name, 'Aluno Teste')
    assert.ok(await bcrypt.compare(password, pending.password))
    assert.notEqual(pending.password, password)
    assert.equal(await db.user.count(), 0)
    ok('real registration persists normalized data and bcrypt hash, not active user')
    assert.equal((await login(client(), 'aluno@example.com', password)).status, 401)
    ok('pending account cannot log in')
    await db.pendingRegistration.update({ where: { id: pending.id }, data: { activationCode: 'A1B2C3D4' } })
    assert.equal((await post(anon, '/api/ativar', { code: 'a1b2c3d4' })).status, 200)
    assert.equal(await db.pendingRegistration.count(), 0)
    assert.equal(await db.enrollment.count(), 1)
    ok('activation creates user and enrollment atomically')
    const student = client()
    assert.equal((await login(student, 'ALUNO@EXAMPLE.COM', password)).status, 200)
    const session = await (await student('/api/auth/session')).json()
    assert.equal(session.user.email, 'aluno@example.com')
    ok('real credentials login accepts email case and creates session')
    assert.equal((await login(client(), 'aluno@example.com', 'wrong-test-password')).status, 401)
    ok('incorrect password rejected')
    assert.equal((await post(student, '/api/enroll', { plan: 'combo' })).status, 403)
    ok('student cannot self-grant a paid enrollment')
    const category = await db.category.create({ data: { name: 'Teste', slug: 'teste' } })
    await db.lesson.create({ data: { title: 'Aula', slug: 'aula', description: 'Teste', content: 'CONTEUDO_PRIVADO', videoUrl: 'https://example.com/private', categoryId: category.id } })
    await db.ebookChapter.create({ data: { title: 'Capítulo', slug: 'capitulo', content: 'EBOOK_PRIVADO' } })
    const catalog = await (await anon('/api/lessons')).json()
    assert.equal(catalog.length, 1)
    assert.equal(catalog[0].content, undefined)
    assert.equal(catalog[0].videoUrl, undefined)
    assert.equal((await anon('/api/lessons?slug=aula')).status, 403)
    assert.equal((await anon('/api/ebook?slug=capitulo')).status, 403)
    assert.equal((await student('/api/lessons?slug=aula')).status, 200)
    ok('public catalog hides content; authorized student gets lesson')
    await db.enrollment.updateMany({ data: { expiresAt: new Date(0) } })
    assert.equal((await student('/api/lessons?slug=aula')).status, 403)
    assert.equal((await student('/api/ebook?slug=capitulo')).status, 403)
    assert.equal((await (await student('/api/enroll')).json()).enrollments.length, 0)
    ok('expired enrollment denies content in server and UI access endpoint')
    assert.equal((await anon('/api/forum/topics')).status, 403)
    assert.equal((await anon('/api/forum/posts?topicId=test')).status, 403)
    assert.equal((await anon('/api/seed')).status, 403)
    assert.equal((await anon('/api/seed-ebook')).status, 403)
    ok('forum and production seed endpoints protected')
    const paidPending = await db.pendingRegistration.create({ data: { name: 'Pagamento', email: 'paid@example.com', password: await bcrypt.hash(password, 12), plan: 'individual', value: 197 } })
    const checkout = { id: 'cs_test_localfixture', object: 'checkout.session', currency: 'brl', amount_total: 19700, payment_status: 'unpaid', metadata: { registrationId: paidPending.id } }
    await db.payment.create({ data: { checkoutId: checkout.id, email: paidPending.email, plan: 'individual', value: 197, paymentMethod: 'stripe' } })
    async function webhook(type) {
      const payload = JSON.stringify({ id: 'evt_localfixture', object: 'event', type, data: { object: checkout } })
      const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret })
      return anon('/api/stripe/webhook', { method: 'POST', body: payload, headers: { 'stripe-signature': signature, 'content-type': 'application/json' } })
    }
    assert.equal((await webhook('checkout.session.completed')).status, 200)
    assert.equal(await db.user.count({ where: { email: paidPending.email } }), 0)
    ok('signed unpaid Stripe fixture does not activate user')
    checkout.payment_status = 'paid'
    const confirmations = await Promise.all(Array.from({ length: 4 }, () => webhook('checkout.session.async_payment_succeeded')))
    assert.ok(confirmations.every(r => r.status === 200))
    const paidUser = await db.user.findUnique({ where: { email: paidPending.email } })
    assert.equal(await db.enrollment.count({ where: { userId: paidUser.id } }), 1)
    assert.equal((await db.payment.findUnique({ where: { checkoutId: checkout.id } })).status, 'completed')
    ok('concurrent signed payment fixtures grant exactly one enrollment in PostgreSQL')
    const admin = await db.user.create({ data: { email: 'admin-test@example.com', password: await bcrypt.hash(password, 12), role: 'admin' } })
    const adminClient = client()
    assert.equal((await login(adminClient, admin.email, password)).status, 200)
    const users = await (await adminClient('/api/admin/users')).json()
    assert.ok(users.users.every(u => !Object.hasOwn(u, 'password')))
    await db.user.update({ where: { id: admin.id }, data: { role: 'student' } })
    assert.equal((await adminClient('/api/admin/users')).status, 401)
    ok('admin responses exclude password; demotion revokes existing session privilege')
    console.log(`Integration checks passed: ${passed}. Isolated PostgreSQL; no external payment requests.`)
  } finally {
    if (server && server.exitCode === null) {
      server.kill('SIGTERM')
      await new Promise(resolve => server.once('exit', resolve))
    }
    if (db) await db.$disconnect()
    if (pgStarted) command('pg_ctl', ['-D', data, '-m', 'fast', '-w', 'stop'])
    const resolved = fs.realpathSync(temp)
    const root = fs.realpathSync(os.tmpdir())
    if (path.dirname(resolved) === root && path.basename(resolved).startsWith('omotenashi-integration-') && fs.readFileSync(path.join(resolved, 'owner'), 'utf8') === marker) {
      fs.rmSync(resolved, { recursive: true })
    }
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
