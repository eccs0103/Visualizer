/// <reference path="./declarations.d.ts" />

"use strict";

const { PI, trunc } = Math;

//#region Number
/**
 * Imports a number from a source.
 * @param {any} source The source value to import.
 * @param {string} name The name of the source value.
 * @returns {number} The imported number value.
 * @throws {TypeError} If the source is not a number.
 */
Number.import = function (source, name = `source`) {
	if (typeof (source) !== `number`) throw new TypeError(`Unable to import ${name} due its ${typename(source)} type`);
	return source.valueOf();
};

/**
 * Exports the number value.
 * @returns {number} The exported number value.
 */
Number.prototype.export = function () {
	return this.valueOf();
};

/**
 * Clamps a value between a minimum and maximum.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @returns {number} The clamped value.
 */
Number.prototype.clamp = function (min, max) {
	let value = this.valueOf();
	value = (value > min ? value : min);
	value = (value < max ? value : max);
	return value;
};

/**
 * Interpolates the number from one range to another.
 * @param {number} min1 The minimum value of the original range.
 * @param {number} max1 The maximum value of the original range.
 * @param {number} min2 The minimum value of the target range.
 * @param {number} max2 The maximum value of the target range.
 * @returns {number} The interpolated value within the target range.
 * @throws {Error} If the minimum and maximum values of either range are equal.
 */
Number.prototype.interpolate = function (min1, max1, min2 = 0, max2 = 1) {
	if (min1 === max1) throw new Error(`Minimum and maximum of the original range cant be equal`);
	if (min2 === max2) throw new Error(`Minimum and maximum of the target range cant be equal`);
	return min2 + (max2 - min2) * ((this.valueOf() - min1) / (max1 - min1));
};

/**
 * Returns the current number or a default value if the current number is NaN.
 * @param {number} value The default value to return if the current number is NaN.
 * @returns {number} The current number if it is not NaN, otherwise the default value.
 */
Number.prototype.orDefault = function (value) {
	const current = this.valueOf();
	return (Number.isNaN(current) ? value : current);
};
//#endregion
//#region Boolean
/**
 * Imports a boolean value from a source.
 * @param {any} source The source value to import.
 * @param {string} name The name of the source value.
 * @returns {boolean} The imported boolean value.
 * @throws {TypeError} If the source is not a boolean.
 */
Boolean.import = function (source, name = `source`) {
	if (typeof (source) !== `boolean`) throw new TypeError(`Unable to import ${name} due its ${typename(source)} type`);
	return source.valueOf();
};

/**
 * Exports the boolean value.
 * @returns {boolean} The exported boolean value.
 */
Boolean.prototype.export = function () {
	return this.valueOf();
};
//#endregion
//#region String
/**
 * Imports a string from a source.
 * @param {any} source The source value to import.
 * @param {string} name The name of the source value.
 * @returns {string} The imported string value.
 * @throws {TypeError} If the source is not a string.
 */
String.import = function (source, name = `source`) {
	if (typeof (source) !== `string`) throw new TypeError(`Unable to import ${name} due its ${typename(source)} type`);
	return source.valueOf();
};

Object.defineProperty(String, `empty`, {
	value: ``,
	writable: false,
});

/**
 * Checks if a string is empty.
 * @param {string} text The string to check.
 * @returns {boolean} True if the string is empty, otherwise false.
 */
String.isEmpty = function (text) {
	return (text.length === 0);
};

/**
 * Checks if a string contains only whitespace characters.
 * @param {string} text The string to check.
 * @returns {boolean} True if the string is empty or contains only whitespace, otherwise false.
 */
String.isWhitespace = function (text) {
	return String.isEmpty(text.trim());
};

/**
 * Exports the string value.
 * @returns {string} The exported string value.
 */
String.prototype.export = function () {
	return this.valueOf();
};

/**
 * Returns the current string value or a default value if the string is empty.
 * @param {string} value The default value to return if the string is empty.
 * @returns {string} The current string value or the provided default value.
 */
String.prototype.orDefault = function (value) {
	const current = this.valueOf();
	return (String.isEmpty(current) ? value : current);
};

