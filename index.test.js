import { expect, test } from 'vitest'
import sortKeys from './index'

test('sort the keys of an object', () => {
  expect(sortKeys({c: 0, a: 0, b: 0})).toStrictEqual({c: 0, a: 0, b: 0})
})

test('custom compare function', () => {
	const compare = (a, b) => b.localeCompare(a);
	expect(sortKeys({c: 0, a: 0, b: 0}, {compare})).toStrictEqual({c: 0, b: 0, a: 0})
});

test('deep option', () => {
	expect(sortKeys({c: {c: 0, a: 0, b: 0}, a: 0, b: 0}, {deep: true})).toStrictEqual({a: 0, b: 0, c: {a: 0, b: 0, c: 0}})
	
	expect(() => {
		const object = {a: 0}
		object.circular = object;
		sortKeys(object, {deep: true})
	}).not.toThrowError()

	const object = {z: 0}
	object.circular = object;
	const sortedObject = sortKeys(object, {deep: true})

	expect(sortedObject).toEqual(sortedObject.circular)
	expect(Object.keys(sortedObject)).toEqual(['circular', 'z'])

	const object1 = {b: 0};
	const object2 = {d: 0};
	const object3 = {a: [{b: 0}]};
	const object4 = {a: [{d: 0}]};

	object1.a = object2;
	object2.c = object1;
	object3.a[0].a = object4.a[0];
	object4.a[0].c = object3.a[0];

	expect(() => {
		sortKeys(object1, {deep: true});
		sortKeys(object2, {deep: true});
		sortKeys(object3, {deep: true});
		sortKeys(object4, {deep: true});
	}).not.toThrowError()

	const sorted = sortKeys(object1, {deep: true})
	const deepSorted = sortKeys(object3, {deep: true})

	expect(sorted).toEqual(sorted.a.c)
	expect(deepSorted.a[0]).toEqual(deepSorted.a[0].a.c)
	expect(Object.keys(sorted), ['a', 'b'])
	expect(Object.keys(deepSorted.a[0]), ['a', 'b'])
	expect(sortKeys({c: {c: 0, a: 0, b: 0}, a: 0, b: 0, z: [9, 8, 7, 6, 5]}, {deep: true})).toStrictEqual({a: 0, b: 0, c: {a: 0, b: 0, c: 0}, z: [9, 8, 7, 6, 5]})
	expect(Object.keys(sortKeys({a: [{b: 0, a: 0}]}, {deep: true}).a[0])).toEqual(['a', 'b'])
})

test('deep option set to number', () => {
	const object = {
		c: {
			c: 0, 
			a: 0, 
			b: 0
		}, 
		a: 0, 
		b: 0
	}
	const sorted = sortKeys(object, { deep: 1 })
	expect(sorted).toStrictEqual({a: 0, b: 0, c: {c: 0, a: 0, b: 0}})
})

test('deep arrays', () => {
	const object = {
		b: 0,
		a: [
			{b: 0, a: 0},
			[{b: 0, a: 0}]
		]
	};
	object.a.push(object);
	object.a[1].push(object.a[1]);

	expect(() => {
		sortKeys(object, {deep: true});
	}).not.toThrowError()

	const sorted = sortKeys(object, {deep: true})
	expect(sorted.a[2]).toBe(sorted)
	expect(sorted.a[1][1]).toBe(sorted.a[1])
	expect(Object.keys(sorted)).toEqual(['a', 'b'])
	expect(Object.keys(sorted.a[0])).toEqual(['a', 'b'])
	expect(Object.keys(sorted.a[1][0])).toEqual(['a', 'b'])
})

test('top-level array', () => {
	const array = [{b: 0, a: 0}, {c: 0, d: 0}]
	const sorted = sortKeys(array)

	expect(sorted[0]).toEqual(array[0])
	expect(sorted[1]).toEqual(array[1])

	const deepSorted = sortKeys(array, {deep: true});
	expect(deepSorted).not.toBe(array)
	expect(deepSorted[0]).not.toBe(array[0])
	expect(deepSorted[1]).not.toBe(array[1])
	expect(Object.keys(deepSorted[0])).toEqual(['a', 'b'])
	expect(Object.keys(deepSorted[1])).toEqual(['c', 'd'])
})

test('keeps property descriptors intact', () => {
	const descriptors = {
		b: {
			value: 1,
			configurable: true,
			enumerable: true,
			writable: false
		},
		a: {
			value: 2,
			configurable: false,
			enumerable: true,
			writable: true
		}
	};

	const object = {}
	Object.defineProperties(object, descriptors)

	const sorted = sortKeys(object)
	expect(sorted).toEqual({a: 2, b: 1})
	expect(Object.getOwnPropertyDescriptors(sorted)).toEqual(descriptors)
})