import { z } from 'zod'

export type Meal = {
  id: string
  name: string
  description: string
  datetime: string
  within_diet: boolean
  user_id: string
  updated_at?: string
}

export type MealDto = {
  id: string
  name: string
  description: string
  datetime: string
  within_diet: boolean
}

export const createMealRequest = z.object({
  name: z.string(),
  description: z.string(),
  datetime: z.string(),
  withinDiet: z.boolean(),
})

export const getAllMealsRequest = z.object({
  currentPage: z.number().optional().default(1),
  pageSize: z.number().optional().default(10),
})

export const updateMealrequest = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  datetime: z.string().optional(),
  withinDiet: z.boolean().optional(),
})

export type Status = {
  totalMeals: number
  totalMealsWithinDiet: number
  totalMealsOutsideDiet: number
  mealsWithinDietPercentage: number
}
