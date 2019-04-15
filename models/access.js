const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');

module.exports = sequelize.define('Access', {
	id: {
		field: 'AccessId',
		type: Sequelize.INTEGER,
		allowNull: false,
		validate: {
			notNull: {
				msg: 'Id is required.'
			},
			isNumeric: {
				msg: 'Id must be numeric.'
			}
		},
		primaryKey: true
	},
	user: {
		field: 'UserId',
		type: Sequelize.INTEGER,
		allowNull: false,
		validate: {
			notNull: {
				msg: 'User is required.'
			},
			isNumeric: {
				msg: 'User must be numeric.'
			}
		}
	},
	image: {
		field: 'ImageId',
		type: Sequelize.INTEGER,
		allowNull: false,
		validate: {
			notNull: {
				msg: 'Image is required.'
			},
			isNumeric: {
				msg: 'Image must be numeric.'
			}
		}
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
	timestamps: true,
	tableName: 'Access'
});