import { FastifyInstance } from 'fastify'
import { knex } from '../../database'
import { compare } from 'bcrypt'
import { authRequest } from '../types/auth.types'
import { tags } from '../../configs/swagger/tags'

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      schema: {
        tags: [tags.AUTH],
        body: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            description: 'Token created',
            type: 'object',
            properties: {
              token: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { email, password } = authRequest.parse(request.body)

        const user = await knex('users').where('email', email).first()

        if (!user) {
          return reply.status(400).send({
            error: `It was not possible to find a user with the informed e-mail`,
          })
        }

        const authenticated = await compare(password, user.password)

        if (!authenticated) {
          return reply.status(401).send({
            error: `Unauthorized`,
          })
        }

        const token = app.jwt.sign(
          {
            userId: user.id,
          },
          { expiresIn: '60m' },
        )

        reply.status(200).send({
          token,
        })
      } catch (error) {
        console.log(error)
        reply.status(500).send({
          error: 'It was not possible to authenticate',
        })
      }
    },
  )
}
