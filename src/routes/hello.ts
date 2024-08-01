import { FastifyInstance } from 'fastify'

export async function helloRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    reply.status(200).send({
      message: 'Hello, World!',
    })
  })
}
