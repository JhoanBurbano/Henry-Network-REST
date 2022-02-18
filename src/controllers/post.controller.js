require('dotenv').config()
const post =require('../models/post.model');
const {notification} = require('./usuario.controller');
require("./usuario.controller")
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');
const fs = require("fs");


const getPosts = async(req, res, next)=>{
  try {
    const { id } = jwt.verify(req.headers.token, process.env.SECRET_KEY)
    let allPost = await post.aggregate([
      {
        $lookup:{
          from: "usuarios",
          let: {id_usuario: "$autor"},
          pipeline: [
            {
              $unwind: "$id"
            },
            {
              $match: {
                $expr: {
                  $eq: ["$id", "$$id_usuario"]
                }
              }
            }
          ],
          as: "autorData"
        }
      }
    ]).sort({createdAt:-1})
    let newAuthor = {}
    allPost=allPost.map(e=>{
      e.autor=undefined
      if(e.autorData[0])
      {newAuthor = {
        fullname:e.autorData[0].fullname,
        id:e.autorData[0].id,
        cohorte:e.autorData[0].cohorte[0],
        profile:e.autorData[0].profile,
        email:e.autorData[0].email,
      }
      e.autorData[0]={...newAuthor}}
      return e
    })
      if(req.query.myself==='false'){
        allPost = allPost.filter(e=>e.autorData[0].id!==id)
      }
      if(req.query.myself==='true'){
        allPost = allPost.filter(e=>e.autorData[0].id===id && e.tags.length == 0)
        }
      if(req.query.userid!==undefined){
        allPost = allPost.filter(e=>e.autorData[0].id===req.query.userid)
      }
      if(req.query.idpost!==undefined){
        allPost = allPost.filter(e=>e._id.toString()===req.query.idpost)
        if(req.query.comments==='true'){
          allPost = allPost.map(e=>e.comentarios)
        }
        return res.json({message:"post por id", data:allPost[0]})
      }
      if(req.query.follows==='true'){
        const {follow:{follows}} = await usuarioModel.findOne({id}, {"follow.follows":1})
        allPost = allPost.filter((e)=>(follows.includes(e.autorData[0].id) || e.autorData[0].id===id))
      }
      if(req.query.experience==="true"){
       const  allexperience =  allPost.filter(e=> e.tags.flat().join(", ").split(",").includes("#experience"))
        return res.json(allexperience)
      }else{
        allPost = allPost.filter((e)=>!e.tags.flat().join(", ").includes("#experience"))
      }
  
      res.json({message: 'Estos son todos los posts', data: allPost})
  } catch (error) {
    res.json(error)
    console.log(error)
  }
}
const postAdd = async (req, res, next) =>{
    const {token, image, title, category, comentarios, description, options, fecha_creacion, fecha_modificacion, like,tags} = req.body
    // const dataPost = req.body;
    try {
        if(!image && title && category && comentarios && description && options && fecha_creacion && fecha_modificacion && like && tags){
            return res.json({message: 'Se requiere llenar todos los campor', error: error})
        }
        const user = jwt.verify(token);
        user.post
    } catch (error) {
        
    }
    
}
const postPublicaciones = async (req, res, next) => {
    const {
        title,
        category,
        description,
        tags} = req.body
      const {token} = req.headers

      const { image } = req.files;
      let TYPE_FOTO = ""
      if(image){
        TYPE_FOTO=image.map(el=>el.path) //mimetype.split("/")[1];
        console.log("----> mapeado",TYPE_FOTO)
      }
    try {
      const {id} = jwt.verify(token, process.env.SECRET_KEY)
     if(tags){
      const newpost =  new post ({
        image:TYPE_FOTO,
        title,
        category,
        description,
        tags:("#experience, "+tags),
        autor:id
      })
      await newpost.save()
      res.json({message:"Se ha publicado correctamente"});
    }else{
        const newpost =  new post ({
          image:TYPE_FOTO,
             title,
             category,
             description,
             tags,
             autor:id
           })

           await newpost.save()
           res.json({message:"Se ha publicado correctamente"});
      }
    } catch (error) {
      res.send(error)
    }
  };
