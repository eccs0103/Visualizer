// @ts-ignore
/** @typedef {import("./informant.js")} */
// @ts-ignore
/** @typedef {import("./panel.js")} */

"use strict";

class Manager extends Informant {
	/** @type {ACPanelElement} */ static #panelLoader;
	static {
		const panelLoader = document.querySelector(`ac-panel.loader`);
		if (!(panelLoader instanceof ACPanelElement)) {
			throw new TypeError(`Invalid element: ${panelLoader}`);
		}
		Manager.#panelLoader = panelLoader;
	}
	/**
	 * @param {Promise<unknown>} promise 
	 */
	static async load(promise) {
		try {
			Manager.#panelLoader.open();
			await promise;
			await Manager.#panelLoader.close();
		} catch (error) {
			await Manager.prevent(error);
		}
	}
	static getSearch() {
		return new Map(window.decodeURI(location.search.replace(/^\??/, ``)).split(`&`).filter(item => item).map((item) => {
			const [key, value] = item.split(`=`);
			return [key, value];
		}));
	}
	/**
	 * @param {File} file 
	 */
	static download(file) {
		const aLink = document.createElement(`a`);
		aLink.download = file.name;
		aLink.href = URL.createObjectURL(file);
		aLink.click();
		URL.revokeObjectURL(aLink.href);
		aLink.remove();
	}
	/**
	 * @param {any} error 
	 */
	static analysis(error) {
		return error instanceof Error ? error.stack ?? `${error.name}: ${error.message}` : `Invalid error type.`;
	}
	static #locked = true;
	/**
	 * @param {any} error 
	 */
	static async prevent(error) {
		const message = Manager.analysis(error);
		if (Manager.#locked) {
			await Manager.alert(message, `Error`);
			location.reload();
		} else {
			console.error(message);
		};
	}
}
