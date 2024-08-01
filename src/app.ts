import fastify from 'fastify'
import { authRoutes } from './auth/auth.routes'
import { fastifyJwt } from '@fastify/jwt'
import { env } from './env'
import { usersRoutes } from './users/routes/users.routes'
import { mealsRoutes } from './meals/routes/meals.routes'

export const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
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
