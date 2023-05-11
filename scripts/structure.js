// @ts-ignore
/** @typedef {import("./modules/archive")} */
// @ts-ignore
/** @typedef {import("./modules/application")} */

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
	/** @readonly */ waveform: `waveform`,
	/** @readonly */ pulsar: `pulsar`,
};
/**
 * @typedef SettingsNotation
 * @property {Boolean | undefined} loop
 * @property {FFTSize | undefined} FFTSize
 * @property {VisualizerType | undefined} type
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
		return result;
	}
	constructor() {
		this.loop = true;
		this.FFTSize = FFTSize.x1024;
		this.type = VisualizerType.waveform;
	}
	loop;
	/** @type {FFTSize} */ #FFTSize;
	get FFTSize() {
		return this.#FFTSize;
	}
	set FFTSize(value) {
		if (Object.values(FFTSize).includes(value)) {
			this.#FFTSize = value;
		} else throw new TypeError(`Invalid FFT size: '${value}'.`);
	}
	/** @type {VisualizerType} */ #type;
	get type() {
		return this.#type;
	}
	set type(value) {
		if (Object.values(VisualizerType).includes(value)) {
			this.#type = value;
		} else throw new TypeError(`Invalid visualizer type: '${value}'.`);
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
archiveSettings.change((data) => {
	if (data.type == `classic`) {
		data.type = VisualizerType.waveform;
	}
	return data;
});
let settings = Settings.import(archiveSettings.data);
const theme = Application.search.get(`theme`);
switch (theme) {
	case `light`: {
		document.documentElement.dataset[`theme`] = theme;
	} break;
}
//#endregion