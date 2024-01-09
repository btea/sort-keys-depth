import isPlainObject from 'is-plain-obj';

export default function sortKeys(object, options = {}) {
	if (!isPlainObject(object) && !Array.isArray(object)) {
		throw new TypeError('Expected a plain object or array');
	}

	let {deep} = options;
	const isNumber = typeof deep === 'number';
	const {compare} = options;
	const seenInput = [];
	const seenOutput = [];

	const deepSortArray = array => {
		if (isNumber && deep !== Number.POSITIVE_INFINITY) {
			if (deep <= 0) {
				return array;
			}

			deep--;
		}

		const seenIndex = seenInput.indexOf(array);
		if (seenIndex !== -1) {
			return seenOutput[seenIndex];
		}

		const result = [];
		seenInput.push(array);
		seenOutput.push(result);

		result.push(...array.map(item => {
			if (Array.isArray(item)) {
				return deepSortArray(item);
			}

			if (isPlainObject(item)) {
				return _sortKeys(item);
			}

			return item;
		}));

		return result;
	};

	const _sortKeys = object => {
		if (isNumber && deep !== Number.POSITIVE_INFINITY) {
			if (deep <= 0) {
				return object;
			}

			deep--;
		}

		const seenIndex = seenInput.indexOf(object);
		if (seenIndex !== -1) {
			return seenOutput[seenIndex];
		}

		const result = {};
		const keys = Object.keys(object).sort(compare);

		seenInput.push(object);
		seenOutput.push(result);

		for (const key of keys) {
			const value = object[key];
			let newValue;

			if (deep && Array.isArray(value)) {
				newValue = deepSortArray(value);
			} else {
				newValue = deep && isPlainObject(value) ? _sortKeys(value) : value;
			}

			Object.defineProperty(result, key, {
				...Object.getOwnPropertyDescriptor(object, key),
				value: newValue
			});
		}

		return result;
	};

	if (Array.isArray(object)) {
		return deep ? deepSortArray(object) : object.slice();
	}

	return _sortKeys(object);
}
