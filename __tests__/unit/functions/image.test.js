const image = require('../../../image');
const { expect } = require('chai');
const white = [255, 255, 255];
const testNumber = 50;
const testSize = 100;

describe('image converter', () => {
	describe('encode', () => {
		it('should return empty string for empty array', () => {
			let result = image.encode([]);
			expect(result).to.equal('');
		});
		it('should use white(ff) as placeholder if input array is too short', () => {
			let result = image.encode([
				[ [1, 3] ],
				[]
			]);
			expect(result).to.equal('0103ffffffffffffffffffff');
		});
		it('should work if input array is sufficiently long', () => {
			let result = image.encode([
				[ [1, 2, 3], [4, 5, 6] ],
				[ [6, 7, 8], [9, 10, 11] ]
			]);
			expect(result).to.equal('010203040506060708090a0b');
		});
	});
	describe('decode', () => {
		it('should return empty array for n=0', () => {
			let result = image.decode('', 0);
			expect(result).to.deep.equal([]);
		});
		it('should use white(255,255,255) as placeholder if input string is too short', () => {
			let result = image.decode('AA1298', 2);
			expect(result).to.deep.equal([
				[ [170, 18, 152], white ],
				[ white, white ]
			]);
		});
		it('should work if input string is sufficiently long', () => {
			let result = image.decode('AA12981298AA000001010203test', 2);
			expect(result).to.deep.equal([
				[ [170, 18, 152], [ 18, 152, 170] ],
				[ [0, 0, 1], [1, 2, 3] ]
			]);
		});
	});
	describe('interaction', () => {
		it('should successfully decode encoded strings (random)', () => {
			for (let _ = 0; _ < testNumber; _++) {
				let n = Math.floor(Math.random() * testSize);
				let input = [];
				for (let i = 0; i < n; i++) {
					let curi = [];
					for (let j = 0; j < n; j++) {
						let curj = [];
						for (let k = 0; k < 3; k++) {
							curj.push(parseInt(Math.random() * 256));
						}
						curi.push(curj);
					}
					input.push(curi);
				}
				let encoded = image.encode(input);
				expect(encoded.length).to.equal(n * n * 3 * 2);
				let decoded = image.decode(encoded, n);
				expect(decoded).to.deep.equal(input);
			}
		});
	});
});