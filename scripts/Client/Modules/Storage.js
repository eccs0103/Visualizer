"use strict";

//#region Archive
/**
 * @template T 
 */
class Archive {
	/**
	 * @param {string} key 
	 * @param {T} initial
	 */
	constructor(key, initial) {
		this.#key = key;
		if (localStorage.getItem(this.#key) === null) {
			this.data = initial;
		}
	}
	/** @type {string} */ #key;
	get data() {
		const item = localStorage.getItem(this.#key) ?? (() => {
			throw new ReferenceError(`Key '${this.#key}' isn't defined`);
		})();
		return (/** @type {T} */ (JSON.parse(item)));
	}
	set data(value) {
		localStorage.setItem(this.#key, JSON.stringify(value, undefined, `\t`));
	}
	/**
	 * @param {(value: T) => T} action 
	 */
	change(action) {
		this.data = action(this.data);
	}
}
//#endregion
//#region Notation progenitor
/**
 * @abstract
 */
class NotationProgenitor {
	/**
	 * @param {any} source 
	 * @returns {NotationProgenitor}
	 */
	static import(source) {
		throw new ReferenceError(`Not implemented function`);
	}
	/**
	 * @param {NotationProgenitor} source 
	 * @returns {any}
	 */
	static export(source) {
		throw new ReferenceError(`Not implemented function`);
	}
}
//#endregion
//#region Notation container
/**
 * @template {typeof NotationProgenitor} T
 */
class NotationContainer {
	/**
	 * @param {T} prototype 
	 * @param {string} path 
	 */
	constructor(prototype, path) {
		this.#prototype = prototype;
		const archive = new Archive(path, prototype.export(Reflect.construct(this.#prototype, [])));
		//
		const object = prototype.import(archive.data);
		if (!(object instanceof prototype)) {
			throw new TypeError(`The return type of the import function must be the same as the prototype`);
		}
		this.#content = (/** @type {InstanceType<T>} */ (object));
		window.addEventListener(`beforeunload`, (event) => {
			archive.data = prototype.export(this.#content);
		});
	}
	/** @type {T} */ #prototype;
	/** @type {InstanceType<T>} */ #content;
	get content() {
		return this.#content;
	}
	reset() {
		this.#content = (/** @type {InstanceType<T>} */ (Reflect.construct(this.#prototype, [])));
	}
}
//#endregion

export { Archive, NotationProgenitor, NotationContainer };