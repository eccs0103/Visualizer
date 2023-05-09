// @ts-ignore
/** @typedef {import("./engine.js")} */

"use strict";

class Animator extends Engine {
	/**
	 * @param {HTMLCanvasElement} canvas 
	 * @param {Boolean} launch 
	 */
	constructor(canvas, launch = false) {
		super(launch);
		const instance = this;
		instance.#handler = () => { };
		const context = (() => {
			const result = canvas.getContext(`2d`);
			if (!result) {
				throw new ReferenceError(`Element 'context' isn't defined.`);
			}
			return result;
		})();
		function resize() {
			const { width, height } = canvas.getBoundingClientRect();
			canvas.width = width;
			canvas.height = height;
			context.translate(width / 2, height / 2);
			instance.#handler(context);
		}
		resize();
		window.addEventListener(`resize`, resize);
		super.renderer(() => {
			instance.#handler(context);
		});
	}
	/** @type {(context: CanvasRenderingContext2D) => void} */ #handler;
	/**
	 * @param {(context: CanvasRenderingContext2D) => void} handler 
	 */
	renderer(handler) {
		this.#handler = handler;
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