"use strict";

class Engine extends EventTarget {
	/**
	 * @param {Boolean} launch
	 */
	constructor(launch = false) {
		super();
		const $this = this;
		let previous = 0;
		requestAnimationFrame(function callback(time) {
			let current = time;
			const difference = current - previous;
			const differenceLimit = 1000 / $this.#FPSLimit;
			if (difference > differenceLimit) {
				if ($this.launched) {
					$this.#time += difference;
					$this.#FPS = 1000 / difference;
					$this.dispatchEvent(new Event(`render`));
				}
				previous = current;
			}
			requestAnimationFrame(callback);
		});

		this.launched = launch;
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
	/** @readonly */ get delta() {
		return 1 / this.#FPS;
	}
	/** @type {Boolean} */ #launched = false;
	get launched() {
		return this.#launched;
	}
	set launched(value) {
		this.#launched = value;
		this.dispatchEvent(new Event(`launch`));
	}
	/**
	 * @param {Number} period time in miliseconds
	 * @returns multiplier - [0, 1]
	 */
	impulse(period) {
		return this.time % period / period;
	}
	/**
	 * @param {Number} period time in miliseconds
	 * @returns multiplier - [-1, 1]
	 */
	pulse(period) {
		return Math.sin(this.impulse(period) * 2 * Math.PI);
	}
	/**
	 * @param {Number} period time in miliseconds
	 * @returns multiplier - [0, 1]
	 */
	bounce(period) {
		return Math.abs(this.pulse(period));
	}
}
