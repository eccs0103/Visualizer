// @ts-ignore
/** @typedef {import("./engine.js")} */

"use strict";

class Animator extends Engine {
	/**
	 * @param {CanvasRenderingContext2D} context 
	 * @param {Boolean} launch 
	 */
	constructor(context, launch = false) {
		super(launch);
		this.#context = context;

		this.#resize();
		window.addEventListener(`resize`, this.#resize.bind(this));
	}
	/** @type {CanvasRenderingContext2D} */ #context;
	/** @readonly */ get context() {
		return this.#context;
	}
	#resize() {
		const canvas = this.context.canvas;
		const { width, height } = canvas.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;
		this.dispatchEvent(new Event(`resize`));
		this.dispatchEvent(new Event(`render`));
	}
}
