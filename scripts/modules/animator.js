class Animator extends Engine {
	/**
	 * @param {HTMLCanvasElement} canvas 
	 * @param {Boolean} launch 
	 */
	constructor(canvas, launch = false) {
		super(launch);
		const instance = this;
		instance.#handler = () => { }
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
	pulsar(period) {
		return this.time % period / period;
	}
}