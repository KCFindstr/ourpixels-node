const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');

module.exports = sequelize.define('ImageData', {
	id: {
		field: 'ImageId',
		type: Sequelize.INTEGER,
		primaryKey: true
	},
	creator: {
		field: 'CreatorId',
		type: Sequelize.INTEGER
	},
	data: {
		field: 'Data',
		type: Sequelize.TEXT('medium')
	},
	name: {
		field: 'Name',
		type: Sequelize.STRING
	},
	size: {
		field: 'Size',
		type: Sequelize.INTEGER
	},
	createdAt: {
		type: Sequelize.DATE,
		field: 'created_at'
	},
	updatedAt: {
		type: Sequelize.DATE,
		field: 'updated_at'
	}
}, {
	timestamps: true
});