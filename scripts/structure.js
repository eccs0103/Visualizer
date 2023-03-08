"use strict";
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
 * @property {Boolean | undefined} loop
 * @property {FFTSize | undefined} FFTSize
 * @property {VisualizerType | undefined} type
 * @property {Number | undefined} classicHighlightCycleTime
 * @property {Number | undefined} classicGapPercentage
 * @property {Boolean | undefined} classicReflection
 */
class Settings {
	/**
	 * @param {SettingsNotation} source 
	 */
	static import(source) {
		const result = new Settings();
		if (source.loop !== undefined) result.loop = source.loop;
		if (source.FFTSize !== undefined) result.FFTSize = source.FFTSize;
		if (source.type !== undefined) result.type = source.type;
		if (source.classicHighlightCycleTime !== undefined) result.classicHighlightCycleTime = source.classicHighlightCycleTime;
		if (source.classicGapPercentage !== undefined) result.classicGapPercentage = source.classicGapPercentage;
		if (source.classicReflection !== undefined) result.classicReflection = source.classicReflection;
		return result;
	}
	/**
	 * @param {Settings} source 
	 */
	static export(source) {
		const result = (/** @type {SettingsNotation} */ ({}));
		result.loop = source.loop;
		result.FFTSize = source.FFTSize;
		result.type = source.type;
		result.classicHighlightCycleTime = source.classicHighlightCycleTime;
		result.classicGapPercentage = source.classicGapPercentage;
		result.classicReflection = source.classicReflection;
		return result;
	}
	/** @type {Number} */ static #classicMinHighlightCycleTime = 1;
	/** @readonly */ static get classicMinHighlightCycleTime() {
		return this.#classicMinHighlightCycleTime;
	}
	/** @type {Number} */ static #classicMaxHighlightCycleTime = 20;
	/** @readonly */ static get classicMaxHighlightCycleTime() {
		return this.#classicMaxHighlightCycleTime;
	}
	/** @type {Number} */ static #classicMinGapPercentage = 0;
	/** @readonly */ static get classicMinGapPercentage() {
		return this.#classicMinGapPercentage;
	}
	/** @type {Number} */ static #classicMaxGapPercentage = 1;
	/** @readonly */ static get classicMaxGapPercentage() {
		return this.#classicMaxGapPercentage;
	}
	constructor() {
		this.loop = true;
		this.FFTSize = FFTSize.x1024;
		this.type = VisualizerType.classic;
		this.classicHighlightCycleTime = 10;
		this.classicGapPercentage = 0.25;
		this.classicReflection = true;
	}
	loop;
	FFTSize;
	type;
	/** @type {Number} */ #classicHighlightCycleTime;
	get classicHighlightCycleTime() {
		return this.#classicHighlightCycleTime;
	}
	set classicHighlightCycleTime(value) {
		if (Settings.#classicMinHighlightCycleTime <= value && value <= Settings.#classicMaxHighlightCycleTime) {
			this.#classicHighlightCycleTime = value;
		} else {
			throw new RangeError(`Value ${value} is out of range. It must be from ${Settings.#classicMinHighlightCycleTime} to ${Settings.#classicMaxHighlightCycleTime} inclusive.`);
		}
	}
	/** @type {Number} */ #classicGapPercentage;
	get classicGapPercentage() {
		return this.#classicGapPercentage;
	}
	set classicGapPercentage(value) {
		if (Settings.#classicMinGapPercentage <= value && value <= Settings.#classicMaxGapPercentage) {
			this.#classicGapPercentage = value;
		} else {
			throw new RangeError(`Value ${value} is out of range. It must be from ${Settings.#classicMinGapPercentage} to ${Settings.#classicMaxGapPercentage} inclusive.`);
		}
	}
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
/** @type {Archive<SettingsNotation>} */ const archiveSettings = new Archive(`${Application.developer}\\${Application.title}\\Settings`, Settings.export(new Settings()));
//#endregion