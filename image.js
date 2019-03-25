const radix = 32;

module.exports = {
	decode: (data, n) => {
		let ret = [];
		let ptr = 0;
		for (let i=0; i<n; i++) {
			let arr = [];
			for (let j=0; j<n; j++) {
				let cur = [];
				for (let k=0; k<3; k++) {
					let tmp = data.substr(ptr, 2);
					cur.push(parseInt(tmp, radix));
					ptr += 2;
				}
				arr.push(cur);
			}
			ret.push(arr);
		}
		return ret;
	},
	encode: (object) => {
		let n = object.length;
		let ret = '';
		for (let i=0; i<n; i++) {
			for (let j=0; j<n; j++) {
				for (let k=0; k<3; k++) {
					let tmp = object[i][j][k].toString(radix);
					while (tmp.length < 2) {
						tmp = '0' + tmp;
					}
					ret += tmp;
				}
			}
		}
		return ret;
	}
}