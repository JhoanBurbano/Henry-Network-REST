require('dotenv').config();
const usuario = require('../models/usuario.model');
const jwt = require('jsonwebtoken');
const userAutorize = require('../models/userAutorize.model');
const {transporter} = require('./emailSend.controller')
const autorization = require("../models/autorization.model")


const usersAll = async (req, res, next) => {
	let message=""
	try {
		const { id } = jwt.verify(req.headers.token, process.env.SECRET_KEY);
		let users = await usuario.find();

		if(req.query.myId==='true'){
			if(req.query.fastProfile==='true'){
				const fastData = await usuario.findOne({id}, {profile:1, cohorte:1, id:1, email:1, fullname:1, rol:1, state:1})
				return res.json({message:"fastProfile", data:fastData})
			}
			return res.json({message:"Solo tu id", id})
		}

		if(req.query.myself==='true'){
			users = users.filter((e) => e.id === id);
		}
		if (req.query.myself === 'false') {
			users = users.filter((e) => e.id !== id);
		}
		if(req.query.follows==='false'){
			const myself = await usuario.findOne({id: id})
			users = users.filter((e) => !myself.follow.follows.includes(e.id));
			message += users.length?"Estas son las personas no sigues":"Sigues a todos"
		}
		if(req.query.follows==='true'){
			const myself = await usuario.findOne({id: id})
			users = users.filter((e) => myself.follow.follows.includes(e.id));
			message += users.length?"Estas son las personas que sigues":"Aun no sigues a nadie"
		}
		if(req.query.followers==='true'){
			const myself = await usuario.findOne({id: id})
			users = users.filter((e) => myself.follow.followers.includes(e.id));
			message += users.length?"Estas son las personas que te siguen":"Aun no tienes seguidores"
		}
		if(req.query.followers==='false'){
			const myself = await usuario.findOne({id: id})
			users = users.filter((e) => !myself.follow.followers.includes(e.id));
			message += users.length?"Estas son las personas que aun no te siguen":"Eres muy popular"
		}
		if(req.query.locked==='true'){
			users = users.filter((e) => e.report.length>0);
			if(!users.length)return res.json({data:["¡Que alivio, no han habido conflictos!"]})
			message += users.length?"Estas son las personas tienen pendiente a solucionar su bloqueo":"no tiene reportes"
		}
		res.json({message, data:users});
	} catch (error) {
		res.send(error)
		next(error);
	}
};
const userByName = async (req, res) => {
	let { name } = req.params;
	let expresion = null;
	if (name.includes(' ')) {
		const result = name.split(' ');
		expresion = new RegExp();
	} else {
		expresion = new RegExp('(' + name + '+)', 'i');
		// expresion = new RegExp("^["+ name.charAt(0).toUpperCase()+name.slice(1).toLowerCase()+"|"+name+"+]")
	}
	try {
		const toto = await usuario.find({ fullname: { $regex: expresion } });
		toto ? res.json(toto) : res.json({ message: 'No se encontro un usuario con ese nombre', status: 500 });
	} catch (error) {
		console.error(error);
	}
};
const userById = async (req, res) => {
	const { id } = req.params;
	const { token } = req.headers;
	try {
		const payload = jwt.verify(token,process.env.SECRET_KEY)
		if(id===payload.id)return res.json(null);
		if(req.query.follow==='true'){
			const {follow:{followers, follows}} = await usuario.findOne({id}, {follow:1})
			let response = {
				follows: [],
				followers:[]
			}
			if(follows.length){
				for(id_ of follows){
					let user = await usuario.findOne({id:id_},{fullname:1, profile:1, cohorte:1, email:1, id:1}) 
					response.follows.push(user)
				}
			}
			if(followers.length){
				for(id_ of followers){
				let user = await usuario.findOne({id:id_},{fullname:1, profile:1, cohorte:1, email:1, id:1}) 
				response.followers.push(user)
			}
		}
			
			return res.json(response)
		}
		const userId = await usuario.findOne({ id});
		userId ? res.json(userId) : res.json({ message: 'No se encontro un usuario con ese id', status: 500 });
	} catch (error) {
		console.error(error);
	}
};
const postUser = async (req, res, next) => {
	try {
		const { id, fullname, birthday,	email, profile,	nacionalidad, rol, description,	background_picture } = req.body;
		const isCreated = await usuario.findOne({ id: id });
		const isAuth = await autorization.findOne({email})
		if (isAuth && !isCreated) {
			if (!id || !fullname || !email) {
				return res.json({ message: 'Se deben llenar todos los campos requeridos' });
			} else {
				const newUsuario = await new usuario({
					id,
					fullname,
					birthday,
					email: email.toLowerCase(),
					profile,
					nacionalidad,
					cohorte:isAuth.cohorte,
					rol,
					description,
					background_picture,
					state: true
				});
				await newUsuario.save();
					const token = jwt.sign({ id: newUsuario.id}, process.env.SECRET_KEY, { expiresIn: '1d' });
					return res.json({ message: 'Se ha registrado satisfactoriamente', data: token });
			}
		} else if (isAuth && isCreated) {
				const token = jwt.sign({ id: isCreated.id }, process.env.SECRET_KEY, { expiresIn: '1d' });
				return res.json({ message: 'El usuario ya existe', data: token });
		} else {
			return res.json({message: "usted no pertence a HENRY", data: false})
		}
	} catch (error) {
		res.send(error);
	}
};
const deleteUser = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = await usuario.findOneAndDelete({ id: id });
		if (userId) {
			res.json({ message: 'Se ha eliminado exitosamente  el usuario:', userId });
		} else {
			res.json({ message: 'No existe un usuario con dicho ID' });
		}
	} catch (error) {
		res.send(error);
	}
};
const Updateuser = async (req, res) => {
	try {
			const { id } = jwt.verify(req.headers.token, process.env.SECRET_KEY);
			const { fullname, birthday, description, nacionalidad } = req.body;
		    const user = await usuario.findOne({id});
		if (user) {
			if (fullname || birthday || description || nacionalidad) {
			await usuario.updateOne({id},{ fullname, birthday, description, nacionalidad });
			const resulFinal = await usuario.findOne({id});
			res.status(200).json({ message: 'se ha modificado exitosamente  el usuario:', data:resulFinal });
			} 	else{res.json("nada")}
		} else {
			res.status(200).json({ message: 'no se tiene informacion del usuario' });
		}
	} catch (error) {
		res.send(error);
	}
};
const UpdateProfile = async (req, res) => {
	try {
			const { id } = jwt.verify(req.headers.token, process.env.SECRET_KEY);
			const profile = req.file.path
			console.log("---->",profile)
				const user = await usuario.findOne({id});
		if (user) {
			await usuario.updateOne({id},{ profile });
			const resulFinal = await usuario.findOne({id});
			res.status(200).json({ message: 'se ha modificado exitosamente  el usuario:', data:resulFinal });
			
		} else {
			res.status(200).json({ message: 'no se tiene informacion del usuario' });
		}
	} catch (error) {
		res.send(error);
	}
};
const UpdateBackgroundPicture = async (req, res) => {
	try {
			const { id } = jwt.verify(req.headers.token, process.env.SECRET_KEY);
			const background_picture = req.file.path
			console.log("--->", background_picture)
				const user = await usuario.findOne({id});
		if (user) {
			await usuario.updateOne({id},{ background_picture });
			const resulFinal = await usuario.findOne({id});
			res.status(200).json({ message: 'se ha modificado exitosamente  el usuario:', data:resulFinal });
			
		} else {
			res.status(200).json({ message: 'no se tiene informacion del usuario' });
		}
	} catch (error) {
		res.send(error);
	}
};
const authorization = async (req, res, next) => {
	try {
		const { id } = req.body;
		const user = await usuario.findById(id);
		if (req.query.token) {
			try {
				const verficacion = jwt.verify(req.query.token, process.env.SECRET_KEY);
				return res.json({ ...verficacion, data: true });
			} catch (error) {
				console.log(error);
				return res.json({ ...error, data: false });
			}
		}
		if (user) {
			const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });
			return res.json({ message: `Se ha generado el token para ${user.name}`, data: token });
		}
		res.json({ message: 'El usuario no existe' });
	} catch (error) {
		console.log(error);
		res.send(error);
	}
};
const notification = async (idSeguido, idPropio, type, idpost=undefined) => {
	try {
		if(idSeguido === idPropio){
			return null
		}
		const {fullname} = await usuario.findOne({ id: idPropio }, {fullname: 1});
		const userFollow = await usuario.findOne({ id: idSeguido });
		switch (type) {
			case 'comment':
				const messageCommentData = {
					id: idPropio,
					content: `te hizo un comentario`,
					icon: 'uploads/Icons/comment.svg',
					name: fullname.split(' ')[0],
					idpost: idpost
				}
				userFollow.notifications.unshift(messageCommentData);
				break;
				case 'like':
					const messageLikeData = {
					id: idPropio,
					content: `le dio me gusta a tu post`,
					icon: 'uploads/Icons/like.svg',
					name: fullname.split(' ')[0],
					idpost: idpost
				}
				userFollow.notifications.unshift(messageLikeData);
			break;
			case 'follow':
				const messageFollowData = {
					id: idPropio,
					content: `te empezó a seguir`,
					icon: 'uploads/Icons/follow.svg',
					name: fullname.split(' ')[0],
				}
				userFollow.notifications.unshift(messageFollowData);
			break;
			default:
				break;
		}
		await userFollow.save();
	} catch (error) {
		console.log(error)	
	}
}
const getNotification = async(req, res) => {
	try {
		const {token} = req.headers;
		const { id } = jwt.verify(token,process.env.SECRET_KEY);
		const {notifications} = await usuario.findOne({ id }, {notifications: 1});
		if(notifications){
			res.json({notifications});
		}else{
			res.json({message: 'No hay notificaciones para mostrar'});
		}
	} catch (error) {
		console.log(error)
		res.json(error)
	}
}
const deleteNotificationById = async(req,res) => {
	try {
		const { idnotification } = req.params; 
		const { token } = req.headers;
		const { id } = jwt.verify(token, process.env.SECRET_KEY);
		const notify = await usuario.findOne({ id }, {notifications:1});
		if(notify){
			notify.notifications = notify.notifications.filter(ele => ele._id.toString() !== idnotification)
			await notify.save();
			res.json({message: 'Se eliminó la notificación.'})
		}
		else{
			res.json({message: `No hay una notificación con dicho ID`});
		}

	} catch (error) {
		console.log(error)
		res.send(error)
	}
}
const deleteNotification = async(req,res) => {
	try {
		const { token } = req.headers;
		const { id } = jwt.verify(token, process.env.SECRET_KEY);
		const notifications = await usuario.findOne({ id }, {notifications: 1});
		if(notifications){
			notifications.notifications = [];
			console.log(notifications)
			await notifications.save();
			res.json({message: `Se eliminaron las notificaciones `});
		}else{
			res.json({message: 'No hay notificaciones'});
		}
	} catch (error) {
		console.log(error)
		res.json(error)
	}
}
const FollowMe = async (req, res, next) => {
	const { followMe } = req.body;
	const {token} = req.headers;
	try {
		let message = '';
		const { id } = jwt.verify(token,process.env.SECRET_KEY)
		const myself = await usuario.findOne({ id });
		const user = await usuario.findOne({ id: followMe });
			if (user.follow.followers.includes(id)) {
				console.log("------------->", followMe, user.fullname)
				message = `dejaste de seguir a ${user.fullname}`;
				user.follow.followers.splice(user.follow.followers.indexOf(id), 1);
				myself.follow.follows.splice(myself.follow.follows.indexOf(followMe), 1);
			} else {
				message = `seguiste a ${user.fullname}`;
				user.follow.followers.push(id);
				myself.follow.follows.push(followMe);
				await notification(followMe, id, 'follow');
			}
			await user.save();
			await myself.save();
			res.json({ message });
	} catch (error) {
		console.log(error);
		res.json(error)
	}
};

