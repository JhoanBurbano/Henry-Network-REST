const { Schema, model } = require('mongoose');

const Post = new Schema(
    {
    image:{ type: Array,
        default: [] 
    },
    title: {type:String},
    category: {type:String},
    comentarios: [{
        id: String,
        fullname: String,
        profile: String,
        comentario: String,
        createdAt: {type:Date, default: Date.now()}
    }],
    description: {type: String},
    options: {type:String},
    likes: [{
        id:String,
        fullname:String,
        profile:String
    }],
    tags: { type: Array,
            default: [] 
        },
    autor:{type: String}
},
{ timestamps: true });

module.exports = model('post', Post)

// ['codigo Js', 'Codigo' ]
// jadasafsd