"use strict";

import { Engine } from "../workers/generators.mjs";

/** @typedef {import("../workers/generators.mjs").EngineEventMap} EngineEventMap */

const { trunc } = Math;

//#region Static engine
/**
 * @typedef {{ }} Extendable.StaticEngineEventMap
 * 
 * @typedef {EngineEventMap & Extendable.StaticEngineEventMap} StaticEngineEventMap
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

		this.#launched = launch;
		this.addEventListener(`trigger`, event => this.dispatchEvent(new Event(`start`)), { once: true });
		requestAnimationFrame(this.#callback.bind(this));

		window.addEventListener(`focus`, event => this.#focus = true);
		window.addEventListener(`blur`, event => this.#focus = false);
	}
	/**
	 * @template {keyof StaticEngineEventMap} K
	 * @overload
	 * @param {K} type 
	 * @param {(this: StaticEngine, ev: StaticEngineEventMap[K]) => any} listener 
	 * @param {boolean | AddEventListenerOptions} [options] 
	 * @returns {void}
	 */
	/**
	 * @overload
	 * @param {string} type 
	 * @param {EventListenerOrEventListenerObject} listener 
	 * @param {boolean | AddEventListenerOptions} [options] 
	 * @returns {void}
	 */
	/**
	 * @param {string} type 
	 * @param {EventListenerOrEventListenerObject} listener 
	 * @param {boolean | AddEventListenerOptions} options 
	 * @returns {void}
	 */
	addEventListener(type, listener, options = false) {
		return super.addEventListener(type, listener, options);
	}
	/**
	 * @template {keyof StaticEngineEventMap} K
	 * @overload
	 * @param {K} type 
	 * @param {(this: StaticEngine, ev: StaticEngineEventMap[K]) => any} listener 
	 * @param {boolean | EventListenerOptions} [options] 
	 * @returns {void}
	 */
	/**
	 * @overload
	 * @param {string} type 
	 * @param {EventListenerOrEventListenerObject} listener 
	 * @param {boolean | EventListenerOptions} [options] 
	 * @returns {void}
	 */
	/**
	 * @param {string} type 
	 * @param {EventListenerOrEventListenerObject} listener 
	 * @param {boolean | EventListenerOptions} options 
	 * @returns {void}
	 */
	removeEventListener(type, listener, options = false) {
		return super.removeEventListener(type, listener, options);
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
	#previous = 0;
	/**
	 * @param {DOMHighResTimeStamp} current 
	 * @returns {void}
	 */
	#callback(current) {
		const difference = current - this.#previous;
		const factor = trunc(difference / this.#gap);
		this.#delta = difference / factor;
		for (let index = 0; index < factor; index++) {
			if (this.#focus && this.launched) this.dispatchEvent(new Event(`trigger`));
			this.#previous = current;
		}
		requestAnimationFrame(this.#callback.bind(this));
	};
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

export { StaticEngine };
