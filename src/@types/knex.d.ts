// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string
      name: string
      description: string
      datetime: string
      within_diet: boolean
      created_at: string
      updated_at: string
      user_id: string
    }
    user: {
      id: string
      name: string
      email: string
      password: string
    }
    diet_streaks: {
      id: string
      user_id: string
      count: number
      active: boolean
    }
  }
}
