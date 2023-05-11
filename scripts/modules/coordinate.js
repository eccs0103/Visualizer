class Coordinate {
	/**
	 * @param {Coordinate} first 
	 * @param {Coordinate} second 
	 */
	static calculateDistance(first, second) {
		return Math.hypot(first.x - second.x, first.y - second.y);
	}
	/**
	 * @param {Number} x 
	 * @param {Number} y 
	 */
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	/** @type {Number} */ #x;
	get x() {
		return this.#x;
	}
	set x(value) {
		this.#x = value;
	}
	/** @type {Number} */ #y;
	get y() {
		return this.#y;
	}
	set y(value) {
		this.#y = value;
	}
	/**
	 * @param {Coordinate} point 
	 */
	distanceFrom(point) {
		return Coordinate.calculateDistance(this, point);
	}
	toString() {
		return `(${this.x}, ${this.y})`;
	}
}