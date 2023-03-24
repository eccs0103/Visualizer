"use strict";
class Engine {
	/**
	 * @param {Boolean} launch
	 */
	constructor(launch = false) {
		const instance = this;
		instance.#handler = () => { }
		instance.#time = 0;
		instance.#FPS = 0;
		instance.#launched = launch;
		let previous = 0;
		requestAnimationFrame(function callback(time) {
			let current = time;
			const difference = current - previous;
			if (instance.#launched) {
				instance.#time += difference;
				instance.#FPS = 1000 / difference;
				instance.#handler();
			}
			previous = current;
			requestAnimationFrame(callback);
		});
	}
	/** @type {() => void} */ #handler;
	/**
	 * @param {() => void} handler 
	 */
	renderer(handler) {
		this.#handler = handler;
	}
	/** @type {DOMHighResTimeStamp} */ #time;
	/** @readonly */ get time() {
		return this.#time;
	}
	/** @type {Number} */ #FPS;
	/** @readonly */ get FPS() {
		return this.#FPS;
	}
	/** @type {Boolean} */ #launched;
	get launched() {
		return this.#launched;
	}
	set launched(value) {
		this.#launched = value;
	}
}
