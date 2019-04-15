require('dotenv').config()
const frisby = require('frisby');
const { Joi } = frisby;
const url = 'http://localhost:8080';

it('logout without username and token should return a 422', () => {
	return frisby
	.post(url + '/logout/')
	.expect('status', 422)
	.expect('json', {
		errors: ['User not found.']
	});
});

it('logout without token should return a 422', () => {
	return frisby
	.post(url + '/logout/', {
		username: 'root'
	})
	.expect('status', 422)
	.expect('json', {
		errors: ['User not found.']
	});
});

it('logout without username should return a 422', () => {
	return frisby
	.post(url + '/logout/', {
		token: 'root'
	})
	.expect('status', 422)
	.expect('json', {
		errors: ['User not found.']
	});
});

it('logout with wrong token should return a 422', () => {
	return frisby
	.post(url + '/logout/', {
		username: 'root',
		token: 'root'
	})
	.expect('status', 422)
	.expect('json', {
		errors: ['User not found.']
	});
});

it('should return a 200 when successfully logout', () => {
	return frisby
	.post(url + '/login/', {
		username: 'root',
		password: '24C30216B298744CCC2BA61AB433B71143D2838D4D8ED8BCCDBE606CC76EE8E5'
	})
	.then((response) => {
		let token = response.json.token;
		return frisby.post(url + '/logout', {
			username: 'root',
			token: token
		})
		.expect('status', 200)
		.expect('json', {
			username: 'root',
			success: true
		});
	});
});