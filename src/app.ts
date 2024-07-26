import fastify from 'fastify'
import { helloRoutes } from './routes/hello'
export const app = fastify()

app.register(helloRoutes, {
  prefix: 'hello',
})
