"use strict";

import { ImplementationError } from "./extensions.js";

const { random, round, trunc } = Math;

//#region Engine
/**
 * @typedef UncomposedEngineEventMap
 * @property {Event} start
 * @property {Event} update
 * @property {Event} launch
 * @property {Event} change
 * 
 * @typedef {EventListener & UncomposedEngineEventMap} EngineEventMap
 */

/**
 * Base class for engines.
 * @abstract
 */
class Engine extends EventTarget {
	constructor() {
		super();
		if (new.target === Engine) throw new TypeError(`Unable to create an instance of an abstract class`);
	}
	/**
	 * @template {keyof EngineEventMap} K
	 * @param {K} type
	 * @param {(this: Engine, ev: EngineEventMap[K]) => any} listener
	 * @param {boolean | AddEventListenerOptions} options
	 * @returns {void}
	 */
	addEventListener(type, listener, options = false) {
		return super.addEventListener(type, listener, options);
	}
	/**
	 * @template {keyof EngineEventMap} K
	 * @param {K} type
	 * @param {(this: Engine, ev: EngineEventMap[K]) => any} listener
	 * @param {boolean | EventListenerOptions} options
	 * @returns {void}
	 */
	removeEventListener(type, listener, options = false) {
		return super.removeEventListener(type, listener, options);
	}
	/**
	 * Gets the launch status of the engine.
	 * @abstract
	 * @returns {boolean}
	 */
	get launched() {
		throw new ImplementationError();
	}
	/**
	 * Sets the launch status of the engine.
	 * @abstract
	 * @param {boolean} value
	 * @returns {void}
	 */
	set launched(value) {
		throw new ImplementationError();
	}
	/**
	 * Gets the FPS limit of the engine.
	 * @abstract
	 * @returns {number}
	 */
	get limit() {
		throw new ImplementationError();
	}
	/**
	 * Sets the FPS limit of the engine.
	 * @abstract
	 * @param {number} value
	 * @returns {void}
	 */
	set limit(value) {
		throw new ImplementationError();
	}
	/**
	 * Gets the Frames Per Second (FPS) of the engine.
	 * @abstract
	 * @returns {number}
	 */
	get FPS() {
		throw new ImplementationError();
	}
	/**
	 * Gets the time delta between frames.
	 * @abstract
	 * @readonly
	 * @returns {number}
	 */
	get delta() {
		throw new ImplementationError();
	}
}
//#endregion
//#region Fast engine
/**
 * @typedef {{}} UncomposedFastEngineEventMap
 * 
 * @typedef {EngineEventMap & UncomposedFastEngineEventMap} FastEngineEventMap
 */

/**
 * Constructs a fast type engine.
 */
