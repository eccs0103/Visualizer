"use strict";

class Random {
	/**
	 * @param {Number} min 
	 * @param {Number} max 
	 * @returns [min -max)
	 */
	static number(min, max) {
		return Math.random() * (max - min) + min;
	}
	/**
	 * @param {Number} min 
	 * @param {Number} max 
	 * @returns [min -max)
	 */
	static integer(min, max) {
		return Math.trunc(Random.number(min, max));
	}
	/**
	 * @template Item 
	 * @param {Array<Item>} array 
	 */
	static item(array) {
		return array[Random.integer(0, array.length)];
	}
	/**
	 * @template Item 
	 * @param {Map<Item, Number>} cases 
	 */
	static case(cases) {
		const summary = Array.from(cases).reduce((previous, [, percentage]) => previous + percentage, 0);
		const random = Random.number(0, summary);
		let start = 0;
		for (const [item, percentage] of cases) {
			const end = start + percentage;
			if (start <= random && random < end) {
				return item;
			}
			start = end;
		}
		throw new ReferenceError(`Can't select value. Maybe stack is empty.`);
	}
}
