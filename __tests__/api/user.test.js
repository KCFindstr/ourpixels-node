require('dotenv').config()
const frisby = require('frisby');
const { Joi } = frisby;
const url = 'http://localhost:8080';
const userStruct = {
	id: Joi.number().required(),
	username: Joi.string().required(),
	admin: Joi.number().required(),
	created: Joi.date().required(),
	lastLogin: Joi.date().required(),
	artwork: Joi.array().required()
};

it('should return a 200 and a list when retrieving the list of users', () => {
	return frisby
	.get(url + '/user/')
	.expect('status', 200)
	.expect('jsonTypesStrict', '*', userStruct)
	.expect('jsonTypes', '*.artwork.*', Joi.number());
});

it('should return a 404 when trying to access nonexisting user', () => {
	return frisby
	.get(url + '/user/0')
	.expect('status', 404)
	.expect('json', {
		errors: ['No such user.']
	});
});

it('should return a 200 and user information when successfully retrieved data', () => {
	return frisby
	.get(url + '/user/1')
	.expect('status', 200)
	.expect('jsonTypesStrict', userStruct);
});
