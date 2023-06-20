"use strict";

/**
* @template Notation
*/
class Database {
	/**
	 * @param {String} path 
	 */
	constructor(path) {
		this.#path = path;
	}
	/** @type {String} */ #path;
	/**
	 * @param {String} key 
	 * @returns {Promise<Notation>} 
	 */
	async get(key) {
		const store = await (/** @type {Promise<IDBObjectStore>} */ (new Promise((resolve, reject) => {
			const request = indexedDB.open(`database`, 1);
			request.addEventListener(`upgradeneeded`, (event) => {
				request.result.createObjectStore(this.#path);
			});
			request.addEventListener(`success`, (event) => {
				const transaction = request.result.transaction(this.#path, `readwrite`);
				resolve(transaction.objectStore(this.#path));
			});
			request.addEventListener(`error`, (event) => {
				reject(request.error);
			});
		})));
		/** @type {IDBRequest<Notation>} */ const request = store.get(key);
		return new Promise((resolve, reject) => {
			request.addEventListener(`success`, (event) => {
				resolve(request.result);
			});
			request.addEventListener(`error`, (event) => {
				reject(request.error);
			});
		});
	}
	/**
	 * @param {String} key 
	 * @param {Notation} value 
	 * @returns {Promise<void>} 
	 */
	async set(key, value) {
		const store = await (/** @type {Promise<IDBObjectStore>} */ (new Promise((resolve, reject) => {
			const request = indexedDB.open(`database`, 1);
			request.addEventListener(`upgradeneeded`, (event) => {
				request.result.createObjectStore(this.#path);
			});
			request.addEventListener(`success`, (event) => {
				const transaction = request.result.transaction(this.#path, `readwrite`);
				resolve(transaction.objectStore(this.#path));
			});
			request.addEventListener(`error`, (event) => {
				reject(request.error);
			});
		})));
		/** @type {IDBRequest<IDBValidKey>} */ const request = store.put(value, key);
		return new Promise((resolve, reject) => {
			request.addEventListener(`success`, (event) => {
				resolve();
			});
			request.addEventListener(`error`, (event) => {
				reject(request.error);
			});
		});
	}
	/**
	 * @param {String} key 
	 * @param {(value: Notation) => Notation} action 
	 */
	async change(key, action) {
		return this.set(key, action(await this.get(key)));
	}
}