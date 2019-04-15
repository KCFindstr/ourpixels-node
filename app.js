require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const User = require('./models/user');
const Image = require('./models/imagedata');
const Access = require('./models/access');
const WebSocket = require('ws');
const Decoder = require('./image.js');

User.hasMany(Image, { foreignKey: 'CreatorId' });
Image.belongsTo(User, { foreignKey: 'CreatorId' });

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

// random token
function getToken(length){
	var a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
	var b = '';  
	for (var i=0; i<length; i++) {
			b += a[Math.floor(Math.random() * a.length)];
	}
	return b;
}

// get user information
function filterUser(user) {
	return {
		id: user.id,
		username: user.username,
		admin: user.admin,
		created: user.createdAt,
		lastLogin: user.updatedAt,
		artwork: user.ImageData.map((image) => {
			return image.id;
		})
	};
}
app.get('/user', (req, res) => {
	User.findAll({
		include: [Image]
	})
	.then((result) => {
		let filteredResult = result.map(filterUser);
		res.json(filteredResult);
	}, (errors) => {
		console.log(errors);
		res.status(500).send();
	});
});
app.get('/user/:id', (req, res) => {
	let id = req.params.id;
	User.findByPk(id, {
		include: [Image]
	})
	.then((user) => {
		if (!user) {
			res.status(404).json({
				errors: ['No such user.']
			});
			return;
		}
		let filteredResult = filterUser(user);
		res.json(filteredResult);
	}, (errors) => {
		console.log(errors);
		res.status(500).send();
	});
});

// get image information
function filterImage(image, getData = false) {
	let ret = {
		id: image.id,
		creator: image.creator,
		created: image.createdAt,
		modified: image.updatedAt,
		name: image.name,
		size: image.size
	};
	if (getData) {
		ret.data = Decoder.decode(image.data, image.size);
	}
	return ret;
}

app.get('/image', (req, res) => {
	Image.findAll()
	.then((result) => {
		let filteredResult = result.map((image) => {
			return filterImage(image);
		});
		res.json(filteredResult);
	}, (errors) => {
		console.log(errors);
		res.status(500).send();
	});
});
app.get('/image/:id', (req, res) => {
	let id = req.params.id;
	Image.findByPk(id)
	.then((image) => {
		if (!image) {
			res.status(404).json({
				errors: ['No such image.']
			});
			return;
		}
		let filteredResult = filterImage(image, true);
		res.json(filteredResult);
	}, (errors) => {
		console.log(errors);
		res.status(500).send();
	});
});

// login
app.post('/login', (req, res) => {
	let {username, password} = req.body;
	if (!username || !password) {
		res.status(422).json({
			errors: ['Username and password are required.']
		});
		return;
	}
	User.findOne({
		where: {
			username: username,
			password: password
		}
	})
	.then((user) => {
		if (!user) {
			res.status(400).json({
				errors: ['Authentication failed.']
			});
		} else {
			res.json({
				username: username,
				success: true,
				token: user.token
			});
		}
	}, (errors) => {
		console.log(errors);
		res.status(500).send();
	});
});

function authenticate(username, token) {
	return new Promise((resolve, reject) => {
		if (!username || !token) {
			reject('Username and token are required.');
		}
		User.findOne({
			where: {
				username: username,
				token: token
			}
		})
		.then((user) => {
			if (!user) {
				reject('User not found');
			} else {
				resolve(user);
			}
		}, reject);
	});
}
// logout
app.post('/logout', (req, res) => {
	let {username, token} = req.body;
	authenticate(username, token)
	.then((user) => {
		user.token = getToken(100);
		user.save().then(() => {
			res.json({
				username: username,
				success: true
			});
		}, (errors) => {
			console.log(errors);
			res.status(500).send();
		});
	}, () => {
		res.status(422).json({errors: ['User not found.']});
	});
});

// websocket
let wss = new WebSocket.Server({port: process.env.PORT || 8081 });
let roomList = {};

function wssLogin(ws, obj) {
	if (ws.room || !obj.imageid || !obj.username || !obj.token) {
		ws.send(JSON.stringify({
			type: 'error',
			message: 'Missing argument(s).'
		}));
		return;
	}
	let image = null;
	Image.findByPk(obj.imageid)
	.then((result) => {
		image = result;
	});
	if (!image) {
		ws.send(JSON.stringify({
			type: 'error',
			message: 'Image not found.'
		}));
		return;
	}
	authenticate(obj.username, obj.token)
	.then((user) => {
		Access.findOne({
			where: {
				user: user.id,
				image: image.id
			}
		}).then((record) => {
			if (!record) {
				ws.send(JSON.stringify({
					type: 'error',
					message: 'Unauthorized attempt to access image.'
				}));
				return;
			}
			if (!roomList[image.id]) {
				roomList[image.id] = {
					users: [],
					image: image,
					data: Decoder.decode(image.data, image.size)
				};
			}
			let room = roomList[image.id];
			ws.room = room;
			ws.username = obj.username;
			room.users.push(ws);
			ws.send(JSON.stringify({
				type: 'success',
				data: room.data
			}));
		});
	});
}

function roomBroadcast(room, message) {
	room.users.forEach((user) => {
		user.send(message);
	});
}

function wssSave(ws) {
	let room = ws.room;
	if (!room) {
		return;
	}
	room.image.data = Decoder.encode(room.data);
	room.image.save()
	.then(() => {
		roomBroadcast(room, JSON.stringify({type: 'save'}));
	});
}

function wssMod(ws, obj) {
	let room = ws.room;
	if (!room) {
		return;
	}
	let image = room.image;
	obj.x = parseInt(obj.x);
	obj.y = parseInt(obj.y);
	if (isNaN(obj.x) || isNaN(obj.y)) {
		return;
	}
	if (typeof(obj.x) != 'number' || typeof(obj.y) != 'number' || typeof(obj.color) != 'ob ject') {
		return;
	}
	if (!obj.color.length || obj.color.length != 3) {
		return;
	}
	if (obj.x < 0 || obj.x >= image.size || obj.y < 0 || obj.y >= image.size) {
		return;
	}
	let dest = [];
	for (let i=0; i<3; i++) {
		dest[i] = parseInt(color[i]);
		if (isNaN(dest[i]) || dest[i] < 0 || dest[i] > 255) {
			return;
		}
	}
	room.data[obj.x][obj.y] = dest;
	roomBroadcast(room, JSON.stringify({
		type: 'mod',
		x: obj.x,
		y: obj.y,
		color: obj.color
	}));
}

wss.on('connection', (ws) => {
	ws.on('message', (message) => {
		let obj = {};
		try {
			obj = JSON.parse(message);
		} catch (e) {
			return;
		}
		if (typeof(obj) != 'object') {
			return;
		}
		// login to system
		if (obj.type == 'login') {
			wssLogin(ws, obj);
			return;
		}
		if (obj.type == 'save') {
			wssSave(ws);
			return;
		}
		if (obj.type == 'mod') {
			wssMod(ws, obj);
			return;
		}
	});
	ws.on('close', (code, reason) => {
		if (!ws.room) {
			return;
		}
		let index = ws.room.users.indexOf(ws);
		if (index > -1) {
			ws.room.users.splice(index, 1);
		}
	});
});


// heartbeat packet
setInterval(() => {
	for (let key in roomList) {
		let obj = [];
		let room = roomList[key];
		room.users.forEach((user) => {
			obj.push(user.username);
		});
		roomBroadcast(room, JSON.stringify({
			type: 'users',
			users: obj
		}));
	}
}, 1000);

// start app
app.listen(process.env.PORT || 8080);