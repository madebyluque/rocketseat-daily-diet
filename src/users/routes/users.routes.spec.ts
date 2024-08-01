import { expect, beforeAll, afterAll, it, beforeEach } from 'vitest'
import { app } from '../../app'
import request from 'supertest'
import { execSync } from 'node:child_process'

beforeAll(async () => {
  await app.ready()
})

beforeEach(() => {
  execSync('npm run knex -- migrate:rollback --all')
  execSync('npm run knex -- migrate:latest')
})

afterAll(async () => {
  await app.close()
})

it('- should be able to create a new user', async () => {
  const response = await request(app.server).post('/users').send({
    name: 'Tester Tester',
    email: 'tester@tester.com',
    password: '123456',
  })

  expect(response.statusCode).toEqual(201)
})
