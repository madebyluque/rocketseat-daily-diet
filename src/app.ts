import fastify from 'fastify'
import { helloRoutes } from './routes/hello'
import { mealsRoutes } from './routes/meals'
import { usersRoutes } from './routes/users'
import { authRoutes } from './routes/auth'
import { fastifyJwt } from '@fastify/jwt'
import { env } from './env'

export const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(helloRoutes, {
  prefix: 'hello',
})

app.register(mealsRoutes, {
  prefix: 'meals',
})

app.register(usersRoutes, {
  prefix: 'users',
})

app.register(authRoutes, {
  prefix: 'auth',
})
