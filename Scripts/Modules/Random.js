"use strict";

const { random, trunc } = Math;

//#region Random
class Random {
	/**
	 * @param {number} min 
	 * @param {number} max 
	 * @returns [min -max)
	 */
	number(min, max) {
		return random() * (max - min) + min;
	}
	/**
	 * @param {number} min 
	 * @param {number} max 
	 * @returns [min -max)
	 */
	integer(min, max) {
		return trunc(this.number(min, max));
	}
	/**
	 * @template T 
	 * @param {T[]} array 
	 */
	item(array) {
		return array[this.integer(0, array.length)];
	}
	/**
	 * @template T 
	 * @param {Map<T, number>} cases 
	 */
	case(cases) {
		const summary = [...cases].reduce((previous, [, percentage]) => previous + percentage, 0);
		const random = this.number(0, summary);
		let begin = 0;
		for (const [item, percentage] of cases) {
			const end = begin + percentage;
			if (begin <= random && random < end) {
				return item;
			}
			begin = end;
		}
		throw new RangeError(`Selector ${random} is out of range [0 - ${summary})`);
	}
	GUID() {
		return `${crypto.randomUUID()}`;
	}
}
//#endregion

export { Random };
