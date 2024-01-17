"use strict";

//#region Point
/**
 * @abstract
 */
class Point {
	/**
	 * @param {number} [digits] 
	 */
	toFixed(digits) {
		return `(${[...this].map(metric => metric.toFixed(digits)).join(`, `)})`;
	}
	/**
	 * @param {number} [digits] 
	 */
	toExponential(digits) {
		return `(${[...this].map(metric => metric.toExponential(digits)).join(`, `)})`;
	}
	/**
	 * @param {number} [precision] 
	 */
	toPrecision(precision) {
		return `(${[...this].map(metric => metric.toPrecision(precision)).join(`, `)})`;
	}
	/**
	 * @param {number} [radix] 
	 */
	toString(radix) {
		return `(${[...this].map(metric => metric.toString(radix)).join(`, `)})`;
	}
	/**
	 * @param {string | string[]} [locales] 
	 * @param {Intl.NumberFormatOptions} [options] 
	 */
	toLocaleString(locales, options) {
		return `(${[...this].map(metric => metric.toLocaleString(locales, options)).join(`, `)})`;
	}
	/**
	 * @returns {Generator<number>}
	 */
	*[Symbol.iterator]() {
		throw new ReferenceError(`Not implemented function`);
	}
}
//#endregion
//#region Point 1D
class Point1D extends Point {
	/**
	 * @param {Readonly<Point1D>} first 
	 * @param {Readonly<Point1D>} second 
	 */
	static [`+`](first, second) {
		return new Point1D(first.x + second.x);
	}
	/**
	 * @param {Readonly<Point1D>} first 
	 * @param {Readonly<Point1D>} second 
	 */
	static [`-`](first, second) {
		return new Point1D(first.x - second.x);
	}
	/**
	 * @param {Readonly<Point1D>} first 
	 * @param {Readonly<Point1D>} second 
	 */
	static [`*`](first, second) {
		return new Point1D(first.x * second.x);
	}
	/**
	 * @param {Readonly<Point1D>} first 
	 * @param {Readonly<Point1D>} second 
	 */
	static [`/`](first, second) {
		return new Point1D(first.x / second.x);
	}
	/**
	 * @param {Readonly<Point1D>} source 
	 * @returns {Point1D}
	 */
	static clone(source) {
		return new Point1D(source.x);
	}
	/**
	 * @param {number} value 
	 * @returns {Point1D}
	 */
	static repeat(value) {
		return new Point1D(value);
	}
	/** @readonly */ static get ZERO() { return Point1D.repeat(0); }
	/** @type {Readonly<Point1D>} */ static #CONSTANT_ZERO = Object.freeze(Point1D.ZERO);
	/** @readonly */ static get CONSTANT_ZERO() {
		return this.#CONSTANT_ZERO;
	}
	/** @readonly */ static get HALF() { return Point1D.repeat(0.5); }
	/** @type {Readonly<Point1D>} */ static #CONSTANT_HALF = Object.freeze(Point1D.HALF);
	/** @readonly */ static get CONSTANT_HALF() {
		return this.#CONSTANT_HALF;
	}
	/** @readonly */ static get TWO() { return Point1D.repeat(2); }
	/** @type {Readonly<Point1D>} */ static #CONSTANT_TWO = Object.freeze(Point1D.TWO);
	/** @readonly */ static get CONSTANT_TWO() {
		return this.#CONSTANT_TWO;
	}
	/**
	 * @param {number} x 
	 */
	constructor(x) {
		super();
		this.x = x;
	}
	/** @type {number} */ #x = 0;
	get x() {
		return this.#x;
	}
	set x(value) {
		this.#x = value;
	}
	/**
	 * @param {Readonly<Point1D>} other 
	 */
	[`+`](other) {
		return Point1D["+"](this, other);
	}
	/**
	 * @param {Readonly<Point1D>} other 
	 */
	[`-`](other) {
		return Point1D["-"](this, other);
	}
	/**
	 * @param {Readonly<Point1D>} other 
	 */
	[`*`](other) {
		return Point1D["*"](this, other);
	}
	/**
	 * @param {Readonly<Point1D>} other 
	 */
	[`/`](other) {
		return Point1D["/"](this, other);
	}
	clone() {
		return Point1D.clone(this);
	}
	/**
	 * @returns {Generator<number>}
	 */
	*[Symbol.iterator]() {
		yield this.x;
		return;
	}
}
//#endregion
//#region Point 2D
class Point2D extends Point1D {
	/**
	 * @param {Readonly<Point2D>} first 
	 * @param {Readonly<Point2D>} second 
	 */
	static [`+`](first, second) {
		return new Point2D(first.x + second.x, first.y + second.y);
	}
	/**
	 * @param {Readonly<Point2D>} first 
	 * @param {Readonly<Point2D>} second 
	 */
	static [`-`](first, second) {
		return new Point2D(first.x - second.x, first.y - second.y);
	}
	/**
	 * @param {Readonly<Point2D>} first 
	 * @param {Readonly<Point2D>} second 
	 */
	static [`*`](first, second) {
		return new Point2D(first.x * second.x, first.y * second.y);
	}
	/**
	 * @param {Readonly<Point2D>} first 
	 * @param {Readonly<Point2D>} second 
	 */
	static [`/`](first, second) {
		return new Point2D(first.x / second.x, first.y / second.y);
	}
	/**
	 * @param {Readonly<Point2D>} source 
	 * @returns {Point2D}
	 */
	static clone(source) {
		return new Point2D(source.x, source.y);
	}
	/**
	 * @param {number} value 
	 * @returns {Point2D}
	 */
	static repeat(value) {
		return new Point2D(value, value);
	}
	/** @readonly */ static get ZERO() { return Point2D.repeat(0); }
	/** @type {Readonly<Point2D>} */ static #CONSTANT_ZERO = Object.freeze(Point2D.ZERO);
	/** @readonly */ static get CONSTANT_ZERO() {
		return this.#CONSTANT_ZERO;
	}
	/** @readonly */ static get HALF() { return Point2D.repeat(0.5); }
	/** @type {Readonly<Point2D>} */ static #CONSTANT_HALF = Object.freeze(Point2D.HALF);
	/** @readonly */ static get CONSTANT_HALF() {
		return this.#CONSTANT_HALF;
	}
	/** @readonly */ static get TWO() { return Point2D.repeat(2); }
	/** @type {Readonly<Point2D>} */ static #CONSTANT_TWO = Object.freeze(Point2D.TWO);
	/** @readonly */ static get CONSTANT_TWO() {
		return this.#CONSTANT_TWO;
	}
	/**
	 * @param {number} x 
	 * @param {number} y 
	 */
	constructor(x, y) {
		super(x);
		this.y = y;
	}
	/** @type {number} */ #y = 0;
	get y() {
		return this.#y;
	}
	set y(value) {
		this.#y = value;
	}
	/**
	 * @param {Readonly<Point2D>} other 
	 */
	[`+`](other) {
		return Point2D["+"](this, other);
	}
	/**
	 * @param {Readonly<Point2D>} other 
	 */
	[`-`](other) {
		return Point2D[`-`](this, other);
	}
	/**
	 * @param {Readonly<Point2D>} other 
	 */
	[`*`](other) {
		return Point2D[`*`](this, other);
	}
	/**
	 * @param {Readonly<Point2D>} other 
	 */
	[`/`](other) {
		return Point2D[`/`](this, other);
	}
	clone() {
		return Point2D.clone(this);
	}
	/**
	 * @returns {Generator<number>}
	 */
	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
		return;
	}
}
//#endregion
//#region Point 3D
class Point3D extends Point2D {
	/**
	 * @param {Readonly<Point3D>} first 
	 * @param {Readonly<Point3D>} second 
	 */
	static [`+`](first, second) {
		return new Point3D(first.x + second.x, first.y + second.y, first.z + second.z);
	}
	/**
	 * @param {Readonly<Point3D>} first 
	 * @param {Readonly<Point3D>} second 
	 */
	static [`-`](first, second) {
		return new Point3D(first.x - second.x, first.y - second.y, first.z - second.z);
	}
	/**
	 * @param {Readonly<Point3D>} target 
	 * @param {Readonly<Point3D>} second 
	 */
	static [`*`](target, second) {
		return new Point3D(target.x * second.x, target.y * second.y, target.z * second.z);
	}
	/**
	 * @param {Readonly<Point3D>} target 
	 * @param {Readonly<Point3D>} second 
	 */
	static [`/`](target, second) {
		return new Point3D(target.x / second.x, target.y / second.y, target.z / second.z);
	}
	/**
	 * @param {Readonly<Point3D>} source 
	 * @returns {Point3D}
	 */
	static clone(source) {
		return new Point3D(source.x, source.y, source.z);
	}
	/**
	 * @param {number} value 
	 * @returns {Point3D}
	 */
	static repeat(value) {
		return new Point3D(value, value, value);
	}
	/** @readonly */ static get ZERO() { return Point3D.repeat(0); }
	/** @type {Readonly<Point3D>} */ static #CONSTANT_ZERO = Object.freeze(Point3D.ZERO);
	/** @readonly */ static get CONSTANT_ZERO() {
		return this.#CONSTANT_ZERO;
	}
	/** @readonly */ static get HALF() { return Point3D.repeat(0.5); }
	/** @type {Readonly<Point3D>} */ static #CONSTANT_HALF = Object.freeze(Point3D.HALF);
	/** @readonly */ static get CONSTANT_HALF() {
		return this.#CONSTANT_HALF;
	}
	/** @readonly */ static get TWO() { return Point3D.repeat(2); }
	/** @type {Readonly<Point3D>} */ static #CONSTANT_TWO = Object.freeze(Point3D.TWO);
	/** @readonly */ static get CONSTANT_TWO() {
		return this.#CONSTANT_TWO;
	}
	/**
	 * @param {number} x 
	 * @param {number} y 
	 * @param {number} z 
	 */
	constructor(x, y, z) {
		super(x, y);
		this.z = z;
	}
	/** @type {number} */ #z = 0;
	get z() {
		return this.#z;
	}
	set z(value) {
		this.#z = value;
	}
	/**
	 * @param {Readonly<Point3D>} other 
	 */
	[`+`](other) {
		return Point3D["+"](this, other);
	}
	/**
	 * @param {Readonly<Point3D>} other 
	 */
	[`-`](other) {
		return Point3D[`-`](this, other);
	}
	/**
	 * @param {Readonly<Point3D>} other 
	 */
	[`*`](other) {
		return Point3D[`*`](this, other);
	}
	/**
	 * @param {Readonly<Point3D>} other 
	 */
	[`/`](other) {
		return Point3D[`/`](this, other);
	}
	clone() {
		return Point3D.clone(this);
	}
	/**
	 * @returns {Generator<number>}
	 */
	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
		yield this.z;
		return;
	}
}
//#endregion

export { Point, Point1D, Point2D, Point3D };
