const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');

module.exports = sequelize.define('Users', {
	id: {
		field: 'UserId',
		type: Sequelize.INTEGER,
		primaryKey: true
	},
	username: {
		field: 'Username',
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notNull: {
				msg: 'Username is required.'
			},
			len: {
				args: [3, 18],
				msg: 'Username must have 3-18 characters.'
			}
		}
	},
	password: {
		field: 'Password',
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notNull: {
				msg: 'Password is required.'
			}
		}
	},
	admin: {
		field: 'Admin',
		type: Sequelize.INTEGER
	},
	createdAt: {
		type: Sequelize.DATE,
		field: 'created_at'
	},
	updatedAt: {
		type: Sequelize.DATE,
		field: 'updated_at'
	},
	token: {
		type: Sequelize.STRING,
		field: 'Token'
	}
}, {
	timestamps: true
});