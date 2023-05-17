"use strict";

/**
 * @callback EngineHandler
 * @returns {void}
 */

class Engine {
	/**
	 * @param {Boolean} launch
	 */
	constructor(launch = false) {
		const instance = this;
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
	/** @type {EngineHandler} */ #handler = () => { };
	/**
	 * @param {EngineHandler} handler 
	 */
	renderer(handler) {
		this.#handler = handler;
		this.#handler();
	}
	/** @type {DOMHighResTimeStamp} */ #time = 0;
	/** @readonly */ get time() {
		return this.#time;
	}
	/** @type {Number} */ #FPS = 0;
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
