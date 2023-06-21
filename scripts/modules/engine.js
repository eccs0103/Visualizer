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
			const differenceLimit = 1000 / instance.#FPSLimit;
			if (instance.#launched && difference > differenceLimit) {
				instance.#time += difference;
				instance.#FPS = 1000 / difference;
				instance.#handler();
			}
			if (difference > differenceLimit) {
				previous = current;
			}
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
	invoke() {
		this.#handler();
	}
	/** @type {DOMHighResTimeStamp} */ #time = 0;
	/** @readonly */ get time() {
		return this.#time;
	}
	/** @type {Number} */ #FPSLimit = Infinity;
	get FPSLimit() {
		return this.#FPSLimit;
	}
	set FPSLimit(value) {
		if (value <= 0) {
			throw new RangeError(`FPS limit must be higher then 0.`);
		}
		this.#FPSLimit = value;
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
		if (!this.#wasLaunched) {
			this.#wasLaunched = true;
		}
	}
	/** @type {Boolean} */ #wasLaunched = false;
	get wasLaunched() {
		return this.#wasLaunched;
	}
	set wasLaunched(value) {
		this.#wasLaunched = value;
	}
}