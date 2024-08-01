import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { authenticate } from '../../middlewares/authenticate'
import {
  deleteMeal,
  getAllMeals,
  getMealById,
  getStatus,
  insertMeal,
  updateMeal,
} from '../repositories/meals.repository'
import {
  createMealRequest,
  getAllMealsRequest,
  Meal,
  MealDto,
  updateMealrequest,
} from '../types/meals.types'
import { idParamSchema } from '../../shared/types/shared.types'
import {
  increaseDietStreak,
  resetDietStreak,
} from '../../shared/repositories/diet_streak.repository'

// TODO: improve error handling
// TODO: add documentation
export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { name, description, datetime, withinDiet } =
        createMealRequest.parse(request.body)
      const { userId } = request.user

      const meal: Meal = {
        id: randomUUID(),
        name,
        description,
        datetime,
        within_diet: withinDiet,
        user_id: userId,
      }
      await insertMeal(meal)

      if (meal.within_diet) {
        await increaseDietStreak(userId)
      } else {
        await resetDietStreak(userId)
      }

      return reply.status(201).send()
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { id } = idParamSchema.parse(request.params)
      const { userId } = request.user

      const meal = await getMealById(id, userId)

      if (!meal) {
        return reply.status(404).send()
      }

      const mealDto: MealDto = {
        id: meal.id,
        name: meal.name,
        description: meal.description,
        datetime: meal.datetime,
        withinDiet: meal.within_diet,
      }

      reply.status(200).send({
        meal: mealDto,
      })
    },
  )

  app.get(
    '/',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { currentPage, pageSize } = getAllMealsRequest.parse(request.params)

      const { userId } = request.user

      const mealsPage = await getAllMeals(userId, pageSize, currentPage)

      const dtos: MealDto[] = mealsPage.data.map((meal) => ({
        id: meal.id,
        name: meal.name,
        description: meal.description,
        datetime: meal.datetime,
        withinDiet: meal.within_diet,
      }))

      reply.status(200).send({
        meals: dtos,
        pagination: mealsPage.pagination,
      })
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { id } = idParamSchema.parse(request.params)

      const { name, description, datetime, withinDiet } =
        updateMealrequest.parse(request.body)

      const { userId } = request.user

      const meal = await getMealById(id, userId)

      if (!meal) {
        return reply.status(400).send({
          error: `No meal with the id ${id} has been found.`,
        })
      }

      if (name) {
        meal.name = name
      }

      if (description) {
        meal.description = description
      }

      if (datetime) {
        meal.datetime = datetime
      }

      if (withinDiet) {
        meal.within_diet = withinDiet
      }

      meal.updated_at = new Date().toISOString()

      await updateMeal(meal)

      const dto: MealDto = {
        id: meal.id,
        name: meal.name,
        description: meal.description,
        datetime: meal.datetime,
        withinDiet: meal.within_diet,
      }

      reply.status(200).send({
        meal: dto,
      })
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { id } = idParamSchema.parse(request.params)
      const { userId } = request.user

      const meal = await getMealById(id, userId)

      if (!meal) {
        reply.status(400).send()
      }

      await deleteMeal(id)

      reply.status(200).send()
    },
  )

  app.get(
    '/status',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { userId } = request.user

      const status = await getStatus(userId)

      if (!status) {
        reply.status(500).send({
          error: 'It was not possible to get status due to an error.',
        })
      }

      reply.status(200).send({
        status,
      })
    },
  )
}