const patternWordsFirstLetter = /\b\w/g;

/**
 * Converts the string to title case, where the first letter of each word is capitalized.
 * @returns {string} The string converted to title case.
 */
String.prototype.toTitleCase = function () {
	return this.toLowerCase().replace(patternWordsFirstLetter, char => char.toUpperCase());
};

/**
 * Converts the string to title case based on the specified locale(s), capitalizing the first letter of each word.
 * @overload
 * @param {string | string[]} locales A single locale or an array of locales for locale-aware case conversion.
 * @returns {string} The string converted to title case with locale-awareness.
 * 
 * Converts the string to title case based on the specified locale(s), capitalizing the first letter of each word.
 * @overload
 * @param {Intl.LocalesArgument} locales An argument supported by `Intl` for locale-aware case conversion.
 * @returns {string} The string converted to title case with locale-awareness.
 */
/**
 * @param {Intl.LocalesArgument | string | string[]} locales 
 * @returns {string}
 */
String.prototype.toLocalTitleCase = function (locales) {
	return this.toLocaleLowerCase(locales).replace(patternWordsFirstLetter, char => char.toLocaleUpperCase(locales));
};

/**
 * Reverses the string.
 * @returns {string} The reversed string.
 */
String.prototype.reverse = function () {
	let result = String.empty;
	for (let index = this.length - 1; index >= 0; index--) {
		result += this[index];
	}
	return result;
};
//#endregion
//#region Function
/**
 * Checks if the given function is implemented by running it and seeing if it throws a specific `ReferenceError`.
 * @param {(...args: any) => unknown} action The function to check for implementation.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the function is implemented, `false` otherwise.
 */
Function.isImplemented = async function (action) {
	try {
		await action();
		return true;
	} catch (reason) {
		if (!(reason instanceof ImplementationError)) return true;
		return false;
	}
};

/**
 * Ensures the given function is implemented by checking it and throwing an error if it is not.
 * @param {(...args: any) => unknown} action The function to check for implementation.
 * @param {string} name The name of the function to be used in the error message if the function is not implemented.
 * @returns {Promise<void>} A promise that resolves if the function is implemented, otherwise it rejects with an error.
 * @throws {Error} Throws an error if the function is not implemented.
 */
Function.ensureImplementation = async function (action, name) {
	if (!(await Function.isImplemented(action))) throw new Error(`Function '${name}' not implemented`);
};
//#endregion
//#region Object
/**
 * Imports an object from a source.
 * @param {any} source The source to import from.
 * @param {string} name The name of the source.
 * @returns {object} The imported object.
 * @throws {TypeError} If the source is not an object or null.
 */
Object.import = function (source, name = `source`) {
	if (typeof (source) !== `object` || source === null) throw new TypeError(`Unable to import ${name} due its ${typename(source)} type`);
	return source.valueOf();
};

/**
 * Applies a callback function to a non-nullable value, or returns the original nullable value.
 * @template T The type of the input value.
 * @template {Exclude<T, NonNullable<T>>} N The type representing nullable.
 * @template R The return type of the callback function.
 * @param {NonNullable<T> | N} value The value to map.
 * @param {(object: NonNullable<T>) => R} callback The function to apply if the value is non-nullable.
 * @returns {R | N} The mapped result.
 */
Object.map = function (value, callback) {
	if (value === null || value === undefined) return value;
	else return callback(value);
};

/**
 * Ensures that a value is neither null nor undefined, throwing an error if it is.
 * @template T
 * @param {T} value The value to check.
 * @param {string} name The name of the value, used in error messages.
 * @returns {NonNullable<T>} The value if it is not null or undefined.
 * @throws {Error} If the value is null or undefined.
 */
Object.suppress = function (value, name = `value`) {
	switch (value) {
		case null: throw new Error(`${name.toTitleCase()} mustn't be null`);
		case undefined: throw new Error(`${name.toTitleCase()} mustn't be undefined`);
		default: return (/** @type {NonNullable<T>} */ (value));
	}
};

/**
 * Exports the object.
 * @returns {object} The exported object.
 */
