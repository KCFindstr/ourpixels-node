const Image = require('../../../models/imagedata');
const { expect, assert } = require('chai');

function getImageStruct() {
	return {
		id: 100,
		creator: 1,
		data: '123456',
		name: 'starlight',
		size: 8
	};
}

describe('imagedata', () => {
	describe('general', () => {
		it('should pass if everything is good', async () => {
			let temp = getImageStruct();
			let image = new Image(temp);
			assert(await image.validate());
		});
	});

	describe('id', () => {
		it('should fail if not numeric', async () => {
			try {
				let temp = getImageStruct();
				temp.id = 'test';
				let image = new Image(temp);
				assert(!await image.validate());
			} catch (error) {
				expect(error.errors[0].message).to.equal('Id must be numeric.');
			}
		});
	});

	describe('creator', () => {
		it('should fail if not presented', async () => {
			try {
				let temp = getImageStruct();
				temp.creator = undefined;
				let image = new Image(temp);
				assert(!await image.validate());
			} catch (error) {
				expect(error.errors[0].message).to.equal('Creator is required.');
			}
		});
		it('should fail if not numeric', async () => {
			try {
				let temp = getImageStruct();
				temp.creator = 'test';
				let image = new Image(temp);
				assert(!await image.validate());
			} catch (error) {
				expect(error.errors[0].message).to.equal('Creator must be numeric.');
			}
		});
	});

	describe('data', () => {
		it('should fail if not presented', async () => {
			try {
				let temp = getImageStruct();
				temp.data = undefined;
				let image = new Image(temp);
				assert(!await image.validate());
			} catch (error) {
				expect(error.errors[0].message).to.equal('Data is required.');
			}
		});
	});

	describe('name', () => {
		it('should fail if not presented', async () => {
			try {
				let temp = getImageStruct();
				temp.name = undefined;
				let image = new Image(temp);
				assert(!await image.validate());
			} catch (error) {
				expect(error.errors[0].message).to.equal('Name is required.');
			}
		});
	});

	describe('size', () => {
		it('should fail if not presented', async () => {
			try {
				let temp = getImageStruct();
				temp.size = undefined;
				let image = new Image(temp);
				assert(!await image.validate());
			} catch (error) {
				expect(error.errors[0].message).to.equal('Size is required.');
			}
		});
		it('should fail if not numeric', async () => {
			try {
				let temp = getImageStruct();
				temp.size = 'test';
				let image = new Image(temp);
				assert(!await image.validate());
			} catch (error) {
				expect(error.errors[0].message).to.equal('Size must be numeric.');
			}
		});
	});
});