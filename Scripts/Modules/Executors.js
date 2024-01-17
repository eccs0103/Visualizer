"use strict";

//#region Engine
/**
 * @abstract
 */
class Engine extends EventTarget {
	/**
	 * @returns {boolean}
	 */
	get launched() {
		throw new ReferenceError(`Not implemented function`);
	}
	/**
	 * @param {boolean} value
	 */
	set launched(value) {
		throw new ReferenceError(`Not implemented function`);
	}
	/**
	 * @readonly
	 * @returns {number}
	 */ 
	get FPS() {
		throw new ReferenceError(`Not implemented function`);
	}
	/**
	 * @readonly
	 * @returns {number}
	 */ 
	get delta() {
		throw new ReferenceError(`Not implemented function`);
	}
}
//#endregion
//#region Fast engine
class FastEngine extends Engine {
	/**
	 * @param {boolean} launch
	 */
	constructor(launch = false) {
		super();
		let previous = 0;
		const controller = new AbortController();
		this.addEventListener(`update`, (event) => {
			if (this.time !== 0) {
				this.dispatchEvent(new Event(`start`));
				controller.abort();
			}
		}, { signal: controller.signal });
		/**
		 * @param {DOMHighResTimeStamp} time 
		 */
		const callback = (time) => {
			let current = time;
			const difference = current - previous;
			const differenceLimit = 1000 / this.#FPSLimit;
			if (difference > differenceLimit) {
				if (this.launched) {
					this.#time += difference;
					this.#FPS = 1000 / difference;
					if (this.time !== 0) {
						this.dispatchEvent(new Event(`update`));
					}
				}
				previous = current;
			}
			requestAnimationFrame(callback);
		};
		requestAnimationFrame(callback);
		this.launched = launch;
	}
	/** @type {DOMHighResTimeStamp} */ #time = 0;
	/** @readonly */ get time() {
		return this.#time;
	}
	/** @type {boolean} */ #launched = false;
	get launched() {
		return this.#launched;
	}
	set launched(value) {
		if (this.#launched !== value) {
			this.dispatchEvent(new Event(`change`));
		}
		this.#launched = value;
		if (this.#launched) {
			this.dispatchEvent(new Event(`launch`));
		}
	}
	/** @type {number} */ #FPSLimit = Infinity;
	get FPSLimit() {
		return this.#FPSLimit;
	}
	set FPSLimit(value) {
		if (value <= 0) {
			throw new RangeError(`FPS limit must be higher then 0`);
		}
		this.#FPSLimit = value;
	}
	/** @type {number} */ #FPS = 0;
	/** @readonly */ get FPS() {
		return this.#FPS;
	}
	/** @readonly */ get delta() {
		return 1 / this.#FPS;
	}
}
//#endregion
//#region Precise engine
class PreciseEngine extends Engine {
	/**
	 * @param {boolean} launch
	 */
	constructor(launch = false) {
		super();
		const controller = new AbortController();
		this.addEventListener(`update`, (event) => {
			this.dispatchEvent(new Event(`start`));
			controller.abort();
		}, { signal: controller.signal });
		const callback = () => {
			if (this.launched) {
				this.dispatchEvent(new Event(`update`));
			}
			setTimeout(callback, this.#delta);
		};
		setTimeout(callback, this.#delta);
		this.launched = launch;
	}
	/** @type {boolean} */ #launched = false;
	get launched() {
		return this.#launched;
	}
	set launched(value) {
		if (this.#launched !== value) {
			this.dispatchEvent(new Event(`change`));
		}
		this.#launched = value;
		if (this.#launched) {
			this.dispatchEvent(new Event(`launch`));
		}
	}

	/** @type {number} */ #delta = (1000 / 60);
	get FPS() {
		return (1000 / this.#delta);
	}
	set FPS(value) {
		if (value <= 0) {
			throw new RangeError(`FPS must be higher then 0`);
		}
		this.#delta = (1000 / value);
	}
	/** @readonly */ get delta() {
		return this.#delta * 1000;
	}
}
//#endregion
//#region Display
/**
 * @template {RenderingContext} T
 */
class Display extends FastEngine {
	/**
	 * @param {T} context 
	 * @param {boolean} launched 
	 */
	constructor(context, launched = false) {
		super(launched);
		this.#context = context;
		this.#resize();
		window.addEventListener(`resize`, (event) => {
			this.#resize();
		});
	}
	/** @type {RenderingContext} */ #context;
	#resize() {
		const canvas = this.#context.canvas;
		if (canvas instanceof HTMLCanvasElement) {
			const { width, height } = canvas.getBoundingClientRect();
			canvas.width = width;
			canvas.height = height;
			this.dispatchEvent(new UIEvent(`resize`));
			this.dispatchEvent(new Event(`update`));
		}
	}
}
//#endregion

export { FastEngine, PreciseEngine, Display };