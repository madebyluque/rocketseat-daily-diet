export const swaggerOptions = {
  swagger: {
    info: {
      title: 'Daily Diet',
      description: 'Rocketseat nodejs challenge.',
      version: '1.0.0',
    },
    host: 'localhost:3333',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'Meals', description: 'All meals routes' },
      { name: 'Users', description: 'All users routes' },
      { name: 'Auth', description: 'All authentication routes' },
    ],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Enter JWT token in the format: Bearer {your token here}',
      },
    },
  },
}

export const swaggerUiOptions = {
  routePrefix: '/api-docs',
  exposeRoute: true,
}
