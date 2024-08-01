import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { compare } from 'bcrypt'

export async function authRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const authBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = authBodySchema.parse(request.body)

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
  })
}
