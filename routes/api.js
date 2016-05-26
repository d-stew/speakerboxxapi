var express = require('express');
var router = express.Router();
var knex = require('../db/knex');
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function checkUser (data) {
  return knex('users').where(data).first()
    .then(function (author) {
      return author
    })
}

function checkToken (req,res,next){
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    knex('users').where({id: payload.id}).first().then(function (user) {
      if (user) {
        delete user.password_hash;
        res.status(200).json({user})
      } else {
        res.status(403).json({
          error: "Invalid ID"
        })
      }
    })
  } else {
      res.status(403).json({
        error: "No token"
      })
    }
}

router.get('/me', checkToken);
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.status(222).json('Setup your SPA');
});

router.post('/signup', function(req, res, next) {
  console.log(req.body);
  var errors = [];

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

          return knex('users').insert(data)
             .returning('*')
             .then(function (userObj) {
               console.log(userObj[0]);
               delete userObj[0].password_hash;
               if (userObj[0].id){
                      res.json({
                        token: jwt.sign({ id: userObj[0].id }, process.env.JWT_SECRET),
                        user: userObj[0]
                      });
                    } else {
                      res.status(422).json('shit')
                    }
                  })
                }
          else {
           return knex('users')
            .whereRaw('lower(email) = ?', req.body.email.toLowerCase())
            .first()
            .then(function (result) {
              if (result) {
                console.log("theres an email" + result);
                var validPassword = bcrypt.compareSync(req.body.password, result.password_hash);
                if (validPassword) {
                  res.status(422).json({error: "Email taken"})
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

router.post('/login', function(req, res, next) {
  return knex('users')
    .where({email: req.body.email})
    .first()
    .then(function (result) {
      if (result) {
        if (bcrypt.compareSync(req.body.password, result.password_hash)) {
          delete result.password_hash
          res.json({user: result, token: jwt.sign({ id: result.id }, process.env.JWT_SECRET)})
        } else {
          res.status(422).send({error: 'No Bueno'})
        }
      } else {
        res.status(422).send({error: 'No Bueno'})
      }
    })
});

router.post('/phrases', function(req, res, next) {
  return knex('phrases')
  .insert({phrase: req.body.phrase, user_id: req.body.user_id})
  .returning("*")
  .then(function(stuff) {
    if(stuff) {
      res.status(200).json({stuff});
    } else {
      res.status(404).json({error: 'wait wut'})
    }
  })
})
router.get('/phrases/:user_id', function(req, res, next) {
  return knex('phrases')
  .where({user_id: req.params.user_id})
  .then(function(phrases) {
    if(phrases) {
      res.status(200).json({phrases});
    } else {
      res.status(404).json({error: 'wait wut'})
    }
  })
})

router.get('/phrases', function(req, res, next) {
  return knex('phrases')
  .then(function(phrases){
    if(phrases){
      res.status(200).json({phrases});
    } else {
      res.status(404).json({error: 'wait wut'})
    }
  })
});

router.post('/categories', function(req, res, next) {
  return knex('categories')
  .insert({user_id: req.body.user_id, name: req.body.name,
          description: req.body.description})
  .returning("*")
  .then(function(cats) {
    if (cats) {
      res.status(200).json({cats});
    } else {
      res.status(404).json({error: `That's a fucking error`})
    }
  })
});

router.post('/categories/:user_id', function(req, res, next) {
  return knex('categories')
  .where({user_id: req.params.user_id})
  .then(function(cats) {
    if(cats){
    for (var i = 0; i < cats.length; i++) {
      console.log(cats[i]);
      if(req.body.category_id === cats[i].id) {
        return knex('phrases_categories')
        .insert({category_id: req.body.category_id, phrase_id: req.body.phrase_id})
        .returning("*")
        .then(function(cats) {
          if (cats) {
            res.status(200).json({cats});
          } else {
            res.status(404).json({error: `That's a fucking error`})
          }
        })
      }
    }
    res.status(422).json({error: "u dont own eet"})
  } else {
    res.status(422).json({error: "fuck off already"})
  }
  })
});

router.get('/categories/:id', function(req, res, next) {
  var isUser = req.params.id;
  var categoryList;
  knex('categories')
    .then(function(categoriesReturn) {
      categoryList = categoriesReturn;
    }).then(function() {
      knex('categories').where({
          user_id: req.params.id
        })
        .reduce(function(category_arr, category) {
          return knex('phrases')
            .innerJoin('phrases_categories', 'phrases.id', 'phrases_categories.phrase_id')
            .where({
              category_id: category.id
            })
            .reduce(function(phrase_arr, phrase) {
              phrase_arr.push(phrase);
              return phrase_arr;
            }, []).then(function(phrases) {
              category.phrases = phrases;
              category_arr.push(category);
              return category_arr;
            })
        }, [])
        .then(function(categories) {
          console.log("cats", categories);
          console.log("cat list", categoryList);
          res.status(200).json({
            categoriesBody: categories,
            categories: categoryList,
            userID: isUser
          });
        })
    })
});

module.exports = router;
