"use strict";

const { hypot, abs, trunc } = Math;

//#region Point
/**
 * Abstract base class representing a point.
 * @abstract
 */
class Point {
	//#region Methods
	/**
	 * Checks if every component of the point is NaN.
	 * @param {Point} point The point to check.
	 * @returns {boolean} True if every component of the point is NaN, otherwise false.
	 */
	static isNaN(point) {
		for (const metric of point) {
			if (!Number.isNaN(metric)) return false;
		}
		return true;
	}
	/**
	 * Checks if all components of the point are finite numbers.
	 * @param {Point} point The point to check.
	 * @returns {boolean} True if all components of the point are finite, otherwise false.
	 */
	static isFinite(point) {
		for (const metric of point) {
			if (!Number.isFinite(metric)) return false;
		}
		return true;
	}
	/**
	 * Checks if all components of the point are integers.
	 * @param {Point} point The point to check.
	 * @returns {boolean} True if all components of the point are integers, otherwise false.
	 */
	static isInteger(point) {
		for (const metric of point) {
			if (!Number.isInteger(metric)) return false;
		}
		return true;
	}
	/**
	 * Checks if all components of the point are safe integers.
	 * @param {Point} point The point to check.
	 * @returns {boolean} True if all components of the point are safe integers, otherwise false.
	 */
	static isSafeInteger(point) {
		for (const metric of point) {
			if (!Number.isSafeInteger(metric)) return false;
		}
		return true;
	}
	/**
	 * @param {any[]} metrics 
	 * @returns {string}
	 */
	static #join(metrics) {
		return `(${metrics.join(`, `)})`;
	}
	//#endregion
	//#region Modifiers
	/**
	 * Returns a string representation of the point with a fixed number of digits after the decimal point.
	 * @param {number} [digits] The number of digits to appear after the decimal point.
	 * @returns {string} A string representation of the point.
	 */
	toFixed(digits) {
		return Point.#join(Array.from(this).map(metric => metric.toFixed(digits)));
	}
	/**
	 * Returns a string representation of the point in exponential notation.
	 * @param {number} [digits] The number of digits to appear after the decimal point.
	 * @returns {string} A string representation of the point in exponential notation.
	 */
	toExponential(digits) {
		return Point.#join(Array.from(this).map(metric => metric.toExponential(digits)));
	}
	/**
	 * Returns a string representation of the point with a specified precision.
	 * @param {number} [precision] The number of significant digits.
	 * @returns {string} A string representation of the point with the specified precision.
	 */
	toPrecision(precision) {
		return Point.#join(Array.from(this).map(metric => metric.toPrecision(precision)));
	}
	/**
	 * Returns a string representation of the point in the specified radix (base).
	 * @param {number} [radix] An integer between 2 and 36 specifying the base to use for representing numeric values.
	 * @returns {string} A string representation of the point in the specified radix.
	 */
	toString(radix) {
		return Point.#join(Array.from(this).map(metric => metric.toString(radix)));
	}
	/**
	 * Returns a string representation of the point formatted according to the specified locale and formatting options.
	 * @param {Intl.LocalesArgument} [locales] A string with a BCP 47 language tag, or an array of such strings.
	 * @param {Intl.NumberFormatOptions} [options] An object with some or all of the following properties.
	 * @returns {string} A string representation of the point formatted according to the specified locale and formatting options.
	 */
	toLocaleString(locales, options) {
		return Point.#join(Array.from(this).map(metric => metric.toLocaleString(locales, options)));
	}
	/**
	 * Returns an iterator object that yields each component of the point.
	 * @abstract
	 * @returns {Iterator<number>} An iterator object.
	 */
	*[Symbol.iterator]() {
		throw new ReferenceError(`Not implemented function`);
	}
	//#endregion
}
//#endregion
//#region Point 1D
/**
 * Represents a point in one-dimensional space.
 */
