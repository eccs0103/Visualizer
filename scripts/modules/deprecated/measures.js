"use strict";

class Point1X {
	/**
	 * @param {Point1X} first 
	 * @param {Point1X} second 
	 */
	static getDistanceBetween(first, second) {
		return Math.hypot(first.x - second.x);
	}
	/**
	 * @param {Number} x 
	 */
	constructor(x) {
		this.x = x;
	}
	/** @type {Number} */ #x;
	get x() {
		return this.#x;
	}
	set x(value) {
		this.#x = value;
	}
	toString() {
		return `(${this.x})`;
	}
}

class Point2X extends Point1X {
	/**
	 * @param {Point2X} first 
	 * @param {Point2X} second 
	 */
	static getDistanceBetween(first, second) {
		return Math.hypot(first.x - second.x, first.y - second.y);
	}
	/**
	 * @param {Number} x 
	 * @param {Number} y 
	 */
	constructor(x, y) {
		super(x);
		this.y = y;
	}
	/** @type {Number} */ #y;
	get y() {
		return this.#y;
	}
	set y(value) {
		this.#y = value;
	}
	toString() {
		return `(${this.x}, ${this.y})`;
	}
}

class Point3X extends Point2X {
	/**
	 * @param {Point3X} first 
	 * @param {Point3X} second 
	 */
	static getDistanceBetween(first, second) {
		return Math.hypot(first.x - second.x, first.y - second.y, first.z - second.z);
	}
	/**
	 * @param {Number} x 
	 * @param {Number} y 
	 * @param {Number} z
	 */
	constructor(x, y, z) {
		super(x, y);
		this.z = z;
	}
	/** @type {Number} */ #z;
	get z() {
		return this.#z;
	}
	set z(value) {
		this.#z = value;
	}
	toString() {
		return `(${this.x}, ${this.y}, ${this.z})`;
	}
}
