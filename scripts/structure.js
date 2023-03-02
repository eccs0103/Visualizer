"use strict";
//#region Engine
class Engine {
	/**
	 * @param {() => void} handler 
	 */
	constructor(handler) {
		const instance = this;
		let previous = 0;
		requestAnimationFrame(function callback(time) {
			let current = time;
			const difference = current - previous;
			if (instance.#launched) {
				instance.#time += difference;
				handler();
			}
			previous = current;
			requestAnimationFrame(callback);
		});
	}
	/** @type {DOMHighResTimeStamp} */ #time = 0;
	/** @readonly */ get time() {
		return this.#time;
	}
	/** @type {Boolean} */ #launched = false;
	get launched() {
		return this.#launched;
	}
	set launched(value) {
		this.#launched = value;
	}
}
//#endregion
//#region Settings
/** @enum {Number} */ const FFTSize = {
	/** @readonly */ x32: 32,
	/** @readonly */ x64: 64,
	/** @readonly */ x128: 128,
	/** @readonly */ x256: 256,
	/** @readonly */ x512: 512,
	/** @readonly */ x1024: 1024,
	/** @readonly */ x2048: 2048,
	/** @readonly */ x4096: 4096,
	/** @readonly */ x8192: 8192,
	/** @readonly */ x16384: 16384,
	/** @readonly */ x32768: 32768,
};
/** @enum {String} */ const VisualizerType = {
	/** @readonly */ classic: `classic`,
};
/**
 * @typedef SettingsNotation
 * @property {FFTSize | undefined} FFTSize
 * @property {VisualizerType | undefined} type
 * @property {Number | undefined} highlightCycleTime
 * @property {Number | undefined} gapPercentage
 * @property {Boolean | undefined} loop
 */
class Settings {
	/**
	 * @param {SettingsNotation} source 
	 */
	static import(source) {
		const result = new Settings();
		if (source.FFTSize !== undefined) result.FFTSize = source.FFTSize;
		if (source.type !== undefined) result.type = source.type;
		if (source.highlightCycleTime !== undefined) result.highlightCycleTime = source.highlightCycleTime;
		if (source.gapPercentage !== undefined) result.gapPercentage = source.gapPercentage;
		if (source.loop !== undefined) result.loop = source.loop;
		return result;
	}
	/**
	 * @param {Settings} source 
	 */
	static export(source) {
		const result = (/** @type {SettingsNotation} */ ({}));
		result.FFTSize = source.FFTSize;
		result.type = source.type;
		result.highlightCycleTime = source.highlightCycleTime;
		result.gapPercentage = source.gapPercentage;
		result.loop = source.loop;
		return result;
	}
	/** @type {Number} */ static #minHighlightCycleTime = 1;
	/** @readonly */ static get minHighlightCycleTime() {
		return this.#minHighlightCycleTime;
	}
	/** @type {Number} */ static #maxHighlightCycleTime = 20;
	/** @readonly */ static get maxHighlightCycleTime() {
		return this.#maxHighlightCycleTime;
	}
	/** @type {Number} */ static #minGapPercentage = 0;
	/** @readonly */ static get minGapPercentage() {
		return this.#minGapPercentage;
	}
	/** @type {Number} */ static #maxGapPercentage = 1;
	/** @readonly */ static get maxGapPercentage() {
		return this.#maxGapPercentage;
	}
	constructor() {
		this.FFTSize = FFTSize.x512;
		this.type = VisualizerType.classic;
		this.highlightCycleTime = 10;
		this.gapPercentage = 0.25;
		this.loop = true;
	}
	FFTSize;
	type;
	/** @type {Number} */ #highlightCycleTime;
	get highlightCycleTime() {
		return this.#highlightCycleTime;
	}
	set highlightCycleTime(value) {
		if (Settings.#minHighlightCycleTime <= value && value <= Settings.#maxHighlightCycleTime) {
			this.#highlightCycleTime = value;
		} else {
			throw new RangeError(`Value ${value} is out of range. It must be from ${Settings.#minHighlightCycleTime} to ${Settings.#maxHighlightCycleTime} inclusive.`);
		}
	}
	/** @type {Number} */ #gapPercentage;
	get gapPercentage() {
		return this.#gapPercentage;
	}
	set gapPercentage(value) {
		if (Settings.#minGapPercentage <= value && value <= Settings.#maxGapPercentage) {
			this.#gapPercentage = value;
		} else {
			throw new RangeError(`Value ${value} is out of range. It must be from ${Settings.#minGapPercentage} to ${Settings.#maxGapPercentage} inclusive.`);
		}
	}
	loop;
}
//#endregion
//#region Memory
/**
 * @typedef MemoryNotation
 * @property {String} text
 * @property {String} type
 * @property {Number} time
 */
class Memory {
	/**
	 * @param {MemoryNotation} source 
	 */
	static import(source) {
		const result = new Memory();
		result.text = source.text;
		result.type = source.type;
		result.time = source.time;
		return result;
	}
	/**
	 * @param {Memory} source 
	 */
	static export(source) {
		const result = (/** @type {MemoryNotation} */ ({}));
		result.text = source.text;
		result.type = source.type;
		result.time = source.time;
		return result;
	}
	/** @type {String} */ text;
	/** @type {String} */ type;
	/** @type {Number} */ time;
}
//#endregion
//#region Metadata
/** @type {Archive<SettingsNotation>} */ const archiveSettings = new Archive(`${Application.developer}\\${Application.project}\\Settings`, Settings.export(new Settings()));
//#endregion