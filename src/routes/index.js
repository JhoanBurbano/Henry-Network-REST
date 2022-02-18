const express =require ('express');
const server = express();   

//IMPORTACION DE RUTAS
const usuarioRoute =require('./usuario.route')
const postRoute =require('./post.route')
const uploadRoute = require('./upload.route')
const conversation = require('./conversation.route')
const message = require('./message.route')
const reportes = require('./reportes.route')


//IMPORTACION DE MIDDLEWARES
const {isAdmin} = require('../controllers/usuario.middlewares')

//USO DE RUTAS

server.use("/conversation", conversation)
server.use("/message", message)
server.use('/usuarios', usuarioRoute)
server.use('/posts', postRoute)
server.use('/reportes', isAdmin, reportes);


module.exports = server