"use strict";
/**
 * @template Notation 
 */
class Archive {
	/**
	 * @param {String} path 
	 * @param {Notation | undefined} initial 
	 */
	constructor(path, initial = undefined) {
		this.#path = path;
		if (localStorage.getItem(path) === null && initial !== undefined) {
			localStorage.setItem(path, JSON.stringify(initial, undefined, `\t`));
		}
	}
	/** @type {String} */ #path;
	get data() {
		const item = localStorage.getItem(this.#path);
		if (item === null) {
			throw new ReferenceError(`Key '${this.#path}' isn't defined.`);
		}
		return (/** @type {Notation} */ (JSON.parse(item)));
	}
	set data(value) {
		localStorage.setItem(this.#path, JSON.stringify(value, undefined, `\t`));
	}
	/**
	 * @param {(value: Notation) => Notation} action 
	 */
	change(action) {
		this.data = action(this.data);
	}
}
