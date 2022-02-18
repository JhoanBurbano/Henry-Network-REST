const { Schema, model } = require('mongoose');

const usuarios= new Schema({
  id: String,
  fullname: String,
  birthday: {type:String, default:""},
  nacionalidad: {type:String, default: ""},
  cohorte: [{type:String, default: ""}],
  rol: {type:String, default: ""},
  report: [{
    id: String,
    idReport: String,
    message: String,
    state: {type:Boolean, default:true},
    createAt: { type: Date, default: Date.now()}
  }],
  description: {type:String, default: ""},
  background_picture: {type:String, default: "uploads/background_picture/default.jpeg"},
  notifications:[{
    id: String,
    content: String,
    icon: String,
    name: String,
    idpost: String
  }],
  social_networks: [
    { name: String, 
      link: String 
    }],
  activity: { 
        likes:[{idpost:String, title: String}],
        post:[{idpost:String, title: String}],
        comments:[{idPost:String, idcomment:String, content:String}]
      },
  follow: 
    { followers:
        {
          type: Array,
          default: []
        },
        follows:
          {
            type: Array,
            default: []
          },
        },
  email:  String,
  profile: {
    type:String,
    default:'https://cdn1.vectorstock.com/i/thumb-large/05/85/programmer-vector-37610585.jpg'
  },
  state: {
    type:Boolean,
    default:true
    },
});

module.exports = model('usuarios', usuarios)