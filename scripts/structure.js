// @ts-ignore
/** @typedef {import("./modules/archive")} */
// @ts-ignore
/** @typedef {import("./modules/application")} */

"use strict";

//#region Settings
/** @enum {String} */ const VisualizerType = {
	/** @readonly */ spectrogram: `spectrogram`,
	/** @readonly */ waveform: `waveform`,
};
/**
 * @typedef SettingsNotation
 * @property {Boolean | undefined} loop
 * @property {Number | undefined} quality
 * @property {VisualizerType | undefined} type
 */
class Settings {
	/**
	 * @param {SettingsNotation} source 
	 */
	static import(source) {
		const result = new Settings();
		if (source.loop !== undefined) result.loop = source.loop;
		if (source.quality !== undefined) result.#quality = source.quality;
		if (source.type !== undefined) result.type = source.type;
		return result;
	}
	/**
	 * @param {Settings} source 
	 */
	static export(source) {
		const result = (/** @type {SettingsNotation} */ ({}));
		result.loop = source.loop;
		result.quality = source.#quality;
		result.type = source.#type;
		return result;
	}
	/** @type {Number} */ static #minQuality = 5;
	/** @readonly */ static get minQuality() {
		return this.#minQuality;
	}
	/** @type {Number} */ static #maxQuality = 15;
	/** @readonly */ static get maxQuality() {
		return this.#maxQuality;
	}
	constructor() {
		this.loop = true;
		this.quality = 10;
		this.type = VisualizerType.spectrogram;
	}
	loop;
	/** @type {Number} */ #quality;
	get quality() {
		return this.#quality;
	}
	set quality(value) {
		if (Math.floor(value) !== value) {
			throw new TypeError(`Value of 'quality' property must be integer number.`);
		}
		if (Settings.minQuality > value || value > Settings.maxQuality) {
			throw new TypeError(`Value of 'quality' property must between ${Settings.minQuality} and ${Settings.maxQuality} including.`);
		}
		this.#quality = value;
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
	switch (data.type) {
		case `classic`: {
			data.type = VisualizerType.spectrogram;
		} break;
		case `pulsar`: {
			data.type = VisualizerType.waveform;
		} break;
	}
	const fftSize = data[`FFTSize`];
	if (fftSize !== undefined) {
		data.quality = Math.log2(fftSize);
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