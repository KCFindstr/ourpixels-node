require('dotenv').config()
const frisby = require('frisby');
const { Joi } = frisby;
const url = 'http://localhost:8080';
const imageStruct = {
	id: Joi.number().required(),
	creator: Joi.number().required(),
	created: Joi.date().required(),
	modified: Joi.date().required(),
	name: Joi.string().required(),
	size: Joi.number().required()
};

it('should return a 200 and a list when retrieving the list of images', () => {
	return frisby
	.get(url + '/image/')
	.expect('status', 200)
	.expect('jsonTypesStrict', '*', imageStruct);
});

it('should return a 404 when trying to access nonexisting image', () => {
	return frisby
	.get(url + '/image/0')
	.expect('status', 404)
	.expect('json', {
		errors: ['No such image.']
	});
});

it('should return a 200 and user information when successfully retrieved data', () => {
	return frisby
	.get(url + '/image/1')
	.expect('status', 200)
	.expect('jsonTypes', imageStruct)
	.expect('jsonTypes', 'data', Joi.array().required())
	.expect('jsonTypes', 'data.*', Joi.array().required())
	.expect('jsonTypes', 'data.*.*', Joi.array().length(3).required())
	.expect('jsonTypes', 'data.*.*.*', Joi.number().min(0).max(255).required());
});
