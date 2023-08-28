// @ts-ignore
/** @typedef {import("./informant.js")} */

"use strict";

class Manager extends Informant {
	/** @type {HTMLDialogElement} */ static #dialogLoader;
	static {
		const dialogLoader = document.querySelector(`dialog.loader`);
		if (!(dialogLoader instanceof HTMLDialogElement)) {
			throw new TypeError(`Invalid element: ${dialogLoader}`);
		}
		Manager.#dialogLoader = dialogLoader;
	}
	/**
	 * @param {Promise<unknown>} promise 
	 * @param {Number} duration default 200
	 * @param {Number} delay default 0
	 */
	static async load(promise, duration = 200, delay = 0) {
		try {
			Manager.#dialogLoader.showModal();
			await Manager.#dialogLoader.animate([
				{ opacity: `0` },
				{ opacity: `1` },
			], { duration: duration, fill: `both` }).finished;
			await promise;
			await Manager.#dialogLoader.animate([
				{ opacity: `1` },
				{ opacity: `0` },
			], { duration: duration, fill: `both`, delay: delay }).finished;
			Manager.#dialogLoader.close();
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
