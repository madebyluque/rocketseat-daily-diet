import { expect, afterAll, it, beforeEach, beforeAll } from 'vitest'
import { app } from '../../app'
import request from 'supertest'
import { execSync } from 'node:child_process'
import { getLongestDietStreak } from '../../shared/repositories/diet_streak.repository'
import { knex } from '../../database'

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

it('- should be able to create a new meal', async () => {
  await createTestUser()
  const token = await authenticate()

  const response = await request(app.server)
    .post('/meals')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'cafe da manha',
      description: 'pao+leite',
      datetime: '2024-07-30 08:00:00',
      withinDiet: true,
    })

  expect(response.status).toBe(201)
})

it('- should be able to increase diet streak when a meal is within diet', async () => {
  const user = await createTestUser()
  const token = await authenticate()
  await createTestMeal(token)

  const dietStreak = await getLongestDietStreak(user.id)

  expect(dietStreak).toBe(1)
})

it('- should be able to reset diet streak when a meal is not within diet', async () => {
  const user = await createTestUser()
  const token = await authenticate()
  await createTestMeal(token)
  await createTestMeal(token)
  await createTestMeal(token)
  let longestDietStreak = await getLongestDietStreak(user.id)
  expect(longestDietStreak).toBe(3)

  await createTestMeal(token, false)

  await createTestMeal(token, true)
  await createTestMeal(token, true)

  longestDietStreak = await getLongestDietStreak(user.id)

  expect(longestDietStreak).toBe(3)
})

it('- should be able to gel all meals', async () => {
  await createTestUser()
  const token = await authenticate()
  await createTestMeal(token)
  await createTestMeal(token)
  await createTestMeal(token)

  const response = await request(app.server)
    .get('/meals')
    .set('Authorization', `Bearer ${token}`)

  expect(response.status).toBe(200)

  const { meals } = response.body
  expect(meals.length).toBe(3)
})

it('should be able to get a meal by its id', async () => {
  await createTestUser()
  const token = await authenticate()
  const meal = await createTestMeal(token)

  expect(meal).toBeDefined()

  const response = await request(app.server)
    .get(`/meals/${meal?.id}`)
    .set('Authorization', `Bearer ${token}`)

  expect(response.status).toBe(200)
  expect(response.body.meal).toEqual(
    expect.objectContaining({
      name: 'cafe da manha',
      description: 'pao+leite',
      datetime: '2024-07-30 08:00:00',
      withinDiet: 1,
    }),
  )
})

it('should return 404 when meal is not found', async () => {
  await createTestUser()
  const token = await authenticate()
  await createTestMeal(token)

  const response = await request(app.server)
    .get(`/meals/b4867f0a-42e2-4464-960d-cc5ae5272073`)
    .set('Authorization', `Bearer ${token}`)

  expect(response.status).toBe(404)
})

it('should be able to delete a meal by its id', async () => {
  await createTestUser()
  const token = await authenticate()
  const meal = await createTestMeal(token)

  expect(meal).toBeDefined()

  const response = await request(app.server)
    .delete(`/meals/${meal?.id}`)
    .set('Authorization', `Bearer ${token}`)

  expect(response.status).toBe(200)
})

it('should be able to update a meal by its id', async () => {
  await createTestUser()
  const token = await authenticate()
  const meal = await createTestMeal(token)
  const newMealName = 'cafe da tarde'

  expect(meal).toBeDefined()

  const response = await request(app.server)
    .put(`/meals/${meal?.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: newMealName,
    })

  expect(response.status).toBe(200)
  expect(response.body.meal).toEqual(
    expect.objectContaining({
      name: newMealName,
      description: meal?.description,
      datetime: meal?.datetime,
      withinDiet: meal?.within_diet,
    }),
  )
})

it('should return 400 when meal is not found while trying to update it', async () => {
  await createTestUser()
  const token = await authenticate()
  await createTestMeal(token)

  const response = await request(app.server)
    .put(`/meals/b4867f0a-42e2-4464-960d-cc5ae5272072`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'test name',
    })

  expect(response.status).toBe(400)
})

it('should be able to delete a meal by its id', async () => {
  await createTestUser()
  const token = await authenticate()
  const meal = await createTestMeal(token)

  expect(meal).toBeDefined()

  const response = await request(app.server)
    .delete(`/meals/${meal?.id}`)
    .set('Authorization', `Bearer ${token}`)

  expect(response.status).toBe(200)
})

it('should return 400 when meal is not found while trying to delete it', async () => {
  await createTestUser()
  const token = await authenticate()
  await createTestMeal(token)

  const response = await request(app.server)
    .delete(`/meals/b4867f0a-42e2-4464-960d-cc5ae5272072`)
    .set('Authorization', `Bearer ${token}`)

  expect(response.status).toBe(400)
})

it('should be able to get status', async () => {
  await createTestUser()
  const token = await authenticate()
  await createTestMeal(token)
  await createTestMeal(token)
  await createTestMeal(token)
  await createTestMeal(token, false)

  const response = await request(app.server)
    .get(`/meals/status`)
    .set('Authorization', `Bearer ${token}`)

  expect(response.status).toBe(200)
  const { status } = response.body

  expect(status).toEqual(
    expect.objectContaining({
      totalMeals: 4,
      totalMealsWithinDiet: 3,
      totalMealsOutsideDiet: 1,
      mealsWithinDietPercentage: 75,
      longestDietStreak: 3,
    }),
  )
})

const createTestUser = async () => {
  await request(app.server).post('/users').send({
    name: 'Tester Tester',
    email: 'tester@tester.com',
    password: '123456',
  })

  return await knex('users').where('email', 'tester@tester.com').first()
}

const authenticate = async () => {
  const authenticationRequest = {
    email: 'tester@tester.com',
    password: '123456',
  }

  const response = await request(app.server)
    .post('/auth')
    .send(authenticationRequest)
  expect(response.statusCode).toBe(200)

  return response.body.token
}

const createTestMeal = async (token: string, withinDiet = true) => {
  const testMealResponse = await request(app.server)
    .post('/meals')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'cafe da manha',
      description: 'pao+leite',
      datetime: '2024-07-30 08:00:00',
      withinDiet,
    })

  expect(testMealResponse.status).toBe(201)

  const meal = await knex('meals')
    .where('description', 'pao+leite')
    .select()
    .first()

  return meal
}
