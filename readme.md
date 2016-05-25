AAC App
=======
####( Augmentative and Alternative Communication )

[Live Demo](https://speak-easy-demo.herokuapp.com/)

__Install the things__
```bash
$ touch .env
```
##Then copy thangs from exampl.env into .env

__Create_db__
```bash
$ createdb speakeasy_db
$ npm install
$ knex migrate:latest
$ knex seed:run (optional)
```

__Run Api__
```bash
$ nodemon
```


