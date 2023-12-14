"use strict";

//#region Engine
/**
 * @typedef Engine
 * @property {Boolean} launched
 * @property {Number} FPS
 * @property {Number} delta
 */
//#endregion
//#region Fast engine
/**
 * @implements {Engine}
 */
class FastEngine extends EventTarget {
	/**
	 * @param {Boolean} launch
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
	/** @type {Boolean} */ #launched = false;
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
	/** @type {Number} */ #FPSLimit = Infinity;
	get FPSLimit() {
		return this.#FPSLimit;
	}
	set FPSLimit(value) {
		if (value <= 0) {
			throw new RangeError(`FPS limit must be higher then 0`);
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
}
//#endregion
//#region Precise engine
/**
 * @implements {Engine}
 */
class PreciseEngine extends EventTarget {
	/**
	 * @param {Boolean} launch
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
	/** @type {Boolean} */ #launched = false;
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

	/** @type {Number} */ #delta = (1000 / 60);
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
	 * @param {Boolean} launched 
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

export {
	FastEngine,
	PreciseEngine,
	Display,
};