class Point1D extends Point {
	//#region Constructors
	/** @type {RegExp} */
	static #regexPointParser = /^\(\s*(\S+)\s*\)$/;
	/**
	 * Parses a string representation of a point.
	 * @param {string} string The string representation of the point.
	 * @returns {Point1D} The parsed point.
	 * @throws {SyntaxError} If the string is not a valid representation of a point.
	 */
	static parse(string) {
		const match = Point1D.#regexPointParser.exec(string.trim());
		if (match === null) throw new SyntaxError(`Invalid syntax '${string}' for 1D point`);
		const [, x] = match.map(part => Number(part));
		return new Point1D(x);
	}
	/**
	 * Static method to clone a point.
	 * @param {Readonly<Point1D>} source The point to clone.
	 * @returns {Point1D} A new point with the same coordinates as the source point.
	 */
	static clone(source) {
		return new Point1D(source.x);
	}
	/**
	 * Static method to create a point with a repeated value.
	 * @param {number} value The value to repeat.
	 * @returns {Point1D} A new point with the specified value.
	 */
	static fill(value) {
		return new Point1D(value);
	}
	/**
	 * Returns the NaN point (NaN).
	 * @readonly
	 * @returns {Point1D} The NaN point.
	 */
	static get NAN() {
		return Point1D.fill(NaN);
	}
	/** @type {Readonly<Point1D>} */
	static #CONSTANT_NAN = Object.freeze(Point1D.NAN);
	/**
	 * Returns the constant NaN point (NaN).
	 * @readonly
	 * @returns {Readonly<Point1D>} The constant NaN point.
	 */
	static get CONSTANT_NAN() {
		return this.#CONSTANT_NAN;
	}
	/**
	 * Returns the zero point (0).
	 * @readonly
	 * @returns {Point1D} The zero point.
	 */
	static get ZERO() {
		return Point1D.fill(0);
	}
	/** @type {Readonly<Point1D>} */
	static #CONSTANT_ZERO = Object.freeze(Point1D.ZERO);
	/**
	 * Returns the constant zero point (0).
	 * @readonly
	 * @returns {Readonly<Point1D>} The constant zero point.
	 */
	static get CONSTANT_ZERO() {
		return this.#CONSTANT_ZERO;
	}
	/**
	 * Returns the single point (1).
	 * @readonly
	 * @returns {Point1D} The single point.
	 */
	static get SINGLE() {
		return Point1D.fill(1);
	}
	/** @type {Readonly<Point1D>} */
	static #CONSTANT_SINGLE = Object.freeze(Point1D.SINGLE);
	/**
	 * Returns the constant single point (1).
	 * @readonly
	 * @returns {Readonly<Point1D>} The constant single point.
	 */
	static get CONSTANT_SINGLE() {
		return this.#CONSTANT_SINGLE;
	}
	/**
	 * Returns the double point (2).
	 * @readonly
	 * @returns {Point1D} The double point.
	 */
	static get DOUBLE() {
		return Point1D.fill(2);
	}
	/** @type {Readonly<Point1D>} */
	static #CONSTANT_DOUBLE = Object.freeze(Point1D.DOUBLE);
	/**
	 * Returns the constant double point (2).
	 * @readonly
	 * @returns {Readonly<Point1D>} The constant double point.
	 */
	static get CONSTANT_DOUBLE() {
		return this.#CONSTANT_DOUBLE;
	}
	/**
	 * @param {number} x The x-coordinate of the point.
	 */
	constructor(x) {
		super();
		this.x = x;
	}
	//#endregion
	//#region Methods
	/**
	 * Calculates the distance between two points.
	 * @param {Readonly<Point1D>} first The first point.
	 * @param {Readonly<Point1D>} second The second point.
	 * @returns {number} The distance between the two points.
	 */
	static getDistanceBetween(first, second) {
		return hypot(first.x - second.x);
	}
	//#endregion
	//#region Properties
	/** @type {number} */
	#x = 0;
	/**
	 * Gets the x-coordinate of the point.
	 * @returns {number} The x-coordinate.
	 */
	get x() {
		return this.#x;
	}
	/**
	 * Sets the x-coordinate of the point.
	 * @param {number} value The new value for the x-coordinate.
	 */
	set x(value) {
		this.#x = value;
	}
	//#endregion
	//#region Modifiers
	/**
	 * Returns an iterator that yields the coordinates of the point.
	 * @returns {Iterator<number>} An iterator object that yields the coordinates.
	 */
	*[Symbol.iterator]() {
		yield this.x;
		return;
	}
	/**
	 * Creates a clone of this point.
	 * @returns {Point1D} A new point with the same coordinates as this point.
	 */
	clone() {
		return Point1D.clone(this);
	}
	/**
	 * Maps a callback function to the point's coordinates.
	 * @param {(metric: number) => number} callback The callback function.
	 * @returns {Point1D} A new point with the mapped coordinates.
	 */
	map(callback) {
		return new Point1D(callback(this.x));
	}
	/**
	 * Adds another point to this point.
	 * @param {Readonly<Point1D>} other The point to add.
	 * @returns {Point1D} The result of adding the other point to this point.
	 */
	[`+`](other) {
		return new Point1D(this.x + other.x);
	}
	/**
	 * Subtracts another point from this point.
	 * @param {Readonly<Point1D>} other The point to subtract.
	 * @returns {Point1D} The result of subtracting the other point from this point.
	 */
	[`-`](other) {
		return new Point1D(this.x - other.x);
	}
	/**
	 * Multiplies this point by another point.
	 * @param {Readonly<Point1D>} other The point to multiply by.
	 * @returns {Point1D} The result of multiplying this point by the other point.
	 */
	[`*`](other) {
		return new Point1D(this.x * other.x);
	}
	/**
	 * Divides this point by another point.
	 * @param {Readonly<Point1D>} other The point to divide by.
	 * @returns {Point1D} The result of dividing this point by the other point.
	 */
	[`/`](other) {
		return new Point1D(this.x / other.x);
	}
	/**
	 * Calculates the distance from this point to another point.
	 * @param {Readonly<Point1D>} other The other point.
	 * @returns {number} The distance from this point to the other point.
	 */
	getDistanceFrom(other) {
		return Point1D.getDistanceBetween(this, other);
	}
	//#endregion
}
//#endregion
//#region Point 2D
/**
 * Represents a point in two-dimensional space.
 */
