require('dotenv').config()
const frisby = require('frisby');
const { Joi } = frisby;
const url = 'http://localhost:8080';

it('login without username and password should return a 422', () => {
	return frisby
	.post(url + '/login/')
	.expect('status', 422)
	.expect('json', {
		errors: ['Username and password are required.']
	});
});

it('login without username should return a 422', () => {
	return frisby
	.post(url + '/login/', {
		username: 'test'
	})
	.expect('status', 422)
	.expect('json', {
		errors: ['Username and password are required.']
	});
});

it('login without username should return a 422', () => {
	return frisby
	.post(url + '/login/', {
		password: 'root'
	})
	.expect('status', 422)
	.expect('json', {
		errors: ['Username and password are required.']
	});
});

it('login with wrong credentials should return a 422', () => {
	return frisby
	.post(url + '/login/', {
		username: 'test',
		password: 'root'
	})
	.expect('status', 422)
	.expect('json', {
		errors: ['Authentication failed.']
	});
});

it('should return a 200 when successfully login', () => {
	return frisby
	.post(url + '/login/', {
		username: 'test',
		password: 'password'
	})
	.expect('status', 200)
	.expect('json', {
		username: 'test',
		success: true,
	})
	.expect('jsonTypes', 'token', Joi.string().required());
});