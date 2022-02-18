require('dotenv').config();
const {
//   DB_USER=RedSocial
// DB_PASSWORD=RedSocial
// DB_NAME=RedSocial
  DB_USER, DB_PASSWORD, DB_NAME,
} = process.env;
const mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@redsocial.n72mr.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`, {useNewUrlParser: true})
.then((db) => console.log(`Mongo DB has been conected in: ${db.connection.name}`))
.catch(err=>console.log(`This error has been interupt: \n${err}`));
