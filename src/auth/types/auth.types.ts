import { z } from 'zod'

export const authRequest = z.object({
  email: z.string().email(),
  password: z.string(),
})