class Point2D extends Point1D {
	//#region Constructors
	/** @type {RegExp} */
	static #regexPointParser = /^\(\s*(\S+)\s*,\s*(\S+)\s*\)$/;
	/**
	 * Parses a string representation of a point.
	 * @param {string} string The string representation of the point.
	 * @returns {Point2D} The parsed point.
	 * @throws {SyntaxError} If the string is not a valid representation of a point.
	 */
	static parse(string) {
		const match = Point2D.#regexPointParser.exec(string.trim());
		if (match === null) throw new SyntaxError(`Invalid syntax '${string}' for 2D point`);
		const [, x, y] = match.map(part => Number(part));
		return new Point2D(x, y);
	}
	/**
	 * Static method to clone a point.
	 * @param {Readonly<Point2D>} source The point to clone.
	 * @returns {Point2D} A new point with the same coordinates as the source point.
	 */
	static clone(source) {
		return new Point2D(source.x, source.y);
	}
	/**
	 * Static method to create a point with a repeated value.
	 * @param {number} value The value to repeat.
	 * @returns {Point2D} A new point with the specified value.
	 */
	static fill(value) {
		return new Point2D(value, value);
	}
	/**
	 * Returns the NaN point (NaN, NaN).
	 * @readonly
	 * @returns {Point2D} The NaN point.
	 */
	static get NAN() {
		return Point2D.fill(NaN);
	}
	/** @type {Readonly<Point2D>} */
	static #CONSTANT_NAN = Object.freeze(Point2D.NAN);
	/**
	 * Returns the constant NaN point (NaN, NaN).
	 * @readonly
	 * @returns {Readonly<Point2D>} The constant NaN point.
	 */
	static get CONSTANT_NAN() {
		return this.#CONSTANT_NAN;
	}
	/**
	 * Returns the zero point (0, 0).
	 * @readonly
	 * @returns {Point2D} The zero point.
	 */
	static get ZERO() {
		return Point2D.fill(0);
	}
	/** @type {Readonly<Point2D>} */
	static #CONSTANT_ZERO = Object.freeze(Point2D.ZERO);
	/**
	 * Returns the constant zero point (0, 0).
	 * @readonly
	 * @returns {Readonly<Point2D>} The constant zero point.
	 */
	static get CONSTANT_ZERO() {
		return this.#CONSTANT_ZERO;
	}
	/**
	 * Returns the single point (1, 1).
	 * @readonly
	 * @returns {Point2D} The single point.
	 */
	static get SINGLE() {
		return Point2D.fill(1);
	}
	/** @type {Readonly<Point2D>} */
	static #CONSTANT_SINGLE = Object.freeze(Point2D.SINGLE);
	/**
	 * Returns the constant single point (1, 1).
	 * @readonly
	 * @returns {Readonly<Point2D>} The constant single point.
	 */
	static get CONSTANT_SINGLE() {
		return this.#CONSTANT_SINGLE;
	}
	/**
	 * Returns the double point (2, 2).
	 * @readonly
	 * @returns {Point2D} The double point.
	 */
	static get DOUBLE() {
		return Point2D.fill(2);
	}
	/** @type {Readonly<Point2D>} */
	static #CONSTANT_DOUBLE = Object.freeze(Point2D.DOUBLE);
	/**
	 * Returns the constant double point (2, 2).
	 * @readonly
	 * @returns {Readonly<Point2D>} The constant double point.
	 */
	static get CONSTANT_DOUBLE() {
		return this.#CONSTANT_DOUBLE;
	}
	/**
	 * @param {number} x The x-coordinate of the point.
	 * @param {number} y The y-coordinate of the point.
	 */
	constructor(x, y) {
		super(x);
		this.y = y;
	}
	//#endregion
	//#region Methods
	/**
	 * Calculates the distance between two points.
	 * @param {Readonly<Point2D>} first The first point.
	 * @param {Readonly<Point2D>} second The second point.
	 * @returns {number} The distance between the two points.
	 */
	static getDistanceBetween(first, second) {
		return hypot(first.x - second.x, first.y - second.y);
	}
	//#endregion
	//#region Properties
	/** @type {number} */
	#y = 0;
	/**
	 * Gets the y-coordinate of the point.
	 * @returns {number} The y-coordinate.
	 */
	get y() {
		return this.#y;
	}
	/**
	 * Sets the y-coordinate of the point.
	 * @param {number} value The new value for the y-coordinate.
	 */
	set y(value) {
		this.#y = value;
	}
	//#endregion
	//#region Modifiers
	/**
	 * Returns an iterator that yields the coordinates of the point.
	 * @returns {Iterator<number>} An iterator object that yields the coordinates.
	 */
	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
		return;
	}
	/**
	 * Creates a clone of this point.
	 * @returns {Point2D} A new point with the same coordinates as this point.
	 */
	clone() {
		return Point2D.clone(this);
	}
	/**
	 * Maps a callback function to the point's coordinates.
	 * @param {(metric: number) => number} callback The callback function.
	 * @returns {Point2D} A new point with the mapped coordinates.
	 */
	map(callback) {
		return new Point2D(callback(this.x), callback(this.y));
	}
	/**
	 * Adds another point to this point.
	 * @param {Readonly<Point2D>} other The point to add.
	 * @returns {Point2D} The result of adding the other point to this point.
	 */
	[`+`](other) {
		return new Point2D(this.x + other.x, this.y + other.y);
	}
	/**
	 * Subtracts another point from this point.
	 * @param {Readonly<Point2D>} other The point to subtract.
	 * @returns {Point2D} The result of subtracting the other point from this point.
	 */
	[`-`](other) {
		return new Point2D(this.x - other.x, this.y - other.y);
	}
	/**
	 * Multiplies this point by another point.
	 * @param {Readonly<Point2D>} other The point to multiply by.
	 * @returns {Point2D} The result of multiplying this point by the other point.
	 */
	[`*`](other) {
		return new Point2D(this.x * other.x, this.y * other.y);
	}
	/**
	 * Divides this point by another point.
	 * @param {Readonly<Point2D>} other The point to divide by.
	 * @returns {Point2D} The result of dividing this point by the other point.
	 */
	[`/`](other) {
		return new Point2D(this.x / other.x, this.y / other.y);
	}
	/**
	 * Calculates the distance from this point to another point.
	 * @param {Readonly<Point2D>} other The other point.
	 * @returns {number} The distance from this point to the other point.
	 */
	getDistanceFrom(other) {
		return Point2D.getDistanceBetween(this, other);
	}
	//#endregion
}
//#endregion
//#region Point 3D
/**
 * Represents a point in three-dimensional space.
 */
