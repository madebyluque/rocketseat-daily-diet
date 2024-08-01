import { randomUUID } from 'crypto'
import { knex } from '../../database'

const table = 'diet_streaks'
export const increaseDietStreak = async (userId: string) => {
  const userCounter = await getDietStreak(userId)

  if (!userCounter) {
    throw new Error('It was not possible to increase diet streak counter')
  }

  userCounter.count++

  await knex(table).where('id', userCounter.id).update(userCounter)
}

export const resetDietStreak = async (userId: string) => {
  const userCounter = await getDietStreak(userId)

  if (!userCounter) {
    throw new Error('It was not possible to reset diet streak counter')
  }

  if (userCounter.count <= 0) {
    return
  }

  userCounter.active = false

  await knex(table).where('id', userCounter.id).update(userCounter)
}

export const getLongestDietStreak = async (userId: string) => {
  const maxCount =
    (
      await knex(table)
        .where('user_id', userId)
        .max('count', { as: 'count' })
        .first()
    )?.count ?? 0

  return maxCount
}

const getDietStreak = async (userId: string) => {
  let userCounter = await knex(table)
    .where('user_id', userId)
    .where('active', true)
    .first()

  if (!userCounter) {
    userCounter = {
      id: randomUUID(),
      user_id: userId,
      count: 0,
      active: true,
    }

    await knex(table).insert(userCounter)
  }

  return userCounter
}
