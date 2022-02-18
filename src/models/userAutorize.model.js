const {Schema, model} = require('mongoose')

const userAutorizeSchema = new Schema(
  {
    email: {type: String},
    CreatedFor:{type:String},
    state: {
        type:Boolean,
        default:true
        },
  },
  
  { timestamps: true }
);

module.exports = model("userAutorize", userAutorizeSchema);