import fastify from 'fastify'
import { authRoutes } from './auth/auth.routes'
import { fastifyJwt } from '@fastify/jwt'
import { env } from './env'
import { usersRoutes } from './users/routes/users.routes'
import { mealsRoutes } from './meals/routes/meals.routes'
import cors from '@fastify/cors'

export const app = fastify()

app.register(cors, {
  origin: [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:3000',
  ],
  methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
})

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