const postPhoto =async (req, res)=>{

  
  const { FOTO = null } = req.files;

  const TYPE_FOTO=FOTO[0].mimetype.split("/")[1];
  const FOTO_PATH =FOTO[0].path + "." + TYPE_FOTO;
  fs.renameSync(FOTO[0].path, FOTO_PATH);
  console.log(FOTO[0].path);
  console.log(FOTO_PATH);
res.json(image)

}
  const UpdatePost = async (req, res)=>{
    post.updateOne({
      id:"61e7b2a1c495bb8d2888b1ef"
    },{
      name:"modifique esta mierda desde aqui"
    }
    )
  }
  const publicacionesXusuario = async (req, res) =>{
    const resultado = await post.aggregate(
    [
      {
        $lookup:
        {
          from: "usuarios",
          localField:"autor",
          foreignField:"_id",
          as:"usuariosAutor"
        }
      },
      { $unwind: "$usuariosAutor"},
      { $match: {usuariosAutor:"61e7cd45a3a6c48bb0fb3ec8"}}
    ])
    res.json(resultado)
  }
  const likePost = async(req, res) => {
    try {
      const { idpost } = req.body; // Butoon dispara la accion
      const publicacion = await post.findById(idpost); 
      const {token} = req.headers;
      const { id } =  jwt.verify(token,process.env.SECRET_KEY); // Persona que dispara la accion
      if (publicacion){
        if(publicacion.likes.some(like => like.id===id)){
          publicacion.likes = publicacion.likes.filter(l => l.id !== id)
          await publicacion.save()
          res.json({message: 'Se quito el like'})
        }else{
          const {fullname, profile} = await usuarioModel.findOne({id}, {fullname:1, profile:1})
          publicacion.likes.unshift({id, fullname, profile});
          await publicacion.save()
          notification(publicacion.autor, id, 'like', idpost);
          res.json({message: 'Se agrego un like'});
          }
        }
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
  const commentPost = async(req,res) => {
    try {
      //id de la persona nombre y foto 
      const { idpost, comentario } = req.body; 
      const publicacion = await post.findById(idpost); 
      const {token} = req.headers;
      const { id } =  jwt.verify(token,process.env.SECRET_KEY); // Persona que dispara la accion
      if (publicacion){
        const {fullname, profile} = await usuarioModel.findOne({id}, {fullname:1, profile:1})
        publicacion.comentarios.unshift({id, fullname, profile, comentario});
        await publicacion.save()
        notification(publicacion.autor, id, 'comment', idpost);
        res.json({message: 'Se agrego un comentario'});
        }
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
const notificationReport = async(req, res)=>{
  const { token } = req.headers
  try {
    const { idUser,message } = req.body
    const {id} = jwt.verify(token, process.env.SECRET_KEY)
    const user = await usuarioModel.findOne({id:idUser});
if (user.report.length <= 20) {
  console.log(user.report.length)
  user.report.unshift({id, message});
  await user.save();
  res.json({message: `Se ha reportado a: ${user.fullname} ` });
  notificationR(user.id, 'comment');
}else{
  res.json({message: 'no se puede reportar mas de 1 vez'});
}
  } catch (error) {
    console.log(error)
  }
}

const notificationR = async( idreporter, type) => {
  try {
    const {fullname} = await usuarioModel.findOne({ id: idreporter }, {fullname: 1});
    // console.log("id --->", fullname)
    
      const admins = await usuarioModel.findOne({ rol: 'ADMIN'});
      // console.log("---->",admins)
      switch (type) {
          case 'comment':
              const messageCommentData = {
                  idreporter,
                  content: `Ha sido reportado(a)`,
                  icon: 'uploads/Icons/reports.svg',
                  name: fullname.split(' ')[0]
      }
               // admins.notifications.unshift(messageCommentData);
               console.log("------>", admins.notifications)
               admins.notifications.unshift(messageCommentData);
          break;
          case 'person':
              const messagePersonData = {
                  idreporter,
                  message: `Se reporto por una persona`,
        icon: 'uploads/Icons/reports.svg',
              }
               admins.map(ele => ele.notifications.push(messagePersonData));
                await admins.save()
              res.send('se ha reportado una persona')
          default:
              break;
      }
      await admins.save(); 
  } catch (error) {
      console.log(error);
  }
}

  module.exports = { 
    postPublicaciones, UpdatePost, publicacionesXusuario, 
    getPosts, likePost, commentPost, postPhoto, notificationReport };
