const { expect, assert } = require('chai');

const WebSocket = require('ws');
const frisby = require('frisby');

const url = 'ws://localhost:8081';
const frisbyurl = 'http://localhost:8080';

let clientList = [];

function establishConnection() {
	return new Promise((resolve, reject) => {
		let client = new WebSocket(url);
		client.responseHandler = {};
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
			clientList.push(client);
			resolve(client);
		});
	});
}

describe('websocket', () => {
	afterEach(() => {
		for (let i = 0; i < clientList.length; i++) {
			clientList[i].close();
		}
		clientList = [];
	});
	describe('login', () => {
		let token = '';
		frisby.post(frisbyurl + '/login/', {
			username: 'root',
			password: '24C30216B298744CCC2BA61AB433B71143D2838D4D8ED8BCCDBE606CC76EE8E5'
		})
		.then((response) => {
			token = response.json.token;
		});
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
			done();
		});
	});
});