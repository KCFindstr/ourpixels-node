const Sequelize = require('sequelize');
const sequelize = require('../database/sequelize');

module.exports = sequelize.define('ImageData', {
	id: {
		field: 'ImageId',
		type: Sequelize.INTEGER,
		allowNull: false,
		primaryKey: true,
		validate: {
			notNull: {
				msg: 'Id is required.'
			},
			isNumeric: {
				msg: 'Id must be numeric.'
			}
		}
	},
	creator: {
		field: 'CreatorId',
		type: Sequelize.INTEGER,
		allowNull: false,
		validate: {
			notNull: {
				msg: 'Creator is required.'
			},
			isNumeric: {
				msg: 'Creator must be numeric.'
			}
		}
	},
	data: {
		field: 'Data',
		allowNull: false,
		type: Sequelize.TEXT('medium'),
		validate: {
			notNull: {
				msg: 'Data is required.'
			}
		}
	},
	name: {
		field: 'Name',
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notNull: {
				msg: 'Name is required.'
			}
		}
	},
	size: {
		field: 'Size',
		type: Sequelize.INTEGER,
		allowNull: false,
		validate: {
			notNull: {
				msg: 'Size is required.'
			},
			isNumeric: {
				msg: 'Size must be numeric.'
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
	timestamps: true
});