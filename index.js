const express = require('express');
const morgan = require('morgan');
const routes = require('./src/routes');
const server = express();
const cors = require('cors');
server.name = 'API';

require('./db');
server.use(express.urlencoded({ extended: false, limit: '50mb' }));
server.use(express.json({ limit: '50mb' }));
// server.use(cookieParser());

server.use(morgan('dev'));
server.use(cors());

//MANEJO DE ERRORES
server.use((err, req, res, next) => {
	// eslint-disable-line no-unused-vars
	const status = err.status || 500;
	const message = err.message || err;
	console.error(err);
	res.status(status).send(message);
});
// server.use(express.static("uploads"))
server.use('/uploads/', express.static('./uploads'));
//
server.use('/', routes);

server.set('port', process.env.PORT || 3001);

const http = require('http');
const { Server } = require('socket.io');
const ServerHTTP = http.createServer(server);

const io = new Server(ServerHTTP, {
	cors: {
		origin: process.env.FRONT_DOMAIN
	}
});

let users = [];

const addUser = (userId, socketId) => {
	!users.some((user) => user.userId === userId) && users.push({ userId, socketId });
};

const getUser = (userId) => {
	return users.find((user) => user.userId === userId);
};

const removeUser = (socketId)=>{
	users = users.filter(user => user.socketId !== socketId)
}

io.on('connection', (socket) => {
//CONNECT	
	console.log(socket.id + ' a user conected');
	io.emit('getUsers', users);
	socket.on('addUser', (userId) => {
		addUser(userId, socket.id);
	});


//CHAT
	socket.on('sendMessage', ({ senderId, receiverId, text }) => {
		const receiver = getUser(receiverId);
		if (receiver) {
			io.to(receiver.socketId).emit('getMessage', {
				senderId,
				receiverId,
				text
			});
		}
		const myself = getUser(senderId);
		io.to(myself.socketId).emit('myMessage', {
			senderId,
			receiverId,
			text
		});
	});

//DISCONNECT
	socket.on('disconnect', ()=>{
		removeUser(socket.id)
		console.log(socket.id, " a user disconnected")
	})
});

ServerHTTP.listen(server.get('port'), () => console.log(`I'm in http://localhost:${server.get('port')}`));
