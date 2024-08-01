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

// TODO: add documentation
export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
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
      } catch (error) {
        console.log('Error: ', error)
        return reply.status(500).send({
          error:
            'It was not possible to create a meal due to an error. Try again later.',
        })
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
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
      } catch (error) {
        console.log('Error: ', error)
        return reply.status(500).send({
          error:
            'It was not possible to get meal due to an error. Try again later.',
        })
      }
    },
  )

  app.get(
    '/',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const { currentPage, pageSize } = getAllMealsRequest.parse(
          request.params,
        )

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
      } catch (error) {
        console.log('Error: ', error)
        return reply.status(500).send({
          error:
            'It was not possible to get meals due to an error. Try again later.',
        })
      }
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
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
      } catch (error) {
        console.log('Error: ', error)
        return reply.status(500).send({
          error:
            'It was not possible to update a meal due to an error. Try again later.',
        })
      }
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params)
        const { userId } = request.user

        const meal = await getMealById(id, userId)

        if (!meal) {
          reply.status(400).send()
        }

        await deleteMeal(id)

        reply.status(200).send()
      } catch (error) {
        console.log('Error: ', error)
        return reply.status(500).send({
          error:
            'It was not possible to delete meal due to an error. Try again later.',
        })
      }
    },
  )

  app.get(
    '/status',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      try {
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
      } catch (error) {
        console.log('Error: ', error)
        return reply.status(500).send({
          error:
            'It was not possible to get status due to an error. Try again later.',
        })
      }
    },
  )
}
