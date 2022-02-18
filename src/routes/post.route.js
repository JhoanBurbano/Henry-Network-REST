const { Router } =require('express');
const router = Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/post' })
var cpUpload = upload.fields([
    { name: 'image', maxCount: 4 },
    ])


//controller
const { postPublicaciones, UpdatePost, publicacionesXusuario, likePost, commentPost, notificationReport } =require('../controllers/post.controller');
const { isAuth } = require('../controllers/usuario.middlewares');
const { getPosts } = require('../controllers/post.controller');
const { uploadpo } =require('../controllers/upload.controller')


//routes
router.get('/', getPosts)
// router.get('/name/:name', userByName)
// router.get('/byId/:id', userById)
router.post('/', isAuth, cpUpload, postPublicaciones)
// router.delete('/delete/:id', isAuth, deleteUser)
router.put('/update', isAuth, UpdatePost)
router.get('/varios', isAuth, publicacionesXusuario)
router.put('/likes', isAuth, likePost);
router.post('/comentarios', isAuth, commentPost)
router.put('/notification', isAuth,notificationReport)
// router.put('/comments', isAuth, getPutLike);



module.exports = router