require('dotenv').config()
const jwt = require("jsonwebtoken");
const usuario = require('../models/usuario.model')
const isAuth = (req, res, next)=>{
    try {
        const {token} = req.headers;
        if(token){
            const isValid = jwt.verify(token, process.env.SECRET_KEY)
            if(isValid){
                next()
            }else{
                console.log(false)
            }
        }else{
            return res.json({message: "no estas autorizado para acceder a esta informacion", auth:false})
        }
    } catch (error) {
        res.send(error)
        next(error)
    }
}

const isAdmin = async(req, res, next)=>{
    try {
        const {token} = req.headers;
        const { id } = jwt.verify(token, process.env.SECRET_KEY)
        const {rol} = await usuario.findOne({id}, {rol:1})
        if(rol==='ADMIN'){
            return next()
        }
        else{
            res.status(400).json({message: "No tienes permisos de ADMIN para realizar este tipo de acciones"})
        }
    } catch (error) {
        res.send(error)
    }
}

module.exports = {
    isAuth,
    isAdmin
}