class FastEngine extends Engine {
	/**
	 * @param {boolean} launch Whether the engine should be launched initially. Default is false.
	 */
	constructor(launch = false) {
		super();

		this.addEventListener(`update`, (event) => this.dispatchEvent(new Event(`start`)), { once: true });

		let previous = 0;
		/**
		 * @param {DOMHighResTimeStamp} current 
		 * @returns {void}
		 */
		const callback = (current) => {
			const difference = current - previous;
			if (difference > this.#gap) {
				if (this.launched) {
					this.#FPS = (1000 / difference);
					this.dispatchEvent(new Event(`update`));
				} else {
					this.#FPS = 0;
				}
				previous = current;
			}
			requestAnimationFrame(callback);
		};
		requestAnimationFrame(callback);

		this.launched = launch;
	}
	/**
	 * @template {keyof FastEngineEventMap} K
	 * @param {K} type
	 * @param {(this: FastEngine, ev: FastEngineEventMap[K]) => any} listener
	 * @param {boolean | AddEventListenerOptions} options
	 * @returns {void}
	 */
	addEventListener(type, listener, options = false) {
		return super.addEventListener(type, /** @type {(this: Engine, ev: EngineEventMap[K]) => any} */(listener), options);
	}
	/**
	 * @template {keyof FastEngineEventMap} K
	 * @param {K} type
	 * @param {(this: FastEngine, ev: FastEngineEventMap[K]) => any} listener
	 * @param {boolean | EventListenerOptions} options
	 * @returns {void}
	 */
	removeEventListener(type, listener, options = false) {
		return super.removeEventListener(type, /** @type {(this: Engine, ev: EngineEventMap[K]) => any} */(listener), options);
	}
	/** @type {boolean} */
	#launched;
	/**
	 * Gets the launch status of the engine.
	 * @returns {boolean}
	 */
	get launched() {
		return this.#launched;
	}
	/**
	 * Sets the launch status of the engine.
	 * @param {boolean} value 
	 * @returns {void}
	 */
	set launched(value) {
		const previous = this.#launched;
		this.#launched = value;
		if (previous !== value) this.dispatchEvent(new Event(`change`));
		if (value) this.dispatchEvent(new Event(`launch`));
	}
	/** @type {number} */
	#gap = 0;
	/**
	 * Gets the FPS limit of the engine.
	 * @returns {number}
	 */
	get limit() {
		return 1000 / this.#gap;
	}
	/**
	 * Sets the FPS limit of the engine.
	 * @param {number} value 
	 * @returns {void}
	 */
	set limit(value) {
		if (Number.isNaN(value)) return;
		if (value <= 0) return;
		this.#gap = 1000 / value;
	}
	/** @type {number} */
	#FPS = 0;
	/**
	 * Gets the current FPS of the engine.
	 * @readonly
	 * @returns {number}
	 */
	get FPS() {
		return this.#FPS;
	}
	/**
	 * Gets the time delta between frames.
	 * @readonly
	 * @returns {number}
	 */
	get delta() {
		return 1 / this.#FPS;
	}
}
//#endregion
//#region Precise engine
/**
 * @typedef {{}} UncomposedPreciseEngineEventMap
 * 
 * @typedef {EngineEventMap & UncomposedPreciseEngineEventMap} PreciseEngineEventMap
 */

/**
 * Constructs a precise type engine.
 */
