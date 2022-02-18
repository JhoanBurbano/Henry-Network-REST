const { Router } = require('express');
const router = Router();

//controller
const {isAuth} = require('../controllers/usuario.middlewares')
const { usersAll, userByName,userById, postUser, deleteUser, 
    Updateuser, FollowMe, UpdateProfile, UpdateBackgroundPicture, 
    getNotification, deleteNotification, deleteNotificationById, 
    locked, deletelocked, createUser, userRegister } =require('../controllers/usuario.controller')
const { uploadP, uploadb, uploadpo } =require('../controllers/upload.controller')

//routes
// router.get('/login', login);
router.get('/henry',isAuth, userRegister)
router.get('/notifications', isAuth, getNotification);
router.get('/Id/:id', isAuth, userById);
router.get('/:name', isAuth, userByName);
router.get('/', isAuth, usersAll);
router.post('/', postUser); 
router.put('/', isAuth, Updateuser);
router.put('/updateProfile', isAuth,uploadP, UpdateProfile);
router.put('/updateBackPicture', isAuth,uploadb, UpdateBackgroundPicture);
router.put('/updatePostPicture', isAuth,uploadpo, UpdateProfile);
router.put('/follow', isAuth, FollowMe);
router.delete('/notifications/:idnotification', isAuth, deleteNotificationById);
router.delete('/notifications', isAuth, deleteNotification);
router.delete('/:id', isAuth, deleteUser);
router.put('/locked', isAuth, locked);
router.put('/dislocked', isAuth, deletelocked);
router.post('/create',isAuth,  createUser);
// router.get('/notification', isAuth, notification);

// router.post('/notification', isAuth, notificationDelete);




module.exports = router