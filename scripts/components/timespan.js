"use strict";

class Timespan {
	//#region Converters
	/**
	 * @param {Number} duration (-∞ - ∞)
	 * @returns {[Boolean, Number, Number, Number, Number]} negativity, hours [0 - ∞), minutes [0 - 59], seconds [0 - 59], milliseconds [0 - 999]
	 */
	static #toTime(duration) {
		const negativity = duration < 0;
		duration = Math.abs(duration);
		const milliseconds = duration % 1000;
		duration = Math.trunc(duration / 1000);
		const seconds = duration % 60;
		duration = Math.trunc(duration / 60);
		const minutes = duration % 60;
		duration = Math.trunc(duration / 60);
		const hours = duration;
		return [negativity, hours, minutes, seconds, milliseconds];
	}
	/**
	 * @param {Boolean} negativity 
	 * @param {Number} hours [0 - ∞)
	 * @param {Number} minutes [0 - 59]
	 * @param {Number} seconds [0 - 59]
	 * @param {Number} milliseconds [0 - 999]
	 * @returns {Number} (-∞ - ∞)
	 */
	static #toDuration(negativity, hours, minutes, seconds, milliseconds) {
		return (negativity ? -1 : 1) * ((((hours) * 60 + minutes) * 60 + seconds) * 1000 + milliseconds);
	}
	/**
	 * @param {Timespan} timespan 
	 * @param {Boolean} full 
	 */
	static stringify(timespan, full = true) {
		const { negativity, hours, minutes, seconds, milliseconds } = timespan;
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
	 * @param {String} string 
	 */
	static parse(string) {
		const match = /(-)?(?:(?:(\d+):)?(\d+):)?(\d+)(?:\.(\d+))?/.exec(string);
		if (!match) {
			throw new SyntaxError(`Invalid moment syntax: ${string}`);
		}
		const negativity = (match[1] !== undefined);
		const [, , hours, minutes, seconds, milliseconds] = match.map(part => Number.parseInt(part ?? 0));
		if (0 > hours) throw new RangeError(`Invalid hours value: ${hours}`);
		if (0 > minutes || minutes > 59) throw new RangeError(`Invalid minutes value: ${minutes}`);
		if (0 > seconds || seconds > 59) throw new RangeError(`Invalid seconds value: ${seconds}`);
		if (0 > milliseconds || milliseconds > 999) throw new RangeError(`Invalid milliseconds value: ${milliseconds}`);
		return Timespan.viaTime(negativity, hours, minutes, seconds, milliseconds);
	}
	//#endregion
	//#region Constructors
	/**
	 * @param {Number} duration (-∞ - ∞)
	 */
	static viaDuration(duration = 0) {
		const result = new Timespan();
		result.#duration = Math.trunc(duration);
		[result.#negativity, result.#hours, result.#minutes, result.#seconds, result.#milliseconds] = Timespan.#toTime(result.#duration);
		return result;
	}
	/**
	 * @param {Boolean} negativity
	 * @param {Number} hours [0 - ∞)
	 * @param {Number} minutes [0 - 59]
	 * @param {Number} seconds [0 - 59]
	 * @param {Number} milliseconds [0 - 999]
	 */
	static viaTime(negativity = false, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) {
		if (0 > hours) throw new RangeError(`Property 'hours' out of range: ${hours}`);
		if (0 > minutes || minutes > 59) throw new RangeError(`Property 'minutes' out of range: ${minutes}`);
		if (0 > seconds || seconds > 59) throw new RangeError(`Property 'seconds' out of range: ${seconds}`);
		if (0 > milliseconds || milliseconds > 999) throw new RangeError(`Property 'milliseconds' out of range: ${milliseconds}`);
		const result = new Timespan();
		result.#negativity = negativity;
		result.#hours = Math.trunc(hours);
		result.#minutes = Math.trunc(minutes);
		result.#seconds = Math.trunc(seconds);
		result.#milliseconds = Math.trunc(milliseconds);
		result.#duration = Timespan.#toDuration(result.#negativity, result.#hours, result.#minutes, result.#seconds, result.#milliseconds);
		return result;
	}
	/**
	 * @param {Timespan} source
	 */
	static clone(source) {
		const result = new Timespan();
		result.#duration = source.#duration;
		result.#negativity = source.#negativity;
		result.#hours = source.#hours;
		result.#minutes = source.#minutes;
		result.#seconds = source.#seconds;
		result.#milliseconds = source.#milliseconds;
		return result;
	}
	//#endregion
	//#region Presets
	/** @readonly */ static get ZERO() { return Timespan.viaTime(false, 0, 0, 0, 0); };
	/** @readonly */ static get MILLISECOND() { return Timespan.viaTime(false, 0, 0, 0, 1); };
	/** @readonly */ static get SECOND() { return Timespan.viaTime(false, 0, 0, 1, 0); };
	/** @readonly */ static get MINUTE() { return Timespan.viaTime(false, 0, 1, 0, 0); };
	/** @readonly */ static get HOUR() { return Timespan.viaTime(false, 1, 0, 0, 0); };
	/** @readonly */ static get DAY() { return Timespan.viaTime(false, 24, 0, 0, 0); };
	//#endregion
	//#region Modifiers
	/**
	 * @param {Timespan} first 
	 * @param {Timespan} second 
	 */
	static add(first, second) {
		return Timespan.viaDuration(first.#duration + second.#duration);
	}
	/**
	 * @param {Timespan} first 
	 * @param {Timespan} second 
	 */
	static subtract(first, second) {
		return Timespan.viaDuration(first.#duration - second.#duration);
	}
	/**
	 * @param {Timespan} timespan 
	 * @param {Number} factor 
	 */
	static multiply(timespan, factor) {
		return Timespan.viaDuration(timespan.#duration * factor);
	}
	/**
	 * @param {Timespan} timespan 
	 * @param {Number} factor 
	 */
	static divide(timespan, factor) {
		return Timespan.viaDuration(timespan.#duration / factor);
	}
	/**
	 * @param {Timespan} timespan 
	 */
	static invert(timespan) {
		return Timespan.viaDuration(-1 * timespan.#duration);
	}
	//#endregion
	//#region Properties
	/** @type {Number} */ #duration = 0;
	get duration() {
		return this.#duration;
	}
	set duration(value) {
		if (value < 0) throw new RangeError(`Property 'duration' out of range: ${value}`);
		this.#duration = Math.trunc(value);
		[this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds] = Timespan.#toTime(this.#duration);
	}
	/** @type {Boolean} */ #negativity = false;
	get negativity() {
		return this.#negativity;
	}
	set negativity(value) {
		this.#negativity = value;
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	/** @type {Number} */ #hours = 0;
	get hours() {
		return this.#hours;
	}
	set hours(value) {
		if (value < 0) throw new RangeError(`Property 'hours' out of range: ${value}`);
		this.#hours = Math.trunc(value);
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	/** @type {Number} */ #minutes = 0;
	get minutes() {
		return this.#minutes;
	}
	set minutes(value) {
		if (value < 0 || value > 59) throw new RangeError(`Property 'minutes' out of range: ${value}`);
		this.#minutes = Math.trunc(value);
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	/** @type {Number} */ #seconds = 0;
	get seconds() {
		return this.#seconds;
	}
	set seconds(value) {
		if (value < 0 || value > 59) throw new RangeError(`Property 'seconds' out of range: ${value}`);
		this.#seconds = Math.trunc(value);
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	/** @type {Number} */ #milliseconds = 0;
	get milliseconds() {
		return this.#milliseconds;
	}
	set milliseconds(value) {
		if (value < 0 || value > 999) throw new RangeError(`Property 'milliseconds' out of range: ${value}`);
		this.#milliseconds = Math.trunc(value);
		this.#duration = Timespan.#toDuration(this.#negativity, this.#hours, this.#minutes, this.#seconds, this.#milliseconds);
	}
	//#endregion
	//#region Methods
	/**
	 * @param {Boolean} full 
	 */
	toString(full = true) {
		return Timespan.stringify(this, full);
	}
	[Symbol.toPrimitive]() {
		return this.#duration;
	}
	clone() {
		return Timespan.clone(this);
	}
	/**
	 * @param {Timespan} other 
	 */
	add(other) {
		return Timespan.add(this, other);
	}
	/**
	 * @param {Timespan} other 
	 */
	subtract(other) {
		return Timespan.subtract(this, other);
	}
	/**
	 * @param {Number} factor 
	 */
	multiply(factor) {
		return Timespan.multiply(this, factor);
	}
	/**
	 * @param {Number} factor 
	 */
	divide(factor) {
		return Timespan.divide(this, factor);
	}
	invert() {
		return Timespan.invert(this);
	}
	//#endregion
}