Object.prototype.export = function () {
	return this.valueOf();
};
//#endregion
//#region Iterator
/**
 * Generates a range of integers between the specified minimum and maximum values (exclusive).
 * @param {number} min The minimum value of the range (inclusive).
 * @param {number} max The maximum value of the range (exclusive).
 * @returns {Generator<number>} A generator yielding integers in the specified range.
 */
Iterator.range = function* (min, max) {
	min = trunc(min);
	max = trunc(max);
	for (let index = 0; index < max - min; index++) {
		yield index + min;
	}
};
//#endregion
//#region Array
/**
 * Imports an array from a source.
 * @param {any} source The source to import from.
 * @param {string} name The name of the source.
 * @returns {any[]} The imported array.
 * @throws {TypeError} Throws a TypeError if the source is not an array.
 */
Array.import = function (source, name = `source`) {
	if (!(source instanceof Array)) throw new TypeError(`Unable to import ${name} due its ${typename(source)} type`);
	return Array.from(source);
};

/**
 * Creates an array of integers between the specified minimum and maximum values (exclusive).
 * @param {number} min The minimum value of the range (inclusive).
 * @param {number} max The maximum value of the range (exclusive).
 * @returns {number[]} An array containing integers in the specified range.
 */
Array.range = function (min, max) {
	return Array.from(Iterator.range(min, max));
};

/**
 * Exports the array.
 * @returns {this[]} The exported array.
 */
Array.prototype.export = function () {
	return Array.from(this);
};

/**
 * Swaps the elements at the given indices in the array.
 * @param {number} index1 The index of the first element.
 * @param {number} index2 The index of the second element.
 * @returns {void}
 */
Array.prototype.swap = function (index1, index2) {
	index1 = trunc(index1);
	index2 = trunc(index2);
	const temporary = this[index1];
	this[index1] = this[index2];
	this[index2] = temporary;
};
//#endregion
//#region Data pair
/**
 * Represents a key-value pair of data.
 * @template K The type of the key.
 * @template V The type of the value.
 */