class Point3D extends Point2D {
	//#region Constructors
	/** @type {RegExp} */
	static #regexPointParser = /^\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)$/;
	/**
	 * Parses a string representation of a point.
	 * @param {string} string The string representation of the point.
	 * @returns {Point3D} The parsed point.
	 * @throws {SyntaxError} If the string is not a valid representation of a point.
	 */
	static parse(string) {
		const match = Point3D.#regexPointParser.exec(string.trim());
		if (match === null) throw new SyntaxError(`Invalid syntax '${string}' for 3D point`);
		const [, x, y, z] = match.map(part => Number(part));
		return new Point3D(x, y, z);
	}
	/**
	 * Static method to clone a point.
	 * @param {Readonly<Point3D>} source The point to clone.
	 * @returns {Point3D} A new point with the same coordinates as the source point.
	 */
	static clone(source) {
		return new Point3D(source.x, source.y, source.z);
	}
	/**
	 * Static method to create a point with a repeated value.
	 * @param {number} value The value to repeat.
	 * @returns {Point3D} A new point with the specified value.
	 */
	static fill(value) {
		return new Point3D(value, value, value);
	}
	/**
	 * Returns the NaN point (NaN, NaN, NaN).
	 * @readonly
	 * @returns {Point3D} The NaN point.
	 */
	static get NAN() {
		return Point3D.fill(NaN);
	}
	/** @type {Readonly<Point3D>} */
	static #CONSTANT_NAN = Object.freeze(Point3D.NAN);
	/**
	 * Returns the constant NaN point (NaN, NaN, NaN).
	 * @readonly
	 * @returns {Readonly<Point3D>} The constant NaN point.
	 */
	static get CONSTANT_NAN() {
		return this.#CONSTANT_NAN;
	}
	/**
	 * Returns the zero point (0, 0, 0).
	 * @readonly
	 * @returns {Point3D} The zero point.
	 */
	static get ZERO() {
		return Point3D.fill(0);
	}
	/** @type {Readonly<Point3D>} */
	static #CONSTANT_ZERO = Object.freeze(Point3D.ZERO);
	/**
	 * Returns the constant zero point (0, 0, 0).
	 * @readonly
	 * @returns {Readonly<Point3D>} The constant zero point.
	 */
	static get CONSTANT_ZERO() {
		return this.#CONSTANT_ZERO;
	}
	/**
	 * Returns the single point (1, 1, 1).
	 * @readonly
	 * @returns {Point3D} The single point.
	 */
	static get SINGLE() {
		return Point3D.fill(1);
	}
	/** @type {Readonly<Point3D>} */
	static #CONSTANT_SINGLE = Object.freeze(Point3D.SINGLE);
	/**
	 * Returns the constant single point (1, 1, 1).
	 * @readonly
	 * @returns {Readonly<Point3D>} The constant single point.
	 */
	static get CONSTANT_SINGLE() {
		return this.#CONSTANT_SINGLE;
	}
	/**
	 * Returns the double point (2, 2, 2).
	 * @readonly
	 * @returns {Point3D} The double point.
	 */
	static get DOUBLE() {
		return Point3D.fill(2);
	}
	/** @type {Readonly<Point3D>} */
	static #CONSTANT_DOUBLE = Object.freeze(Point3D.DOUBLE);
	/**
	 * Returns the constant double point (2, 2, 2).
	 * @readonly
	 * @returns {Readonly<Point3D>} The constant double point.
	 */
	static get CONSTANT_DOUBLE() {
		return this.#CONSTANT_DOUBLE;
	}
	/**
	 * @param {number} x The x-coordinate of the point.
	 * @param {number} y The y-coordinate of the point.
	 * @param {number} z The z-coordinate of the point.
	 */
	constructor(x, y, z) {
		super(x, y);
		this.z = z;
	}
	//#endregion
	//#region Methods
	/**
	 * Calculates the distance between two points.
	 * @param {Readonly<Point3D>} first The first point.
	 * @param {Readonly<Point3D>} second The second point.
	 * @returns {number} The distance between the two points.
	 */
	static getDistanceBetween(first, second) {
		return hypot(first.x - second.x, first.y - second.y, first.z - second.z);
	}
	//#endregion
	//#region Properties
	/** @type {number} */
	#z = 0;
	/**
	 * Gets the z-coordinate of the point.
	 * @returns {number} The z-coordinate.
	 */
	get z() {
		return this.#z;
	}
	/**
	 * Sets the z-coordinate of the point.
	 * @param {number} value The new value for the z-coordinate.
	 */
	set z(value) {
		this.#z = value;
	}
	//#endregion
	//#region Modifiers
	/**
	 * Returns an iterator that yields the coordinates of the point.
	 * @returns {Iterator<number>} An iterator object that yields the coordinates.
	 */
	*[Symbol.iterator]() {
		yield this.x;
		yield this.y;
		yield this.z;
		return;
	}
	/**
	 * Creates a clone of this point.
	 * @returns {Point3D} A new point with the same coordinates as this point.
	 */
	clone() {
		return Point3D.clone(this);
	}
	/**
	 * Maps a callback function to the point's coordinates.
	 * @param {(metric: number) => number} callback The callback function.
	 * @returns {Point3D} A new point with the mapped coordinates.
	 */
	map(callback) {
		return new Point3D(callback(this.x), callback(this.y), callback(this.z));
	}
	/**
	 * Adds another point to this point.
	 * @param {Readonly<Point3D>} other The point to add.
	 * @returns {Point3D} The result of adding the other point to this point.
	 */
	[`+`](other) {
		return new Point3D(this.x + other.x, this.y + other.y, this.z + other.z);
	}
	/**
	 * Subtracts another point from this point.
	 * @param {Readonly<Point3D>} other The point to subtract.
	 * @returns {Point3D} The result of subtracting the other point from this point.
	 */
	[`-`](other) {
		return new Point3D(this.x - other.x, this.y - other.y, this.z - other.z);
	}
	/**
	 * Multiplies this point by another point.
	 * @param {Readonly<Point3D>} other The point to multiply by.
	 * @returns {Point3D} The result of multiplying this point by the other point.
	 */
	[`*`](other) {
		return new Point3D(this.x * other.x, this.y * other.y, this.z * other.z);
	}
	/**
	 * Divides this point by another point.
	 * @param {Readonly<Point3D>} other The point to divide by.
	 * @returns {Point3D} The result of dividing this point by the other point.
	 */
	[`/`](other) {
		return new Point3D(this.x / other.x, this.y / other.y, this.z / other.z);
	}
	/**
	 * Calculates the distance from this point to another point.
	 * @param {Readonly<Point3D>} other The other point.
	 * @returns {number} The distance from this point to the other point.
	 */
	getDistanceFrom(other) {
		return Point3D.getDistanceBetween(this, other);
	}
	//#endregion
}
//#endregion

