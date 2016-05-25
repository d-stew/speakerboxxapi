
exports.up = function(knex, Promise) {
  return knex.schema.createTable('phrases_categories', function(table) {
    table.integer('category_id').references('id').inTable('categories').onDelete('CASCADE').onUpdate('CASCADE');
    table.integer('phrase_id').references('id').inTable('phrases').onDelete('CASCADE').onUpdate('CASCADE');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('phrases_categories')
};
