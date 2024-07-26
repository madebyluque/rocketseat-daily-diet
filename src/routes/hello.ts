import { FastifyInstance } from 'fastify'

export async function helloRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    return { message: 'Hello, World!' }
  })
}
