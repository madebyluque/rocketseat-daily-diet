import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (table) => {
    table.timestamp('created_at').defaultTo(knex.fn.now()).after('within_diet')
    table.timestamp('updated_at').after('created_at')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (table) => {
    table.dropColumns('created_at', 'updated_at')
  })
}
