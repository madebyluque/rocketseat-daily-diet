import { knex } from '../../database'
import { getLongestDietStreak } from '../../shared/repositories/diet_streak.repository'
import { Meal } from '../types/meals.types'

const table = 'meals'

export const insertMeal = async (meal: Meal) => {
  await knex(table).insert(meal)
}

export const getMealById = async (
  id: string,
  userId: string,
): Promise<Meal | undefined> => {
  return await knex(table).where('id', id).where('user_id', userId).first()
}

export const getAllMeals = async (
  userId: string,
  pageSize: number,
  currentPage: number,
) => {
  return await knex(table).where('user_id', userId).paginate({
    perPage: pageSize,
    currentPage,
  })
}

export const updateMeal = async (meal: Meal) => {
  await knex(table).where('id', meal.id).update(meal)
}

export const deleteMeal = async (id: string) => {
  await knex(table).where('id', id).delete()
}

export const getStatus = async (userId: string) => {
  const totalMeals = (
    await knex('meals').where('user_id', userId).count('*', { as: 'count' })
  )[0].count

  if (!totalMeals || totalMeals === 0) {
    return {
      totalMeals: 0,
      totalMealsWithinDiet: 0,
      totalMealsOutsideDiet: 0,
      mealsWithinDietPercentage: 0,
    }
  }

  const totalMealsWithinDiet = (
    await knex('meals')
      .where('user_id', userId)
      .where('within_diet', true)
      .count('*', { as: 'count' })
  )[0].count

  const totalMealsOutsideDiet = (
    await knex('meals')
      .where('user_id', userId)
      .where('within_diet', false)
      .count('*', { as: 'count' })
  )[0].count

  const mealsWithinDietPercentage = +Math.round(
    (Number(totalMealsWithinDiet) / Number(totalMeals)) * 100,
  ).toFixed(2)

  const longestDietStreak = await getLongestDietStreak(userId)

  return {
    totalMeals,
    totalMealsWithinDiet,
    totalMealsOutsideDiet,
    mealsWithinDietPercentage,
    longestDietStreak,
  }
}
