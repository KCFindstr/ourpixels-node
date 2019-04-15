const User = require('../../../models/user');
const { expect } = require('chai');

function getUserStruct() {
	return {
		id: 100,
		username: 'admin',
		password: '123456',
		admin: 0,
		createdAt: Date(),
		updatedAt: Date(),
		token: '987654'
	};
}

describe('user', () => {
	describe('general', () => {
		it('should pass if everything is good', async () => {
			let temp = getUserStruct();
			let user = new User(temp);
			await user.validate();
		});
	});

	describe('id', () => {
		it('should fail if not numeric', async () => {
			try {
				let temp = getUserStruct();
				temp.id = 'test';
				let user = new User(temp);
				await user.validate();
			} catch (error) {
				expect(error.errors[0].message).to.equal('Id must be numeric.');
			}
		});
	});

	describe('username', () => {
		it('should fail if not presented', async () => {
			try {
				let temp = getUserStruct();
				temp.username = undefined;
				let user = new User(temp);
				await user.validate();
			} catch (error) {
				expect(error.errors[0].message).to.equal('Username is required.');
			}
		});
		it('should fail if not string', async () => {
			try {
				let temp = getUserStruct();
				temp.username = 123;
				let user = new User(temp);
				await user.validate();
			} catch (error) {
				expect(error.errors[0].message).to.equal('Username must be a string.');
			}
		});
		it('should fail if too short', async () => {
			try {
				let temp = getUserStruct();
				temp.username = 'lo';
				let user = new User(temp);
				await user.validate();
			} catch (error) {
				expect(error.errors[0].message).to.equal('Username must have 3-18 characters.');
			}
		});
		it('should fail if too long', async () => {
			try {
				let temp = getUserStruct();
				temp.username = 'areallylongusername';
				let user = new User(temp);
				await user.validate();
			} catch (error) {
				expect(error.errors[0].message).to.equal('Username must have 3-18 characters.');
			}
		});
	});

	describe('password', () => {
		it('should fail if not presented', async () => {
			try {
				let temp = getUserStruct();
				temp.password = undefined;
				let user = new User(temp);
				await user.validate();
			} catch (error) {
				expect(error.errors[0].message).to.equal('Password is required.');
			}
		});
	});

	describe('admin', () => {
		it('should fail if not presented', async () => {
			try {
				let temp = getUserStruct();
				temp.admin = undefined;
				let user = new User(temp);
				await user.validate();
			} catch (error) {
				expect(error.errors[0].message).to.equal('Admin is required.');
			}
		});	
		it('should fail if not numeric', async () => {
			try {
				let temp = getUserStruct();
				temp.admin = '123';
				let user = new User(temp);
				await user.validate();
			} catch (error) {
				expect(error.errors[0].message).to.equal('Admin must be numeric.');
			}
		});
	});

	describe('token', () => {
		it('should fail if not presented', async () => {
			try {
				let temp = getUserStruct();
				temp.token = undefined;
				let user = new User(temp);
				await user.validate();
			} catch (error) {
				expect(error.errors[0].message).to.equal('Token is required.');
			}
		});
	});
});