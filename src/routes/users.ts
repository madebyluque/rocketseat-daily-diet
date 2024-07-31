import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { hash } from 'bcrypt'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    })

    const { name, email, password } = createUserBodySchema.parse(request.body)

    const hashedPassword = await hash(password, 10)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
      created_at: new Date(),
    })

    reply.status(200).send()
  })
}
