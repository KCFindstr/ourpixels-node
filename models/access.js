const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');

module.exports = sequelize.define('Access', {
	id: {
		field: 'AccessId',
		type: Sequelize.INTEGER,
		primaryKey: true
	},
	user: {
		field: 'UserId',
		type: Sequelize.INTEGER
	},
	image: {
		field: 'ImageId',
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