// - [reporte por acoso,  reporte por malas palabras],
// const userRol = (id) => {
// 	const {token} = req.headers;
// 	const { id } = jwt.verify(token,process.env.SECRET_KEY);
// 	const user = await usuario.findOne({ id });
// 	switch (user.rol) {
// 		case 'estudiante':
			
// 			break;
	
// 		default:
// 			break;
// 	}
// }

// funcion para bloquear y desbloquear funcionalidades del usuario
const locked  = async(req, res) => {
	try {
		const { iduser } = req.body;
		const { token } = req.headers;
		const { id } = jwt.verify(token,process.env.SECRET_KEY);
		const student = await usuario.findOne({ id: iduser }); 
		const user = await usuario.findOne({ id });
		if(user.rol === 'ADMIN'){
			if(student.state == true){
				student.state = false;
				//opciones de a quien va dirigido el correo
				const mailOptions = {
			from: 'HenryVerse2022@gmail.com',
			to:student.email,
			subject: `Se ha bloqueado tu cuenta, aterrizaste en otro lugar `,
			html: `
			<div style="font-size: 14px; color: #000;">
			<img height="300" src="https://dogskll.herokuapp.com/uploads/background_picture/default.jpeg" />
			<p>Hola <b>${student.fullname.split(" ")[0]}</b>, tu cohete se ha dado de baja por mala conducta, esto puede ser temporal o definitivo.</p>
			<p>para mas informacion te invitamos a usar nuestros canales de comunicacion</p>
			<h4>Muchos Exitos<h4>
			<p style="font-size: 11px; text-align: center;" >Henryverse 2022</p>
			</div>
			`
	  		};
//ejecuta la fucnion de envio de correo
			await transporter.sendMail(mailOptions, (error, info)=>error? console.log(error) : console.log('Email enviado: '+info.response));
				student.save();
				res.json({message: `El usuario ${student.fullname} fue bloquedo`});
			}else{
				student.state = true;
				const mailOptions = {
					from: 'HenryVerse2022@gmail.com',
					to:student.email,
					subject: `Se ha desbloqueado tu cuenta, vuelve a navegar en Henryverse`,
					html: `
					<div style="font-size: 14px; color: #000;">
					<img height="300" src="https://dogskll.herokuapp.com/uploads/background_picture/default.jpeg" />
					<p>Hola <b>${student.fullname.split(" ")[0]}</b>, se te ha dado otra oportunidad, vuelve a nuestro universo y expande tu galaxia de amigos</p>
					<h3>Te Esperamos<h3>
					<p style="font-size: 11px; text-align: center;" >Henryverse 2022</p>
					</div>
					`
				  };
				  await transporter.sendMail(mailOptions, (error, info)=>error? console.log(error) : console.log('Email enviado: '+info.response));
				student.save();
				res.json({message: `El usuario ${student.fullname} fue desbloquedo`});
			}
		}
		else{
			res.json({message: 'No tiene permisos para realizar esta acción'});
		}
	} catch (error) {
		console.log(error);
		res.send(error);
	}
}
const deletelocked = async(req,res) => {
	const { idDisloked } = req.body
	try {
		const { token } = req.headers;
		const { id } = jwt.verify(token,process.env.SECRET_KEY);
		const student = await usuario.findOne({ id: idDisloked }); 
		
		const user = await usuario.findOne({ id });
		if(user.rol === 'ADMIN'){
			if(student.report.state == false){
				student.report.state = true;
				student.save();
				res.json({message: `El usuario ${student.fullname} fue bloquedo`});
			}
		}
		else{
			res.json({message: 'No tiene permisos para realizar esta acción'});
		}
	} catch (error) {
		console.log(error)
		res.json(error)
	}
}
const createUser = async(req, res) =>{
    const { email  } = req.body
      const {token} = req.headers

    try {
      const {id} = jwt.verify(token, process.env.SECRET_KEY)
        const newuser =  new userAutorize ({ email, id})
      await newuser.save()
      res.json({message:"Se ha creado correo"});
    
    } catch (error) {
      res.send(error)
    }
}
const userRegister = async(req, res) =>{
	try {
		const {token} = req.headers
      const {id} = jwt.verify(token, process.env.SECRET_KEY)
	  const res =await usuario.findOne({ id: id })
	 const email =res.email
      const user = await userAutorize.findOne({ email: email})
	  console.log(user)
	  if (user) {
 		return res.json({authorized: true})
		}else{
		return	res.json({authorized: false})
		}
    } catch (error) {
      res.send(error)
    }
}




module.exports = { 
	usersAll, userByName, userById, 
	postUser, deleteUser, Updateuser, 
	authorization, FollowMe ,  
	UpdateProfile, UpdateBackgroundPicture,
	getNotification, deleteNotification, deleteNotificationById,
	locked, deletelocked, createUser, userRegister, notification
};



//validar tipos de reportes, comentarios, personas, 