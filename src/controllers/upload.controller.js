const multer = require('multer')
require('dotenv').config()
const jwt = require("jsonwebtoken");

const storageProfile = multer.diskStorage({
    destination: function(req, file, cb){cb(null, 'uploads/Profile')},
    filename: function(req, file, cb){
        const { id } = jwt.verify(req.headers.token, process.env.SECRET_KEY)
        cb(null, `${id}_profile.jpg`)
    }
})
const storagebackground_picture = multer.diskStorage({
    destination: function(req, file, cb){cb(null, 'uploads/background_picture')},
    filename: function(req, file, cb){
        const { id } = jwt.verify(req.headers.token, process.env.SECRET_KEY)
        cb(null, `${id}_background_picture.jpg`)
    }
})
const storagePost = multer.diskStorage({
    destination: function(req, file, cb){cb(null, 'uploads/post')},
    filename: function(req, file, cb){
        const { id } = jwt.verify(req.headers.token, process.env.SECRET_KEY)
        cb(null, `${id}_${Date.now()}_post.jpg`)
    }
})
const uploadProfile = multer({storage:storageProfile})
const uploadbackground_picture = multer({storage:storagebackground_picture})
const uploadpost = multer({storage:storagePost})

const uploadP = uploadProfile.single('profile')
const uploadb = uploadbackground_picture.single('background_picture')
const uploadpo = uploadpost.single('image')

module.exports ={ uploadP, uploadb, uploadpo}
