"use strict";
//#region Engine
class Engine {
	/**
	 * @param {() => void} handler 
	 */
	constructor(handler) {
		const instance = this;
		requestAnimationFrame(function callback(time) {
			instance.#time = time;
			handler();
			requestAnimationFrame(callback);
		});
	}
	/** @type {DOMHighResTimeStamp} */ #time;
	/** @readonly */ get time() {
		return this.#time;
	}
}
//#endregion
//#region Application
class Application {
	static #locked = true;
	/**
	 * @param {any} exception 
	 */
	static prevent(exception) {
		if (this.#locked) {
			window.alert(exception instanceof Error ? exception.stack ?? `${exception.name}: ${exception.message}` : `Invalid exception type.`);
			location.reload();
		} else console.error(exception);
	}
}
//#endregion