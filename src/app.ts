import fastify from 'fastify'
import { authRoutes } from './auth/routes/auth.routes'
import { fastifyJwt } from '@fastify/jwt'
import { env } from './env'
import { usersRoutes } from './users/routes/users.routes'
import { mealsRoutes } from './meals/routes/meals.routes'
import cors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import {
  swaggerOptions,
  swaggerUiOptions,
} from './configs/swagger/swagger.configs'
import { corsConfigs } from './configs/cors/cors.configs'

export const app = fastify()

app.register(fastifySwagger, swaggerOptions)
app.register(fastifySwaggerUi, swaggerUiOptions)

app.register(cors, corsConfigs)

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
