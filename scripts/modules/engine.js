"use strict";
class Engine {
	/**
	 * @param {() => void} handler 
	 * @param {Boolean} launch
	 */
	constructor(handler, launch = false) {
		const instance = this;
		instance.#launched = launch;
		let previous = 0;
		requestAnimationFrame(function callback(time) {
			let current = time;
			const difference = current - previous;
			if (instance.#launched) {
				instance.#time += difference;
				handler();
			}
			previous = current;
			requestAnimationFrame(callback);
		});
	}
	/** @type {DOMHighResTimeStamp} */ #time = 0;
	/** @readonly */ get time() {
		return this.#time;
	}
	/** @type {Boolean} */ #launched;
	get launched() {
		return this.#launched;
	}
	set launched(value) {
		this.#launched = value;
	}
}
