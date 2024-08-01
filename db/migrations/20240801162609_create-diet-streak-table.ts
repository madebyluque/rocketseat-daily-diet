import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('diet_streaks', (table) => {
    table.uuid('id').primary()
    table
      .uuid('user_id')
      .notNullable()
      .index()
      .references('id')
      .inTable('users')
    table.bigInteger('count').defaultTo(0).notNullable()
    table.boolean('active').defaultTo(false).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('diet_streaks')
}
