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
import { tags } from '../../configs/swagger/tags'

// TODO: add documentation
export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        tags: [tags.MEALS],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            datetime: { type: 'string', format: 'date-time' },
            withinDiet: { type: 'boolean' },
          },
        },
        security: [
          {
            Bearer: [],
          },
        ],
        response: {
          201: {
            description: 'Meal created successfully',
            type: 'null',
          },
          500: {
            description: 'Error',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { name, description, datetime, withinDiet } =
          createMealRequest.parse(request.body)
        const { sub } = request.user

        const meal: Meal = {
          id: randomUUID(),
          name,
          description,
          datetime,
          within_diet: withinDiet,
          user_id: sub,
        }
        await insertMeal(meal)

        if (meal.within_diet) {
          await increaseDietStreak(sub)
        } else {
          await resetDietStreak(sub)
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
      schema: {
        tags: [tags.MEALS],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        security: [
          {
            Bearer: [],
          },
        ],
        response: {
          200: {
            description: 'Meal found successfully',
            type: 'object',
            properties: {
              meal: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  datetime: { type: 'string', format: 'date-time' },
                  withinDiet: { type: 'number' },
                },
              },
            },
          },
          404: {
            description: 'Meal not found',
            type: 'null',
          },
          500: {
            description: 'Error',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params)
        const { sub } = request.user

        const meal = await getMealById(id, sub)

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
      schema: {
        tags: [tags.MEALS],
        security: [
          {
            Bearer: [],
          },
        ],
        response: {
          200: {
            description: 'Meals found successfully',
            type: 'object',
            properties: {
              meals: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    datetime: { type: 'string', format: 'date-time' },
                    withinDiet: { type: 'number' },
                  },
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  currentPage: { type: 'number' },
                  pageSize: { type: 'number' },
                  totalItems: { type: 'number' },
                  totalPages: { type: 'number' },
                },
              },
            },
          },
          500: {
            description: 'Error',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { currentPage, pageSize } = getAllMealsRequest.parse(
          request.params,
        )

        const { sub } = request.user

        const mealsPage = await getAllMeals(sub, pageSize, currentPage)

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
      schema: {
        tags: [tags.MEALS],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            datetime: { type: 'string', format: 'date-time' },
            withinDiet: { type: 'boolean' },
          },
        },
        security: [
          {
            Bearer: [],
          },
        ],
        response: {
          200: {
            description: 'Meal updated successfully',
            type: 'object',
            properties: {
              meal: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  datetime: { type: 'string', format: 'date-time' },
                  withinDiet: { type: 'number' },
                },
              },
            },
          },
          404: {
            description: 'Meal not found',
            type: 'null',
            properties: {
              error: { type: 'string' },
            },
          },
          500: {
            description: 'Error',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params)

        const { name, description, datetime, withinDiet } =
          updateMealrequest.parse(request.body)

        const { sub } = request.user

        const meal = await getMealById(id, sub)

        if (!meal) {
          return reply.status(404).send()
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
      schema: {
        tags: [tags.MEALS],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        security: [
          {
            Bearer: [],
          },
        ],
        response: {
          200: {
            description: 'Meal deleted successfully',
            type: 'null',
          },
          404: {
            description: 'Meal not found',
            type: 'null',
          },
          500: {
            description: 'Error',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params)
        const { sub } = request.user

        const meal = await getMealById(id, sub)

        if (!meal) {
          reply.status(404).send()
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
      schema: {
        tags: [tags.MEALS],
        security: [
          {
            Bearer: [],
          },
        ],
        response: {
          200: {
            description: 'Status calculated successfully',
            type: 'object',
            properties: {
              status: {
                type: 'object',
                properties: {
                  totalMeals: { type: 'number' },
                  totalMealsWithinDiet: { type: 'number' },
                  totalMealsOutsideDiet: { type: 'number' },
                  mealsWithinDietPercentage: { type: 'number' },
                  longestDietStreak: { type: 'number' },
                },
              },
            },
          },
          500: {
            description: 'Error',
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { sub } = request.user

        const status = await getStatus(sub)

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
