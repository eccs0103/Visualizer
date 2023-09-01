"use strict";

class Database {
	/**
	 * @param {String} database 
	 * @param {String} store 
	 */
	constructor(database, store) {
		this.#database = database;
		this.#store = store;
	}
	/** @type {String} */ #database;
	/** @type {String} */ #store;
	/**
	 * @param {String} database 
	 * @param {String} store 
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
	 * @param {String} key 
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
	 * @param {String} key 
	 * @param {any} value 
	 * @virtual
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

/**
 * @template Notation
 */
class Locker extends Database {
	/**
	 * @param {String} database 
	 * @param {String} store 
	 * @param {String} key 
	 */
	constructor(database, store, key) {
		super(database, store);
		this.#key = key;
	}
	/** @type {String} */ #key;
	/**
	 * @returns {Promise<Notation>}
	 */
	async get() {
		return await super.get(this.#key);
	}
	/**
	 * @param {Notation} value 
	 */
	// @ts-ignore
	async set(value) {
		await super.set(this.#key, value);
	}
}
