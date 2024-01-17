"use strict";

//#region Database
class Database {
	/**
	 * @param {string} database 
	 * @param {string} store 
	 */
	constructor(database, store) {
		this.#database = database;
		this.#store = store;
	}
	/** @type {string} */ #database;
	/** @type {string} */ #store;
	/**
	 * @param {string} database 
	 * @param {string} store 
	 */
	async #getStore(database, store) {
		const requestOpen = indexedDB.open(database);
		requestOpen.addEventListener(`upgradeneeded`, (event) => {
			const database = requestOpen.result;
			if (!database.objectStoreNames.contains(store)) {
				database.createObjectStore(store);
			}
		});
		const promiseOpened = (/** @type {Promise<IDBDatabase>} */ (new Promise((resolve, reject) => {
			requestOpen.addEventListener(`success`, () => resolve(requestOpen.result));
			requestOpen.addEventListener(`error`, () => reject(requestOpen.error));
		})));
		const transaction = (await promiseOpened).transaction([store], `readwrite`);
		return transaction.objectStore(store);
	}
	/**
	 * @param {string} key 
	 */
	async get(key) {
		const $store = await this.#getStore(this.#database, this.#store);
		const requestGet = $store.get(key);
		const promiseGet = new Promise((resolve, reject) => {
			requestGet.addEventListener(`success`, () => resolve(requestGet.result));
			requestGet.addEventListener(`error`, () => reject(requestGet.error));
		});
		return promiseGet;
	};
	/**
	 * @param {string} key 
	 * @param {any} value 
	 */
	async set(key, value) {
		const $store = await this.#getStore(this.#database, this.#store);
		const requestSet = $store.put(value, key);
		const promiseSet = (/** @type {Promise<void>} */ (new Promise((resolve, reject) => {
			requestSet.addEventListener(`success`, () => resolve());
			requestSet.addEventListener(`error`, () => reject(requestSet.error));
		})));
		return promiseSet;
	};
}
//#endregion
//#region Locker
/**
 * @template T
 */
class Locker extends Database {
	/**
	 * @param {string} database 
	 * @param {string} store 
	 * @param {string} key 
	 */
	constructor(database, store, key) {
		super(database, store);
		this.#key = key;
	}
	/** @type {string} */ #key;
	/**
	 * @returns {Promise<T>}
	 */
	async get() {
		return await super.get(this.#key);
	}
	/**
	 * @param {T} value 
	 */
	// @ts-ignore
	async set(value) {
		await super.set(this.#key, value);
	}
}
//#endregion

export { Database, Locker };