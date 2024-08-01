import { z } from 'zod'

export type User = {
  id: string
  name: string
  email: string
  password: string
  created_at: string
}

export const createUserRequest = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
})
