//#region Color
/**
 * A class that represents RGB colors.
 */
class Color {
	/**
	 * Instantiating a color via HSV colors.
	 * @param {Number} hue The hue parameter.
	 * @param {Number} saturation The saturation parameter.
	 * @param {Number} value The value parameter.
	 * @returns Color instance.
	 */
	static viaHSV(hue, saturation, value) {
		/**
		 * 
		 * @param {Number} n 
		 * @param {Number} k 
		 * @returns 
		 */
		function f(n, k = (n + hue / 60) % 6) {
			return (value / 100) - (value / 100) * (saturation / 100) * Math.max(Math.min(k, 4 - k, 1), 0);
		};
		return new Color(f(5) * 255, f(3) * 255, f(1) * 255);
	}
	/**
	 * Instance of a white color.
	 * @readonly
	 */
	static get white() {
		return new Color(255, 255, 255);
	}
	/**
	 * Instance of a black color.
	 * @readonly 
	 */
	static get black() {
		return new Color(0, 0, 0);
	}
	/**
	 * @param {Number} red The red parameter.
	 * @param {Number} green The green parameter.
	 * @param {Number} blue The blue parameter.
	 * @param {Number} transparence The transparence parameter.
	 */
	constructor(red, green, blue, transparence = 1) {
		this.#red = red;
		this.#green = green;
		this.#blue = blue;
		this.#transparence = transparence;
	}
	/** @type {Number} */ #red;
	/**
	 * The red property.
	 * @readonly
	 */
	get red() {
		return this.#red;
	}
	/** @type {Number} */ #green;
	/**
	 * The green property.
	 * @readonly
	 */
	get green() {
		return this.#green;
	}
	/** @type {Number} */ #blue;
	/**
	 * The blue property.
	 * @readonly
	 */
	get blue() {
		return this.#blue;
	}
	/** @type {Number} */ #transparence;
	/**
	 * The transparence property.
	 * @readonly
	 */
	get transparence() {
		return this.#transparence;
	}
	/**
	 * Converting to a string rgba(red, green, blue, transparence) of the form.
	 * @returns The result.
	 */
	toString() {
		return `rgba(${this.#red}, ${this.#green}, ${this.#blue}, ${this.#transparence})`;
	}
}
//#endregion