const {Schema, model} = require('mongoose')

const userAutorizeSchema = new Schema(
  {
    email: {type: String},
    cohorte: String,
  },
  
  { timestamps: true }
);

module.exports = model("autorization", userAutorizeSchema);