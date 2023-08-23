"use strict";

class Point {
	/**
	 * @param  {Array<Number>} metrics 
	 */
	constructor(...metrics) {
		this.metrics.push(...metrics);
	}
	/** @type {Array<Number>} */ #metrics = [];
	/** @readonly */ get metrics() {
		return this.#metrics;
	}
	toString() {
		return `(${this.#metrics.join(`, `)})`;
	}
}

class Point1D extends Point {
	/**
	 * @param {Number} x 
	 */
	constructor(x) {
		super();
		this.x = x;
	}
	get x() {
		return this.metrics[0];
	}
	set x(value) {
		this.metrics[0] = value;
	}
}

class Point2D extends Point1D {
	/**
	 * @param {Number} x 
	 * @param {Number} y 
	 */
	constructor(x, y) {
		super(x);
		this.y = y;
	}
	get y() {
		return this.metrics[1];
	}
	set y(value) {
		this.metrics[1] = value;
	}
}

class Point3D extends Point2D {
	/**
	 * @param {Number} x 
	 * @param {Number} y 
	 * @param {Number} z 
	 */
	constructor(x, y, z) {
		super(x, y);
		this.z = z;
	}
	get z() {
		return this.metrics[2];
	}
	set z(value) {
		this.metrics[2] = value;
	}
}

/**
 * @template {Point1D} Point
 */
class Vector {
	/**
	 * @template {Point1D} Point
	 * @param {Point} first 
	 * @param {Point} second 
	 */
	static getDistanceBetween(first, second) {
		return Math.hypot(...first.metrics.map((metric, index) => metric - second.metrics[index]));
	}
	/**
	 * @param {Point} begin 
	 * @param {Point} end 
	 */
	constructor(begin, end) {
		this.begin = begin;
		this.end = end;
	}
	/** @type {Point} */ #begin;
	get begin() {
		return this.#begin;
	}
	set begin(value) {
		this.#begin = value;
	}
	/** @type {Point} */ #end;
	get end() {
		return this.#end;
	}
	set end(value) {
		this.#end = value;
	}
	getLength() {
		return Vector.getDistanceBetween(this.begin, this.end);
	}
	toString() {
		return `${this.begin} => ${this.end}`;
	}
}