class PreciseEngine extends Engine {
	/**
	 * @param {boolean} launch Whether the engine should be launched initially. Default is false.
	 */
	constructor(launch = false) {
		super();

		this.addEventListener(`update`, (event) => this.dispatchEvent(new Event(`start`)), { once: true });

		let previous = performance.now();
		/**
		 * @param {DOMHighResTimeStamp} current 
		 * @returns {void}
		 */
		const callback = (current) => {
			const difference = current - previous;
			if (this.launched) {
				this.#FPS = (1000 / difference);
				this.dispatchEvent(new Event(`update`));
			} else {
				this.#FPS = 0;
			}
			previous = current;
			setTimeout(callback, this.#gap, performance.now());
		};
		setTimeout(callback, this.#gap, performance.now());

		this.launched = launch;
	};
	/**
	 * @template {keyof PreciseEngineEventMap} K
	 * @param {K} type
	 * @param {(this: PreciseEngine, ev: PreciseEngineEventMap[K]) => any} listener
	 * @param {boolean | AddEventListenerOptions} options
	 * @returns {void}
	 */
	addEventListener(type, listener, options = false) {
		return super.addEventListener(type, /** @type {(this: Engine, ev: EngineEventMap[K]) => any} */(listener), options);
	}
	/**
	 * @template {keyof PreciseEngineEventMap} K
	 * @param {K} type
	 * @param {(this: PreciseEngine, ev: PreciseEngineEventMap[K]) => any} listener
	 * @param {boolean | EventListenerOptions} options
	 * @returns {void}
	 */
	removeEventListener(type, listener, options = false) {
		return super.removeEventListener(type, /** @type {(this: Engine, ev: EngineEventMap[K]) => any} */(listener), options);
	}
	/** @type {boolean} */
	#launched;
	/**
	 * Gets the launch status of the engine.
	 * @returns {boolean}
	 */
	get launched() {
		return this.#launched;
	}
	/**
	 * Sets the launch status of the engine.
	 * @param {boolean} value 
	 * @returns {void}
	 */
	set launched(value) {
		const previous = this.#launched;
		this.#launched = value;
		if (previous !== value) this.dispatchEvent(new Event(`change`));
		if (value) this.dispatchEvent(new Event(`launch`));
	}
	/** @type {number} */
	#gap = 0;
	/**
	 * Gets the FPS limit of the engine.
	 * @returns {number}
	 */
	get limit() {
		return 1000 / this.#gap;
	}
	/**
	 * Sets the FPS limit of the engine.
	 * @param {number} value 
	 * @returns {void}
	 */
	set limit(value) {
		if (Number.isNaN(value)) return;
		if (value <= 0) return;
		this.#gap = 1000 / value;
	}
	/** @type {number} */
	#FPS = 0;
	/**
	 * Gets the current FPS of the engine.
	 * @readonly
	 * @returns {number}
	 */
	get FPS() {
		return this.#FPS;
	}
	/**
	 * Gets the time delta between frames.
	 * @readonly
	 * @returns {number}
	 */
	get delta() {
		return 1 / this.#FPS;
	}
}
//#endregion
//#region Static engine
/**
 * @typedef {{}} UncomposedStaticEngineEventMap
 * 
 * @typedef {EngineEventMap & UncomposedStaticEngineEventMap} StaticEngineEventMap
 */

/**
 * Constructs a static type engine.
 */
class StaticEngine extends Engine {
	/**
	 * @param {boolean} launch Whether the engine should be launched initially. Default is false.
	 */
	constructor(launch = false) {
		super();

		this.addEventListener(`update`, (event) => this.dispatchEvent(new Event(`start`)), { once: true });

		let previous = 0;
		/**
		 * @param {DOMHighResTimeStamp} current 
		 * @returns {void}
		 */
		const callback = (current) => {
			const difference = current - previous;
			const factor = trunc(difference / this.#gap);
			this.#delta = difference / factor;
			for (let index = 0; index < factor; index++) {
				if (this.#focus && this.launched) this.dispatchEvent(new Event(`update`));
				previous = current;
			}
			requestAnimationFrame(callback);
		};
		requestAnimationFrame(callback);

		this.launched = launch;

		window.addEventListener(`focus`, (event) => this.#focus = true);
		window.addEventListener(`blur`, (event) => this.#focus = false);
	}
	/**
	 * @template {keyof StaticEngineEventMap} K
	 * @param {K} type
	 * @param {(this: StaticEngine, ev: StaticEngineEventMap[K]) => any} listener
	 * @param {boolean | AddEventListenerOptions} options
	 * @returns {void}
	 */
	addEventListener(type, listener, options = false) {
		return super.addEventListener(type, /** @type {(this: Engine, ev: EngineEventMap[K]) => any} */(listener), options);
	}
	/**
	 * @template {keyof StaticEngineEventMap} K
	 * @param {K} type
	 * @param {(this: StaticEngine, ev: StaticEngineEventMap[K]) => any} listener
	 * @param {boolean | EventListenerOptions} options
	 * @returns {void}
	 */
	removeEventListener(type, listener, options = false) {
		return super.removeEventListener(type, /** @type {(this: Engine, ev: EngineEventMap[K]) => any} */(listener), options);
	}
	/** @type {boolean} */
	#launched;
	/**
	 * Gets the launch status of the engine.
	 * @returns {boolean}
	 */
	get launched() {
		return this.#launched;
	}
	/**
	 * Sets the launch status of the engine.
	 * @param {boolean} value 
	 * @returns {void}
	 */
	set launched(value) {
		const previous = this.#launched;
		this.#launched = value;
		if (previous !== value) this.dispatchEvent(new Event(`change`));
		if (value) this.dispatchEvent(new Event(`launch`));
	}
	/** @type {number} */
	#gap = 1000 / 120;
	/**
	 * Gets the FPS limit of the engine.
	 * @returns {number}
	 */
	get limit() {
		return 1000 / this.#gap;
	}
	/**
	 * Sets the FPS limit of the engine.
	 * @param {number} value 
	 * @returns {void}
	 */
	set limit(value) {
		if (Number.isNaN(value)) return;
		if (value <= 0) return;
		this.#gap = 1000 / value;
		this.#delta = this.#gap;
	}
	/**
	 * Gets the current FPS of the engine.
	 * @readonly
	 * @returns {number}
	 */
	get FPS() {
		return 1000 / this.#delta;
		// return 1000 / this.#gap;
	}
	/** @type {number} */
	#delta = this.#gap;
	/**
	 * Gets the time delta between frames.
	 * @readonly
	 * @returns {number}
	 */
	get delta() {
		return this.#delta / 1000;
		// return this.#gap / 1000;
	}
	/** @type {boolean} */
	#focus = document.hasFocus();
}
//#endregion

//#region Random
/**
 * Random values generator.
 */
class Random {
	/** @type {Random} */
	static #global = new Random();
	/**
	 * The global instance.
	 * @readonly
	 * @returns {Random}
	 */
	static get global() {
		return Random.#global;
	}
	/**
	 * Generates a random boolean value.
	 * @returns {boolean} A random boolean value.
	 */
	boolean() {
		return Boolean(round(random()));
	}
	/**
	 * Returns a random number in range [min - max).
	 * @param {number} min The minimum value.
	 * @param {number} max The maximum value.
	 * @returns {number} A random number.
	 */
	number(min, max) {
		return random() * (max - min) + min;
	}
	/**
	 * Returns a random integer in range [min - max).
	 * @param {number} min The minimum value.
	 * @param {number} max The maximum value.
	 * @returns {number} A random integer.
	 */
	integer(min, max) {
		return trunc(this.number(min, max));
	}
	/**
	 * Returns a random element from an array.
	 * @template T
	 * @param {Readonly<T[]>} array The array of elements.
	 * @returns {T} A random element.
	 * @throws {Error} If the array is empty.
	 */
	item(array) {
		if (1 > array.length) throw new Error(`Array must have at least 1 item`);
		return array[this.integer(0, array.length)];
	}
	/**
	 * Generates a sequence of random numbers from min to max (exclusive).
	 * @param {number} min The minimum value.
	 * @param {number} max The maximum value.
	 * @returns {number[]} An array of random numbers.
	 */
	sequence(min, max) {
		const result = Array.sequence(min, max);
		this.shuffle(result);
		return result;
	};
	/**
	 * Returns a random subarray of elements from an array.
	 * @template T
	 * @param {Readonly<T[]>} array The array of elements.
	 * @param {number} count The number of elements to select.
	 * @returns {T[]} A random subarray of elements.
	 * @throws {TypeError} If count is not a finite integer.
	 * @throws {RangeError} If count is less than 0 or greater than array length.
	 */
	subarray(array, count = 1) {
		if (!Number.isInteger(count)) throw new TypeError(`The count ${count} must be a finite integer number`);
		if (0 > count || count > array.length) throw new RangeError(`The count ${count} is out of range [0 - ${array.length}]`);
		const clone = Array.from(array);
		const result = [];
		for (let index = 0; index < count; index++) {
			result.push(...clone.splice(this.integer(0, clone.length), 1));
		}
		return result;
	}
	/**
	 * Shuffles the elements of an array in place using the Fisher-Yates algorithm.
	 * @template T
	 * @param {T[]} array The array to shuffle.
	 * @returns {void}
	 */
	shuffle(array) {
		for (let index = 0; index < array.length - 1; index++) {
			const pair = this.integer(index, array.length);
			if (pair === index) continue;
			array.swap(index, pair);
		}
	}
	/**
	 * Selects a random element from a list according to their weights.
	 * @template T
	 * @param {Readonly<Map<T, number>>} cases The map with elements and their weights.
	 * @returns {T} A random element.
	 * @throws {RangeError} If the map is empty.
	 */
	case(cases) {
		if (1 > cases.size) throw new RangeError(`The cases must have at least 1 item`);
		const summary = Array.from(cases).reduce((previous, [, weight]) => previous + weight, 0);
		const random = this.number(0, summary);
		let begin = 0;
		for (const [item, weight] of cases) {
			const end = begin + weight;
			if (begin <= random && random < end) {
				return item;
			}
			begin = end;
		}
		throw new Error(`Unable to select element with value ${random}`);
	};
	/**
	 * Generates a random GUID identifier.
	 * @returns {string} A random GUID identifier.
	 */
	GUID() {
		return crypto.randomUUID();
	}
}
//#endregion

export { Engine, FastEngine, PreciseEngine, StaticEngine, Random };
