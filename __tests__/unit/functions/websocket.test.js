const { expect, assert } = require('chai');

const WebSocket = require('ws');
const frisby = require('frisby');

const url = 'ws://localhost:8081';
const frisbyurl = 'http://localhost:8080';

let token = '';

function modHandler(client, obj) {
	if (!client.data)
		return;
	client.data.data[obj.x][obj.y] = obj.color;
}

function saveHandler(client, obj) {
	client.lastSave = Date.now();
}

function usersHandler(client, obj) {
	client.roommates = obj.users;
}

function establishConnection(login) {
	return new Promise((resolve, reject) => {
		let client = new WebSocket(url);
		client.lastSave = Date.now();
		client.responseHandler = {
			mod: modHandler,
			save: saveHandler,
			users: usersHandler
		};
		client.roommates = [];
		client.register = function (type, handler) {
			client.responseHandler[type] = handler;
		}
		client.communicate = (data) => {
			return new Promise((resolve2, reject2) => {
				client.send(JSON.stringify(data));
				client.register('success', (client, obj) => {
					resolve2(obj);
				});
				client.register('error', (client, obj) => {
					resolve2(obj);
				});
			});
		}
		client.on('message', (response) => {
			let obj = JSON.parse(response);
			let func = client.responseHandler[obj.type];
			if (func) {
				func(client, obj);
			}
		});
		client.on('open', () => {
			if (login) {
				client.communicate({
					username: 'root',
					imageid: login,
					type: 'login',
					token: token
				})
				.then((response) => {
					client.data = response;
					resolve(client);
				});
			} else {
				resolve(client);
			}
		});
	});
}