class DataPair {
	/**
	 * Creates a DataPair instance from an array containing a key-value pair.
	 * @template K The type of the key.
	 * @template V The type of the value.
	 * @param {Readonly<[NonNullable<K>, V]>} source The source array containing the key-value pair.
	 * @returns {DataPair<K, V>} A new DataPair instance.
	 */
	static fromArray(source) {
		const [key, value] = source;
		return new DataPair(key, value);
	}
	/**
	 * Converts the DataPair instance to an array containing the key-value pair.
	 * @returns {[NonNullable<K>, V]} The key-value pair as an array.
	 */
	toArray() {
		return [this.#key, this.#value];
	}
	/**
	 * @param {NonNullable<K>} key The key of the data pair.
	 * @param {V} value The value of the data pair.
	 */
	constructor(key, value) {
		this.#key = key;
		this.#value = value;
	}
	/** @type {NonNullable<K>} */
	#key;
	/**
	 * Gets the key of the data pair.
	 * @readonly
	 * @returns {NonNullable<K>} The key of the data pair.
	 */
	get key() {
		return this.#key;
	}
	/** @type {V} */
	#value;
	/**
	 * Gets the value of the data pair.
	 * @returns {V} The value of the data pair.
	 */
	get value() {
		return this.#value;
	}
	/**
	 * Sets the value of the data pair.
	 * @param {V} value The new value of the data pair.
	 * @returns {void}
	 */
	set value(value) {
		this.#value = value;
	}
}
//#endregion
//#region Math
/**
 * Splits a number into its integer and fractional parts.
 * @param {number} x The number to be split.
 * @returns {[number, number]} A tuple where the first element is the integer part and the second element is the fractional part.
 */
Math.split = function (x) {
	const integer = trunc(x);
	return [integer, (x - integer)];
};

/**
 * Calculates the square of a number.
 * @param {number} x The number to square.
 * @returns {number} The square of the input number.
 */
Math.sqpw = function (x) {
	return x * x;
};

const toDegreeFactor = 180 / PI;
/**
 * Converts radians to degrees.
 * @param {number} radians The angle in radians.
 * @returns {number} The angle in degrees.
 */
Math.toDegrees = function (radians) {
	return radians * toDegreeFactor;
};

const toRadianFactor = PI / 180;
/**
 * Converts degrees to radians.
 * @param {number} degrees The angle in degrees.
 * @returns {number} The angle in radians.
 */
Math.toRadians = function (degrees) {
	return degrees * toRadianFactor;
};
//#endregion
//#region Promise
Object.defineProperty(Promise.prototype, `fulfilled`, {
	async get() {
		try {
			await this;
			return true;
		} catch (reason) {
			return false;
		}
	}
});

Object.defineProperty(Promise.prototype, `value`, {
	async get() {
		try {
			return await this;
		} catch (reason) {
			throw new Error(`Unable to get value of rejected promise`);
		}
	}
});

Object.defineProperty(Promise.prototype, `reason`, {
	async get() {
		try {
			await this;
			throw new Error(`Unable to get reason of resolved promise`);
		} catch (reason) {
			return reason;
		}
	}
});
//#endregion
//#region Promise factory
/**
 * A factory that allows running promises with a custom executor.
 * @template T
 */
class PromiseFactory {
	/**
	 * @param {(resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void} executor The executor function that takes two arguments: resolve and reject.
	 */
	constructor(executor) {
		this.#executor = executor;
	}
	/** @type {(resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void} */
	#executor;
	/**
	 * Runs the promise using the provided executor.
	 * @returns {Promise<T>} The promise that resolves with the value produced by the executor.
	 */
	async run() {
		const { promise, resolve, reject } = Promise.withResolvers();
		this.#executor.call(promise, resolve, reject);
		return await promise;
	}
	/**
	 * Repeatedly runs the promise until the given predicate returns true.
	 * @param {(value: T) => boolean} predicate A function that tests the resolved value.
	 * @returns {Promise<T>} The promise that resolves when the predicate is true.
	 */
	async runUntil(predicate) {
		while (true) {
			try {
				const result = await this.run();
				if (!predicate(result)) continue;
				return result;
			} catch {
				continue;
			}
		}
	}
	/**
	 * @template U
	 * @param {(value: T) => U} callback 
	 * @returns {Promise<U>}
	 */
	async runMapping(callback) {
		while (true) {
			try {
				return callback(await this.run());
			} catch {
				continue;
			}
		}
	}
}
//#endregion
//#region Error
/**
 * Generates an error object from the provided input.
 * @param {any} reason The reason input.
 * @returns {Error}
 */
Error.from = function (reason) {
	return reason instanceof Error ? reason : new Error(reason ?? `Undefined reason`);
};

/**
 * Throws an error based on the provided input.
 * @param {any} reason The reason for the error.
 * @returns {never}
 */
Error.throws = function (reason = undefined) {
	throw Error.from(reason);
};

/**
 * Returns a string representation of the Error object.
 * @returns {string} A string representation of the Error object.
 */
Error.prototype.toString = function () {
	let text = this.stack ?? `${this.name}: ${this.message}`;
	if (this.cause !== undefined) text += ` cause of:\n\r${Error.from(this.cause)}`;
	return text;
};
//#endregion
//#region Implementation error
class ImplementationError extends ReferenceError {
	/**
	 * @param {ErrorOptions} options 
	 */
	constructor(options = {}) {
		super(`Not implemented function`, options);
		if (new.target !== ImplementationError) throw new TypeError(`Unable to create an instance of sealed-extended class`);
		this.name = `ImplementationError`;
	}
}
//#endregion
//#region Global
/**
 * Returns the prototype of the given non-nullable value.
 * @template T
 * @param {NonNullable<T>} value The value whose prototype is to be retrieved. It cannot be null or undefined.
 * @returns {Function}
 */
globalThis.prototype = function (value) {
	return value.constructor;
};

/**
 * Gets the type name of a value.
 * @param {any} value The value to get the type name of.
 * @returns {string} The type name of the value.
 */
globalThis.typename = function (value) {
	switch (value) {
		case undefined:
		case null: return String(value).toTitleCase();
		default: return prototype(value).name;
	}
};
//#endregion

export { DataPair, PromiseFactory, ImplementationError };
