import { app } from './app'

app.listen({ port: 5555 }).then(() => {
  console.log('Http server is running!')
})
