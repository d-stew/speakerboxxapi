exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table){
    table.increments('id');
    table.string('name');
    table.string('email');
    table.string('password_hash');
    table.integer('themes').references('id').inTable('themes').onDelete('CASCADE').onUpdate('CASCADE');
    table.string('nickname').defaultTo(null);
    table.string('portrait_url').defaultTo(null);
    table.boolean('admin').defaultTo('false');
    table.timestamp('created_at').defaultTo(knex.raw('now()'));
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
