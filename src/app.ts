import fastify from 'fastify'
import { helloRoutes } from './routes/hello'
import { mealsRoutes } from './routes/meals'
import { usersRoutes } from './routes/users'
export const app = fastify()

app.register(helloRoutes, {
  prefix: 'hello',
})

app.register(mealsRoutes, {
  prefix: 'meals',
})

app.register(usersRoutes, {
  prefix: 'users',
})