//#region Matrix
/**
 * Represents a matrix with generic data type.
 * @template T
 */
class Matrix {
	/**
	 * @param {Readonly<Point2D>} size The size of the matrix.
	 * @param {(position: Point2D) => T} initializer The value initializer for all elements in the matrix.
	 * @throws {TypeError} If the x or y coordinate of the size is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the size is negative.
	 */
	constructor(size, initializer) {
		if (!Point.isInteger(size)) throw new TypeError(`The size ${size} must be a finite integer point`);
		if (0 > size.x || 0 > size.y) throw new RangeError(`The size ${size} is out of range [(0, 0) - (+∞, +∞))`);
		this.#size = size;
		/** @type {T[][]} */
		const data = (this.#data = new Array(size.y));
		for (let y = 0; y < data.length; y++) {
			/** @type {T[]} */
			const row = (data[y] = new Array(size.x));
			for (let x = 0; x < row.length; x++) {
				row[x] = initializer(new Point2D(x, y));
			}
		}
	}
	/** @type {Readonly<Point2D>} */
	#size;
	/** 
	 * Gets the size of the matrix.
	 * @readonly 
	 * @returns {Readonly<Point2D>} The size of the matrix.
	 */
	get size() {
		return this.#size;
	}
	/** @type {T[][]} */
	#data;
	/**
	 * Gets the value at the specified position in the matrix.
	 * @param {Readonly<Point2D>} position The position to get the value from.
	 * @returns {T} The value at the specified position.
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	get(position) {
		if (!Point.isInteger(position)) throw new TypeError(`The position ${position} must be a finite integer point`);
		const { x, y } = position;
		const size = this.#size;
		if (0 > x || x >= size.x || 0 > y || y >= size.y) throw new RangeError(`The position ${position} is out of range [(0, 0) - ${size})`);
		return this.#data[y][x];
	}
	/**
	 * Sets the value at the specified position in the matrix.
	 * @param {Readonly<Point2D>} position The position to set the value at.
	 * @param {T} value The value to set.
	 * @throws {TypeError} If the x or y coordinate of the position is not an integer.
	 * @throws {RangeError} If the x or y coordinate of the position is out of range.
	 */
	set(position, value) {
		if (!Point.isInteger(position)) throw new TypeError(`The position ${position} must be a finite integer point`);
		const { x, y } = position;
		const size = this.#size;
		if (0 > x || x >= size.x || 0 > y || y >= size.y) throw new RangeError(`The position ${position} is out of range [(0, 0) - ${size})`);
		this.#data[y][x] = value;
	}
}
//#endregion

//#region Timespan
/**
 * Represents a duration of time.
 */
class Timespan {
	//#region Converters
	/**
	 * @param {number} hours integer
	 * @param {number} minutes integer
	 * @param {number} seconds integer
	 * @param {number} milliseconds integer
	 * @returns {[number, number, number, number]} [0 - +∞), [0 - 59], [0 - 59], [0 - 999]
	 */
	static #fixTimeOffset(hours, minutes, seconds, milliseconds) {
		seconds += trunc(milliseconds / 1000);
		milliseconds %= 1000;
		minutes += trunc(seconds / 60);
		seconds %= 60;
		hours += trunc(minutes / 60);
		minutes %= 60;
		return [hours, minutes, seconds, milliseconds];
	}
	/**
	 * @param {number} duration integer
	 * @returns {[boolean, number, number, number, number]} boolean, [0 - +∞), [0 - 59], [0 - 59], [0 - 999]
	 */
	static #toTime(duration) {
		const negativity = duration < 0;
		duration = abs(duration);
		const milliseconds = duration % 1000;
		duration = trunc(duration / 1000);
		const seconds = duration % 60;
		duration = trunc(duration / 60);
		const minutes = duration % 60;
		duration = trunc(duration / 60);
		const hours = duration;
		return [negativity, hours, minutes, seconds, milliseconds];
	}
	/**
	 * @param {boolean} negativity boolean
	 * @param {number} hours [0 - +∞)
	 * @param {number} minutes [0 - 59]
	 * @param {number} seconds [0 - 59]
	 * @param {number} milliseconds [0 - 999]
	 * @returns {number} integer
	 */
	static #toDuration(negativity, hours, minutes, seconds, milliseconds) {
		return (negativity ? -1 : 1) * ((((hours) * 60 + minutes) * 60 + seconds) * 1000 + milliseconds);
	}
	//#endregion
	//#region Constructors
	/** @type {RegExp} */
	static #patternTimespan = /^(-)?(?:(?:(\d+):)?(\d+):)?(\d+)(?:\.(\d+))?$/;
	/**
	 * Parses a string representation into a Timespan object.
	 * @param {string} string The string to parse.
	 * @returns {Timespan} The parsed Timespan object.
	 * @throws {SyntaxError} If the string has invalid syntax.
	 */
	static parse(string) {
		const match = Timespan.#patternTimespan.exec(string);
		if (match === null) throw new SyntaxError(`Invalid time '${string}' syntax`);
		const negativity = (match[1] !== undefined);
		const [, , hours, minutes, seconds, milliseconds] = match.map(part => Number(part ?? 0));
		return Timespan.viaTime(negativity, hours, minutes, seconds, milliseconds);
	}
	/**
	 * Creates a Timespan object from a duration.
	 * @param {number} duration The duration in milliseconds.
	 * @returns {Timespan} The Timespan object.
	 * @throws {TypeError} If the duration is not a finite number.
	 */
	static viaDuration(duration = 0) {
		if (!Number.isFinite(duration)) throw new TypeError(`The duration ${duration} must be a finite number`);
		const result = new Timespan();
		result.#duration = trunc(duration);
		[result.#negativity, result.#hours, result.#minutes, result.#seconds, result.#milliseconds] = Timespan.#toTime(result.#duration);
		return result;
	}
	/**
	 * Creates a Timespan object from individual time components.
	 * @param {boolean} negativity Whether the timespan is negative.
	 * @param {number} hours The hours component.
	 * @param {number} minutes The minutes component.
	 * @param {number} seconds The seconds component.
	 * @param {number} milliseconds The milliseconds component.
	 * @returns {Timespan} The Timespan object.
	 * @throws {TypeError} If any of the parameters is not a finite number.
	 */
	static viaTime(negativity = false, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) {
		if (!Number.isFinite(hours)) throw new TypeError(`The hours ${hours} must be a finite number`);
		if (!Number.isFinite(minutes)) throw new TypeError(`The minutes ${minutes} must be a finite number`);
		if (!Number.isFinite(seconds)) throw new TypeError(`The seconds ${seconds} must be a finite number`);
		if (!Number.isFinite(milliseconds)) throw new TypeError(`The milliseconds ${milliseconds} must be a finite number`);
		const result = new Timespan();
		result.#negativity = negativity;
		[result.#hours, result.#minutes, result.#seconds, result.#milliseconds] = Timespan.#fixTimeOffset(trunc(hours), trunc(minutes), trunc(seconds), trunc(milliseconds));
		result.#duration = Timespan.#toDuration(result.#negativity, result.#hours, result.#minutes, result.#seconds, result.#milliseconds);
		return result;
	}
	/**
	 * Clones a Timespan object.
	 * @param {Readonly<Timespan>} source The source Timespan object.
	 * @returns {Timespan} The cloned Timespan object.
	 */
	static clone(source) {
		const result = new Timespan();
		result.#duration = source.duration;
		result.#negativity = source.negativity;
		result.#hours = source.hours;
		result.#minutes = source.minutes;
		result.#seconds = source.seconds;
		result.#milliseconds = source.milliseconds;
		return result;
	}
	//#endregion
	//#region Presets
	/**
	 * Represents a zero timespan.
	 * @readonly
	 * @returns {Timespan}
	 */
	static get ZERO() { return Timespan.viaTime(false, 0, 0, 0, 0); };
	/**
	 * Represents a timespan of one millisecond.
	 * @readonly
	 * @returns {Timespan}
	 */
	static get MILLISECOND() { return Timespan.viaTime(false, 0, 0, 0, 1); };
	/**
	 * Represents a timespan of one second.
	 * @readonly
	 * @returns {Timespan}
	 */
	static get SECOND() { return Timespan.viaTime(false, 0, 0, 1, 0); };
	/**
	 * Represents a timespan of one minute.
	 * @readonly
	 * @returns {Timespan}
	 */
	static get MINUTE() { return Timespan.viaTime(false, 0, 1, 0, 0); };
	/**
	 * Represents a timespan of one hour.
	 * @readonly
	 * @returns {Timespan}
	 */
	static get HOUR() { return Timespan.viaTime(false, 1, 0, 0, 0); };
	/**
	 * Represents a timespan of one day.
	 * @readonly
	 * @returns {Timespan}
	 */
	static get DAY() { return Timespan.viaTime(false, 24, 0, 0, 0); };
	//#endregion
	//#region Methods
	/**
	 * Inverts the sign of a timespan.
	 * @param {Readonly<Timespan>} timespan The timespan to invert.
	 * @returns {Timespan} A new timespan representing the negation of the current timespan.
	 */
	static invert(timespan) {
		return timespan.clone().invert();
	}
	//#endregion
	//#region Properties
	/** @type {number} */
	#duration = 0;
	/**
	 * Gets the duration of the timespan in milliseconds.
	 * @type {number}
	 */
	get duration() {
		return this.#duration;
	}
	/**
	 * Sets the duration of the timespan in milliseconds.
	 * @param {number} value The duration value to set.
	 */
	set duration(value) {
		if (!Number.isFinite(value)) return;
		this.#duration = trunc(value);
		[this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds] = Timespan.#toTime(this.#duration);
	}
	/** @type {boolean} */
	#negativity = false;
	/**
	 * Gets whether the timespan is negative.
	 * @type {boolean}
	 */
	get negativity() {
		return this.#negativity;
	}
	/**
	 * Sets whether the timespan is negative.
	 * @param {boolean} value The negativity value to set.
	 */
	set negativity(value) {
		this.#negativity = value;
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	/** @type {number} */
	#hours = 0;
	/**
	 * Gets the hours component of the timespan.
	 * @type {number}
	 */
	get hours() {
		return this.#hours;
	}
	/**
	 * Sets the hours component of the timespan.
	 * @param {number} value The hours value to set.
	 */
	set hours(value) {
		if (!Number.isFinite(value)) return;
		[this.#hours, this.#minutes, this.#seconds, this.#milliseconds] = Timespan.#fixTimeOffset(trunc(value), this.#minutes, this.#seconds, this.#milliseconds);
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	/** @type {number} */
	#minutes = 0;
	/**
	 * Gets the minutes component of the timespan.
	 * @type {number}
	 */
	get minutes() {
		return this.#minutes;
	}
	/**
	 * Sets the minutes component of the timespan.
	 * @param {number} value The minutes value to set.
	 */
	set minutes(value) {
		if (!Number.isFinite(value)) return;
		[this.#hours, this.#minutes, this.#seconds, this.#milliseconds] = Timespan.#fixTimeOffset(this.#hours, trunc(value), this.#seconds, this.#milliseconds);
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	/** @type {number} */
	#seconds = 0;
	/**
	 * Gets the seconds component of the timespan.
	 * @type {number}
	 */
	get seconds() {
		return this.#seconds;
	}
	/**
	 * Sets the seconds component of the timespan.
	 * @param {number} value The seconds value to set.
	 */
	set seconds(value) {
		if (!Number.isFinite(value)) return;
		[this.#hours, this.#minutes, this.#seconds, this.#milliseconds] = Timespan.#fixTimeOffset(this.#hours, this.#minutes, trunc(value), this.#milliseconds);
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	/** @type {number} */
	#milliseconds = 0;
	/**
	 * Gets the milliseconds component of the timespan.
	 * @type {number}
	 */
	get milliseconds() {
		return this.#milliseconds;
	}
	/**
	 * Sets the milliseconds component of the timespan.
	 * @param {number} value The milliseconds value to set.
	 */
	set milliseconds(value) {
		if (!Number.isFinite(value)) return;
		[this.#hours, this.#minutes, this.#seconds, this.#milliseconds] = Timespan.#fixTimeOffset(this.#hours, this.#minutes, this.#seconds, trunc(value));
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	//#endregion
	//#region Modifiers
	/**
	 * Converts the timespan to a string representation.
	 * @param {boolean} full Determines whether to include all time components or not. Default is true.
	 * @returns {string} The string representation of the timespan.
	 */
	toString(full = true) {
		const { negativity, hours, minutes, seconds, milliseconds } = this;
		let result = seconds.toFixed().padStart(2, `0`);
		if (full || milliseconds > 0) {
			result = `${result}.${milliseconds.toFixed().padStart(3, `0`)}`;
		}
		if (full || hours > 0) {
			result = `${minutes.toFixed().padStart(2, `0`)}:${result}`;
			result = `${hours.toFixed().padStart(2, `0`)}:${result}`;
		} else if (minutes > 0) {
			result = `${minutes.toFixed().padStart(2, `0`)}:${result}`;
		}
		if (negativity) {
			result = `-${result}`;
		}
		return result;
	}
	/**
	 * @param {any} hint 
	 * @returns {any}
	 */
	[Symbol.toPrimitive](hint) {
		switch (hint) {
			case `number`: return this.#duration;
			case `boolean`: return Boolean(this.#duration);
			case `string`: return this.toString();
			default: throw new TypeError(`Invalid '${hint}' primitive hint`);
		}
	}
	/**
	 * Creates a shallow copy of the timespan.
	 * @returns {Timespan} A new timespan instance that is a clone of the current one.
	 */
	clone() {
		return Timespan.clone(this);
	}
	/**
	 * Adds another timespan to the current timespan.
	 * @param {Readonly<Timespan>} other The timespan to add.
	 * @returns {Timespan} A new timespan representing the sum of the current timespan and the other timespan.
	 */
	[`+`](other) {
		return Timespan.viaDuration(this.duration + other.duration);
	}
	/**
	 * Subtracts another timespan from the current timespan.
	 * @param {Readonly<Timespan>} other The timespan to subtract.
	 * @returns {Timespan} A new timespan representing the difference between the current timespan and the other timespan.
	 */
	[`-`](other) {
		return Timespan.viaDuration(this.duration - other.duration);
	}
	/**
	 * Multiplies the duration of the timespan by a factor.
	 * @param {number} factor The factor by which to multiply the duration.
	 * @returns {Timespan} A new timespan representing the duration multiplied by the factor.
	 */
	[`*`](factor) {
		return Timespan.viaDuration(this.duration * factor);
	}
	/**
	 * Divides the duration of the timespan by a factor.
	 * @param {number} factor The factor by which to divide the duration.
	 * @returns {Timespan} A new timespan representing the duration divided by the factor.
	 */
	[`/`](factor) {
		return Timespan.viaDuration(this.duration / factor);
	}
	/**
	 * Inverts the current timespan, changing its sign.
	 * @returns {Timespan} The current timespan.
	 */
	invert() {
		this.duration *= -1;
		return this;
	}
	//#endregion
}
//#endregion
//#region Stopwatch
/**
 * A class representing a stopwatch to measure time durations.
 */
class Stopwatch {
	/**
	 * @param {boolean} launch Whether to start the stopwatch immediately.
	 */
	constructor(launch = false) {
		let previous = 0;
		/**
		 * @param {number} current 
		 * @returns {void}
		 */
		const callback = (current) => {
			const difference = current - previous;
			if (this.#launched) {
				this.#elapsed += difference;
			}
			previous = current;
			requestAnimationFrame(callback);
		};
		requestAnimationFrame(callback);

		this.#launched = launch;
	}
	/** @type {number} */
	#elapsed = 0;
	/**
	 * Gets the elapsed time as a Timespan instance.
	 * @readonly
	 * @returns {Timespan}
	 */
	get elapsed() {
		return Timespan.viaDuration(this.#elapsed);
	}
	/**
	 * Resets the elapsed time to zero.
	 * @returns {void}
	 */
	reset() {
		this.#elapsed = 0;
	}
	/** @type {boolean} */
	#launched;
	/**
	 * Gets the launched state of the stopwatch.
	 * @returns {boolean}
	 */
	get launched() {
		return this.#launched;
	}
	/**
	 * Sets the launched state of the stopwatch.
	 * @param {boolean} value
	 * @returns {void}
	 */
	set launched(value) {
		this.#launched = value;
	}
}
//#endregion

export { Point, Point1D, Point2D, Point3D, Matrix, Timespan, Stopwatch };
