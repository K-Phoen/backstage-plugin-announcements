// @ts-check

/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.alterTable('announcements', table => {
    table
      .boolean('sticky')
      .comment('Determines if the announcement is shown always');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.alterTable('announcements', table => {
    table.dropColumn('sticky');
  });
};