describe('websocket', () => {

	beforeAll((done) => {
		frisby.post(frisbyurl + '/login/', {
			username: 'root',
			password: '24C30216B298744CCC2BA61AB433B71143D2838D4D8ED8BCCDBE606CC76EE8E5'
		})
		.then((response) => {
			token = response.json.token;
			done();
		});
	})

	describe('login', () => {
		it('should refuse connection if missing arguments', async (done) => {
			let client = await establishConnection();
			let response = await client.communicate({
				username: 'root',
				imageid: 1,
				type: 'login'
			});
			expect(response).to.deep.equal({
				type: 'error',
				message: 'Missing argument(s).'
			});
			client.close();
			done();
		});
		it('should refuse connection if token is wrong', async (done) => {
			let client = await establishConnection();
			let response = await client.communicate({
				username: 'root',
				imageid: 1,
				type: 'login',
				token: 'obvious wrong token'
			});
			expect(response).to.deep.equal({
				type: 'error',
				message: 'Invalid token.'
			});
			client.close();
			done();
		});
		it('should refuse connection if image does not exist', async (done) => {
			let client = await establishConnection();
			let response = await client.communicate({
				username: 'root',
				imageid: -1,
				type: 'login',
				token: token
			});
			expect(response).to.deep.equal({
				type: 'error',
				message: 'Image not found.'
			});
			client.close();
			done();
		});
		it('should refuse connection if unauthorized', async (done) => {
			let client = await establishConnection();
			let response = await client.communicate({
				username: 'root',
				imageid: 1,
				type: 'login',
				token: token
			});
			expect(response).to.deep.equal({
				type: 'error',
				message: 'Unauthorized attempt to access image.'
			});
			client.close();
			done();
		});
		it('should succeed if everything is good', async (done) => {
			let client = await establishConnection();
			let response = await client.communicate({
				username: 'root',
				imageid: 2,
				type: 'login',
				token: token
			});
			expect(response.type).to.equal('success');
			expect(response.data).to.be.an('array');
			expect(response.size).to.be.a('number');
			let n = response.size;
			expect(response.data.length).to.equal(n);
			expect(response.data[0].length).to.equal(n);
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					let cur = response.data[i][j];
					expect(cur).to.have.a.lengthOf(3);
					for (let k = 0; k < 3; k++) {
						expect(cur[k]).to.not.be.below(0);
						expect(cur[k]).to.not.be.above(255);
					}
				}
			}
			client.close();
			done();
		});
	})

	describe('mod', () => {
		it('should fail if x/y is not given', async (done) => {
			let client = await establishConnection(2);
			let result = await client.communicate({
				type: 'mod',
				x: 3,
				color: [127, 127, 127]
			});
			expect(result).to.deep.equal({
				type: 'error',
				message: 'Invalid modification.'
			});
			client.close();
			done();
		});
		it('should fail if x/y is out of bound', async (done) => {
			let client = await establishConnection(2);
			let result = await client.communicate({
				type: 'mod',
				x: 1,
				y: -1,
				color: [127, 127, 127]
			});
			expect(result).to.deep.equal({
				type: 'error',
				message: 'Invalid modification.'
			});
			client.close();
			done();
		});
		it('should fail if color is invalid', async (done) => {
			let client = await establishConnection(2);
			let result = await client.communicate({
				type: 'mod',
				x: 0,
				y: 3,
				color: [-1, 127, 127]
			});
			expect(result).to.deep.equal({
				type: 'error',
				message: 'Invalid modification.'
			});
			client.close();
			done();
		});
		it('should succeed if operation is valid', async (done) => {
			let client = await establishConnection(2);
			let success = false;
			client.register('mod', (client, data) => {
				expect(data).to.deep.equal({
					type: 'mod',
					x: 0,
					y: 3,
					color: [89, 127, 127]
				});
				success = true;
			});
			let result = await client.communicate({
				type: 'mod',
				x: 0,
				y: 3,
				color: [89, 127, 127]
			});
			expect(result).to.deep.equal({
				type: 'success'
			});
			await new Promise((resolve, reject) => {
				let timer = setInterval(() => {
					if (success) {
						clearInterval(timer);
						client.close();
						resolve();
					}
				}, 10);
			});
			done();
		});
	})

	describe('save', () => {
		it('should fail if not login', async (done) => {
			let client = await establishConnection();
			let result = await client.communicate({ type: 'save' });
			expect(result).to.deep.equal({
				type: 'error',
				message: 'No room found.'
			});
			done();
		});
		it('should succeed if entered room', async (done) => {
			let client = await establishConnection(2);
			let prev = client.lastSave;
			let result = await client.communicate({ type: 'save' });
			expect(result).to.deep.equal({ type: 'success' });
			await new Promise((resolve, reject) => {
				let timer = setInterval(() => {
					if (client.lastSave != prev) {
						clearInterval(timer);
						client.close();
						resolve();
					}
				}, 10);
			});
			done();
		});
	})

	describe('general', () => {

		let randomModification = async (clients, ws, x, y, color) => {
			await ws.communicate({
				type: 'mod',
				x: x,
				y: y,
				color: color
			});
			await new Promise((resolve, reject) => {
				let id = setInterval(() => {
					let success = true;
					for (let i = 0; i < clients.length; i++) {
						for (let j = 0; j < 3; j++) {
							if (clients[i].data.data[x][y][j] != color[j]) {
								success = false;
								break;
							}
						}
						if (!success)
							break;
					}
					if (success) {
						clearInterval(id);
						resolve();
					}
				}, 5);
			});
		};
		let randomSave = async (clients, ws) => {
			let lastSave = [];
			for (let i in clients) {
				lastSave.push(clients[i].lastSave);
			}
			await ws.communicate({ type: 'save' });
			await new Promise((resolve, reject) => {
				let id = setInterval(() => {
					let success = true;
					for (let i = 0; i < clients.length; i++) {
						if (clients[i].lastSave == lastSave[i]) {
							success = false;
							break;
						}
					}
					if (success) {
						clearInterval(id);
						resolve();
					}
				}, 5);
			});
		};

		it('should pass random interaction test - save', async (done) => {
			let clients = [];
			let clientCount = 10;
			let testCount = 100;
			for (let i = 0; i < clientCount; i++) {
				clients.push(await establishConnection(3));
			}
			for (let _=0; _<testCount; _++) {
				let n = parseInt(Math.random() * clientCount);
				await randomSave(clients, clients[n]);
			}
			clients.forEach(client => client.close());
			done();
		}, 3000)

		it('should pass random interaction test - mod', async (done) => {
			let clients = [];
			let clientCount = 10;
			let testCount = 100;
			for (let i = 0; i < clientCount; i++) {
				clients.push(await establishConnection(4));
			}
			let S = clients[0].data.size;
			for (let _=0; _<testCount; _++) {
				let n = parseInt(Math.random() * clientCount);
				let x = parseInt(Math.random() * S);
				let y = parseInt(Math.random() * S);
				let color = [];
				for (let i=0; i<3; i++) {
					color.push(parseInt(Math.random() * 256));
				}
				await randomModification(clients, clients[n], x, y, color);
			}
			clients.forEach(client => client.close());
			done();
		}, 3000)

		it('should pass random interaction test - close', async (done) => {
			let clients = [];
			let clientCount = 10;
			for (let i = 0; i < clientCount; i++) {
				clients.push(await establishConnection(5));
			}
			while (clients.length > 5) {
				let n = parseInt(Math.random() * clients.length);
				clients[n].close();
				clients.splice(n, 1);
			}
			await new Promise((resolve, reject) => {
				setTimeout(resolve, 1500);
			});
			for (let i = 0; i < clients.length; i++) {
				expect(clients[i].roommates).to.have.a.lengthOf(clients.length);
				for (let j = 0; j < clients.length; j++) {
					expect(clients[i].roommates[j]).to.deep.equal({
						id: 1,
						username: 'root'
					});
				}
			}
			clients.forEach(client => client.close());
			done();
		}, 5000)

		it('should pass random interaction test - all', async (done) => {
			let clients = [];
			let clientCount = 20;
			let testCount = 200;
			for (let i = 0; i < clientCount; i++) {
				clients.push(await establishConnection(6));
			}
			let S = clients[0].data.size;
			for (let _=0; _<testCount; _++) {
				let n = parseInt(Math.random() * clients.length);
				let x = parseInt(Math.random() * S);
				let y = parseInt(Math.random() * S);
				let color = [];
				for (let i=0; i<3; i++) {
					color.push(parseInt(Math.random() * 256));
				}
				await randomModification(clients, clients[n], x, y, color);
				if (Math.random() <= 0.1) {
					await randomSave(clients, clients[n]);
				}
				if (Math.random() < (clients.length - 2) / testCount) {
					clients[n].close();
					clients.splice(n, 1);
				}
				if (Math.random() < 0.1) {
					clients.push(await establishConnection(6));
				}
			}
			await new Promise((resolve, reject) => {
				setTimeout(resolve, 1500);
			});
			for (let i = 0; i < clients.length; i++) {
				expect(clients[i].roommates).to.have.a.lengthOf(clients.length);
				for (let j = 0; j < clients.length; j++) {
					expect(clients[i].roommates[j]).to.deep.equal({
						id: 1,
						username: 'root'
					});
				}
			}
			clients.forEach(client => client.close());
			done();
		}, 20000)
	})
});