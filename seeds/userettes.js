var bcrypt = require('bcrypt');
var passwordHash = bcrypt.hashSync('password', 4);

exports.seed = function(knex, Promise) {
  return Promise.join(
    // Deletes ALL existing entries
    knex('users').del(),
    // Inserts seed entries
    knex('users').insert({name: 'Joe', email: 'joe@joe.joe', password_hash: passwordHash}),
    knex('users').insert({name: 'Kate', email: 'kate@kate.kate', password_hash: passwordHash}),
    knex('users').insert({name: 'Boomps', email: 'boomps@boomps.boomps', password_hash: passwordHash})
  );
};
