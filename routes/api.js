var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var bcrypt = require('bcrypt');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.status(222).json('Setup your SPA');
});

router.post('/signup', function(req, res, next) {
  var errors = []

  if (!req.body.email || !req.body.email.trim()) errors.push("Email can't be blank");
  if (!req.body.name || !req.body.name.trim()) errors.push("Name can't be blank");
  if (!req.body.password || !req.body.password.trim()) errors.push("Password can't be blank");

  if (errors.length) {
    console.log(errors);
    res.status(422).json({
      errors: errors
    })
  } else {

    knex('users')
      .whereRaw('lower(email) = ?', req.body.email.toLowerCase())
      .count()
      .first()
      .then(function (result) {
         if (result.count === "0") {
           var saltRounds = 4;
           var passwordHash = bcrypt.hashSync(req.body.password, saltRounds);

           var data = {
             name: req.body.name,
             email: req.body.email,
             password_hash: passwordHash,
           }

           knex('users').insert(data)
             .returning('*')
             .then(function (users) {
               console.log(users);
               res.redirect('/')
             })

         } else {
           return knex('users')
            .whereRaw('lower(email) = ?', req.body.email.toLowerCase())
            .first()
            .then(function (result) {
              if (result) {
                console.log("theres an email" + result);
                var validPassword = bcrypt.compareSync(req.body.password, result.password_hash);
                if (validPassword) {
                  res.redirect('/')
                }
                else {
                  console.log(validPassword + "valid password was false");
                }
              } else {
                res.status(422).json({
                  errors: ["Invalid email"]
                })
              }
          })
        }
      })
  }
});

module.exports = router;
