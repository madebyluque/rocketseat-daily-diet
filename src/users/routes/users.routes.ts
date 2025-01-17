import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { hash } from 'bcrypt'
import { knex } from '../../database'
import { createUserRequest, User } from '../types/users.types'
import { tags } from '../../configs/swagger/tags'

export async function usersRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      schema: {
        tags: [tags.USERS],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
          },
        },
        response: {
          201: {
            type: 'null',
            description: 'User created successfully',
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

        reply.status(201).send()
      } catch (error) {
        console.log('Error: ', error)
        return reply.status(500).send({
          error:
            'It was not possible to create user due to an error. Try again later.',
        })
      }
    },
  )
}
