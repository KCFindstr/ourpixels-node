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
		username: 'test'
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
		username: 'test',
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
		username: 'test',
		password: 'password'
	})
	.then((response) => {
		let token = response.json.token;
		return frisby.post(url + '/logout', {
			username: 'test',
			token: token
		})
		.expect('status', 200)
		.expect('json', {
			username: 'test',
			success: true
		});
	});
});