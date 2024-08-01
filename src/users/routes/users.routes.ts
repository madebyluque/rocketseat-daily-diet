import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { hash } from 'bcrypt'
import { knex } from '../../database'
import { createUserRequest, User } from '../types/users.types'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const { name, email, password } = createUserRequest.parse(request.body)

    const hashedPassword = await hash(password, 10)

    const user: User = {
      id: randomUUID(),
      name,
      email,
      password: hashedPassword,
      created_at: new Date().toISOString(),
    }

    await knex('users').insert(user)

    reply.status(200).send()
  })
}
