"use strict";
class Random {
	/**
	 * @param {Number} min 
	 * @param {Number} max 
	 */
	static number(min, max) {
		return Math.random() * (max - min) + min;
	}
	/**
	 * @template Item 
	 * @param {Array<Item>} array 
	 */
	static item(array) {
		return array[Math.floor(Random.number(0, array.length))];
	}
	/**
	 * @template Item 
	 * @param {Map<Item, Number>} cases 
	 * @returns 
	 */
	static case(cases) {
		const summary = Array.from(cases).reduce((previous, [, percentage]) => previous + percentage, 0);
		const random = Random.number(0, summary);
		let selection = undefined;
		let start = 0;
		for (const [item, percentage] of cases) {
			const end = start + percentage;
			if (start <= random && random < end) {
				selection = item;
				break;
			}
			start = end;
		}
		if (selection === undefined) {
			throw new ReferenceError(`Can't select value. Maybe stack is empty.`);
		}
		return selection;
	}
}
