
exports.up = function(knex, Promise) {
  return knex.schema.createTable('categories', function(table) {
      table.increments();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
      table.string('name');
      table.string('description').defaultTo(null);
    })
    .createTable('phrases', function(table) {
        table.increments();
        table.string('phrase');
        table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
      })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('categories').dropTable('phrases')
};
