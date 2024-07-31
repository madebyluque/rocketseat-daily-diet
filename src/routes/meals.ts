import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      datetime: z.string(),
      withinDiet: z.boolean(),
    })

    const { name, description, datetime, withinDiet } =
      createMealBodySchema.parse(request.body)

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      datetime,
      within_diet: withinDiet,
    })

    return reply.status(201).send()
  })

  app.get('/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params)
    const meal = await knex('meals').where('id', id).first()

    if (!meal) {
      reply.status(404).send()
    }

    reply.status(200).send({
      meal,
    })
  })

  // TODO: pagination
  app.get('/', async (_, reply) => {
    const meals = await knex('meals').select()

    reply.status(200).send({
      meals,
    })
  })

  app.put('/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params)

    const updateMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      datetime: z.string().optional(),
      withinDiet: z.boolean().optional(),
    })
    const { name, description, datetime, withinDiet } =
      updateMealBodySchema.parse(request.body)

    const meal = await knex('meals').where('id', id).first()

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

    await knex('meals').where('id', id).update(meal)

    reply.status(200).send({
      meal,
    })
  })

  app.delete('/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params)

    const meal = await knex('meals').where('id', id)

    if (!meal) {
      reply.status(404).send()
    }

    await knex('meals').where('id', id).delete()

    reply.status(200).send()
  })

  app.get('/status', async (_, reply) => {
    const totalMeals = (await knex('meals').count('*', { as: 'count' }))[0]
      .count

    const totalMealsWithinDiet = (
      await knex('meals').where('within_diet', true).count('*', { as: 'count' })
    )[0].count

    const totalMealsOutsideDiet = (
      await knex('meals')
        .where('within_diet', false)
        .count('*', { as: 'count' })
    )[0].count

    const mealsWithinDietPercentage =
      (Number(totalMealsWithinDiet) / Number(totalMeals)) * 100

    // TODO: longest meals inside of diet streak

    reply.status(200).send({
      totalMeals,
      totalMealsWithinDiet,
      totalMealsOutsideDiet,
      mealsWithinDietPercentage,
    })
  })

  const idParamSchema = z.object({
    id: z.string().uuid(),
  })
}
