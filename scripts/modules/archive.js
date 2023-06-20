"use strict";

/**
 * @template Notation 
 */
class Archive {
	/**
	 * @param {String} key 
	 * @param {Notation} [initial] 
	 */
	constructor(key, initial) {
		this.#key = key;
		if (localStorage.getItem(this.#key) === null) {
			localStorage.setItem(this.#key, JSON.stringify((initial === undefined ? `` : initial), undefined, `\t`))
		}
	}
	/** @type {String} */ #key;
	get data() {
		const item = localStorage.getItem(this.#key);
		if (item === null) {
			throw new ReferenceError(`Key '${this.#key}' isn't defined.`);
		}
		return (/** @type {Notation} */ (JSON.parse(item)));
	}
	set data(value) {
		localStorage.setItem(this.#key, JSON.stringify(value, undefined, `\t`));
	}
	/**
	 * @param {(value: Notation) => Notation} action 
	 */
	change(action) {
		this.data = action(this.data);
	}
}