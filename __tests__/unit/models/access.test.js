const Access = require('../../../models/access');
const { expect, assert } = require('chai');

function getAccessStruct() {
	return {
		id: 100,
		user: 1,
		image: 2
	};
}

describe('access', () => {
	describe('general', () => {
		it('should pass if everything is good', async () => {
			let temp = getAccessStruct();
			let access = new Access(temp);
			assert(await access.validate());
		});
	});

	describe('id', () => {
		it('should fail if not presented', async () => {
			try {
				let temp = getAccessStruct();
				temp.id = undefined;
				let access = new Access(temp);
				assert(!await access.validate());
			} catch (error) {
				expect(error.errors[0].message).to.equal('Id is required.');
			}
		});
		it('should fail if not numeric', async () => {
			try {
				let temp = getAccessStruct();
				temp.id = 'test';
				let access = new Access(temp);
				assert(!await access.validate());
			} catch (error) {
				expect(error.errors[0].message).to.equal('Id must be numeric.');
			}
		});
	});

	describe('user', () => {
		it('should fail if not presented', async () => {
			try {
				let temp = getAccessStruct();
				temp.user = undefined;
				let access = new Access(temp);
				assert(!await access.validate());
			} catch (error) {
				expect(error.errors[0].message).to.equal('User is required.');
			}
		});
		it('should fail if not numeric', async () => {
			try {
				let temp = getAccessStruct();
				temp.user = 'test';
				let access = new Access(temp);
				assert(!await access.validate());
			} catch (error) {
				expect(error.errors[0].message).to.equal('User must be numeric.');
			}
		});
	});

	describe('image', () => {
		it('should fail if not presented', async () => {
			try {
				let temp = getAccessStruct();
				temp.image = undefined;
				let access = new Access(temp);
				assert(!await access.validate());
			} catch (error) {
				expect(error.errors[0].message).to.equal('Image is required.');
			}
		});
		it('should fail if not numeric', async () => {
			try {
				let temp = getAccessStruct();
				temp.image = 'test';
				let access = new Access(temp);
				assert(!await access.validate());
			} catch (error) {
				expect(error.errors[0].message).to.equal('Image must be numeric.');
			}
		});
	});
});