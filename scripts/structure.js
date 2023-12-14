"use strict";

import {
	NotationProgenitor,
	NotationContainer
} from "./modules/storage.js";
import { } from "./modules/extensions.js";
import {
	Display
} from "./modules/executors.js";
import {
	Locker
} from "./modules/database.js";

//#region Visualizer
/** @enum {String} */ const Datalist = {
	/** @readonly */ frequency: `frequency`,
	/** @readonly */ timeDomain: `timeDomain`,
};
Object.freeze(Datalist);

class Visualizer extends Display {
	/**
	 * @param {CanvasRenderingContext2D} context 
	 * @param {HTMLMediaElement} media 
	 */
	constructor(context, media) {
		super(context);

		const audioContext = new AudioContext();
		//
		this.#analyser = audioContext.createAnalyser();
		const source = audioContext.createMediaElementSource(media);
		source.connect(this.#analyser);
		this.#analyser.connect(audioContext.destination);
		//
		this.#analyser.fftSize = Math.pow(2, 10);
		this.#analyser.smoothingTimeConstant = 0;
		this.#analyser.minDecibels = -80;
		this.#analyser.maxDecibels = -40;
		this.#arrayFrequencyData = new Uint8Array(this.length);
		this.#arrayTimeDomainData = new Uint8Array(this.length);
		this.#volumeFrequency = 0;
		this.#volumeTimeDomain = 0;
		//
		this.addEventListener(`update`, (event) => {
			this.#analyser.getByteFrequencyData(this.#arrayFrequencyData);
			this.#analyser.getByteTimeDomainData(this.#arrayTimeDomainData);
			let summaryFrequency = 0, summaryTimeDomain = 0, summarySquareFrequency = 0, summarySquareTimeDomain = 0;
			for (let index = 0; index < this.length; index++) {
				const dataFrequency = this.#arrayFrequencyData[index], dataTimeDomain = this.#arrayTimeDomainData[index];
				summaryFrequency += dataFrequency;
				summaryTimeDomain += dataTimeDomain;
				summarySquareTimeDomain += dataTimeDomain * dataTimeDomain;
				summarySquareFrequency += dataFrequency * dataFrequency;
			}
			this.#volumeFrequency = (summaryFrequency / this.length);
			this.#volumeTimeDomain = (summaryTimeDomain / this.length);
			this.#amplitudeFrequency = Math.sqrt(summarySquareFrequency / this.length);
			this.#amplitudeTimeDomain = Math.sqrt(summarySquareTimeDomain / this.length);
		});
	}
	/** @type {AnalyserNode} */ #analyser;
	/** @readonly */ get length() {
		return this.#analyser.frequencyBinCount;
	}
	get quality() {
		return Math.log2(this.#analyser.fftSize);
	}
	set quality(value) {
		this.#analyser.fftSize = Math.pow(2, value);
		this.#arrayFrequencyData = new Uint8Array(this.length);
		this.#arrayTimeDomainData = new Uint8Array(this.length);
	}
	get smoothing() {
		return this.#analyser.smoothingTimeConstant;
	}
	set smoothing(value) {
		this.#analyser.smoothingTimeConstant = value;
	}
	get minDecibels() {
		return this.#analyser.minDecibels;
	}
	set minDecibels(value) {
		this.#analyser.minDecibels = value;
	}
	get maxDecibels() {
		return this.#analyser.maxDecibels;
	}
	set maxDecibels(value) {
		this.#analyser.maxDecibels = value;
	}
	/** @type {Uint8Array} */ #arrayFrequencyData;
	/** @type {Uint8Array} */ #arrayTimeDomainData;
	/**
	 * @param {Datalist} type 
	 */
	getData(type) {
		switch (type) {
			case Datalist.frequency: return this.#arrayFrequencyData;
			case Datalist.timeDomain: return this.#arrayTimeDomainData;
			default: throw new TypeError(`Invalid data type: '${type}'.`);
		}
	}
	/** @type {Number} */ #volumeFrequency;
	/** @type {Number} */ #volumeTimeDomain;
	/**
	 * @param {Datalist} type 
	 */
	getVolume(type) {
		switch (type) {
			case Datalist.frequency: return this.#volumeFrequency;
			case Datalist.timeDomain: return this.#volumeTimeDomain;
			default: throw new TypeError(`Invalid data type: '${type}'.`);
		}
	}
	/** @type {Number} */ #amplitudeFrequency;
	/** @type {Number} */ #amplitudeTimeDomain;
	/**
	 * @param {Datalist} type 
	 */
	getAmplitude(type) {
		switch (type) {
			case Datalist.frequency: return this.#amplitudeFrequency;
			case Datalist.timeDomain: return this.#amplitudeTimeDomain;
			default: throw new TypeError(`Invalid data type: '${type}'.`);
		}
	}
	/**
	 * Not perfect filter
	 */
	isBeat() {
		return (this.#amplitudeTimeDomain > this.#volumeFrequency);
	}
}
//#endregion
//#region Settings
/**
 * @typedef VisualizationSettingsNotation
 * @property {Number} [quality]
 * @property {Number} [smoothing]
 * @property {Number} [minDecibels]
 * @property {Number} [maxDecibels]
 */

class VisualizationSettings extends NotationProgenitor {
	/**
	 * @param {any} source 
	 * @returns {VisualizationSettings}
	 */
	static import(source) {
		const result = new VisualizationSettings();
		if (!(typeof (source) === `object`)) {
			throw new TypeError(`Source has invalid ${typeof (source)} type`);
		}
		const quality = Reflect.get(source, `quality`);
		if (quality !== undefined) {
			if (!(typeof (quality) === `number`)) {
				throw new TypeError(`Property quality has invalid ${typeof (quality)} type`);
			}
			result.quality = quality;
		}
		const smoothing = Reflect.get(source, `smoothing`);
		if (smoothing !== undefined) {
			if (!(typeof (smoothing) === `number`)) {
				throw new TypeError(`Property smoothing has invalid ${typeof (smoothing)} type`);
			}
			result.smoothing = smoothing;
		}
		const minDecibels = Reflect.get(source, `minDecibels`);
		if (minDecibels !== undefined) {
			if (!(typeof (minDecibels) === `number`)) {
				throw new TypeError(`Property minDecibels has invalid ${typeof (minDecibels)} type`);
			}
			result.minDecibels = minDecibels;
		}
		const maxDecibels = Reflect.get(source, `maxDecibels`);
		if (maxDecibels !== undefined) {
			if (!(typeof (maxDecibels) === `number`)) {
				throw new TypeError(`Property maxDecibels has invalid ${typeof (maxDecibels)} type`);
			}
			result.maxDecibels = maxDecibels;
		}
		return result;
	}
	/**
	 * @param {VisualizationSettings} source 
	 * @returns {VisualizationSettingsNotation}
	 */
	static export(source) {
		const result = (/** @type {VisualizationSettingsNotation} */ ({}));
		result.quality = source.quality;
		result.smoothing = source.smoothing;
		result.minDecibels = source.minDecibels;
		result.maxDecibels = source.maxDecibels;
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
	/** @type {Number} */ #quality = 10;
	get quality() {
		return this.#quality;
	}
	set quality(value) {
		if (VisualizationSettings.minQuality <= value && value <= VisualizationSettings.maxQuality) {
			this.#quality = value;
		} else throw new RangeError(`Value ${value} out of range [${VisualizationSettings.minQuality} - ${VisualizationSettings.maxQuality}]`);
	}
	/** @type {Number} */ #smoothing = 0.5;
	get smoothing() {
		return this.#smoothing;
	}
	set smoothing(value) {
		if (0 <= value && value <= 1) {
			this.#smoothing = value;
		} else throw new RangeError(`Value ${value} out of range [0 - 1]`);
	}
	/** @type {Number} */ #minDecibels = -100;
	get minDecibels() {
		return this.#minDecibels;
	}
	set minDecibels(value) {
		if (value < this.maxDecibels) {
			this.#minDecibels = value;
		} else throw new RangeError(`Value ${value} is greater or equal than max decibels`);
	}
	/** @type {Number} */ #maxDecibels = -30;
	get maxDecibels() {
		return this.#maxDecibels;
	}
	set maxDecibels(value) {
		if (this.minDecibels < value) {
			this.#maxDecibels = value;
		} else throw new RangeError(`Value ${value} is less or equal than min decibels`);
	}
}

/**
 * @typedef __SpectrogramVisualizationSettingsNotation__
 * @property {Number} [anchor]
 * 
 * @typedef {VisualizationSettingsNotation & __SpectrogramVisualizationSettingsNotation__} SpectrogramVisualizationSettingsNotation
 */

class SpectrogramVisualizationSettings extends VisualizationSettings {
	/**
	 * @param {any} source 
	 * @returns {SpectrogramVisualizationSettings}
	 */
	static import(source) {
		const result = new SpectrogramVisualizationSettings();
		const base = super.import(source);
		if (!(typeof (source) === `object`)) {
			throw new TypeError(`Source has invalid ${typeof (source)} type`);
		}
		result.quality = base.quality;
		result.smoothing = base.smoothing;
		result.minDecibels = base.minDecibels;
		result.maxDecibels = base.maxDecibels;
		const anchor = Reflect.get(source, `anchor`);
		if (anchor !== undefined) {
			if (!(typeof (anchor) === `number`)) {
				throw new TypeError(`Property anchor has invalid ${typeof (anchor)} type`);
			}
			result.anchor = anchor;
		}
		return result;
	}
	/**
	 * @param {SpectrogramVisualizationSettings} source 
	 * @returns {SpectrogramVisualizationSettingsNotation}
	 */
	static export(source) {
		const result = (/** @type {SpectrogramVisualizationSettingsNotation} */ (super.export(source)));
		result.anchor = source.anchor;
		return result;
	}
	constructor() {
		super();
		this.smoothing = 0.8;
	}
	/** @type {Number} */ #anchor = 0.8;
	get anchor() {
		return this.#anchor;
	}
	set anchor(value) {
		if (0 <= value && value <= 1) {
			this.#anchor = value;
		} else throw new RangeError(`Value ${value} out of range [0 - 1]`);
	}
}

/**
 * @typedef {{}} __WaveformVisualizationSettingsNotation__
 * 
 * @typedef {VisualizationSettingsNotation & __WaveformVisualizationSettingsNotation__} WaveformVisualizationSettingsNotation
 */

class WaveformVisualizationSettings extends VisualizationSettings {
	/**
	 * @param {any} source 
	 * @returns {WaveformVisualizationSettings}
	 */
	static import(source) {
		const result = new WaveformVisualizationSettings();
		const base = super.import(source);
		if (!(typeof (source) === `object`)) {
			throw new TypeError(`Source has invalid ${typeof (source)} type`);
		}
		result.quality = base.quality;
		result.smoothing = base.smoothing;
		result.minDecibels = base.minDecibels;
		result.maxDecibels = base.maxDecibels;
		return result;
	}
	/**
	 * @param {WaveformVisualizationSettings} source 
	 * @returns {WaveformVisualizationSettingsNotation}
	 */
	static export(source) {
		const result = (/** @type {WaveformVisualizationSettingsNotation} */ (super.export(source)));
		return result;
	}
	constructor() {
		super();
		this.smoothing = 0.2;
	}
}

/**
 * @typedef SettingsNotation
 * @property {Boolean} [loop]
 * @property {Boolean} [autoplay]
 * @property {Number} [information]
 * @property {Visualizations} [type]
 * @property {Array<VisualizationSettingsNotation>} [visualizations]
 */

/** @enum {String} */ const Visualizations = {
	/** @readonly */ spectrogram: `spectrogram`,
	/** @readonly */ waveform: `waveform`,
};
Object.freeze(Visualizations);

class Settings extends NotationProgenitor {
	/**
	 * @param {any} source 
	 * @returns {Settings}
	 */
	static import(source) {
		const result = new Settings();
		if (!(typeof (source) === `object`)) {
			throw new TypeError(`Source has invalid ${typeof (source)} type`);
		}
		const loop = Reflect.get(source, `loop`);
		if (loop !== undefined) {
			if (!(typeof (loop) === `boolean`)) {
				throw new TypeError(`Property loop has invalid ${typeof (loop)} type`);
			}
			result.loop = loop;
		}
		const autoplay = Reflect.get(source, `autoplay`);
		if (autoplay !== undefined) {
			if (!(typeof (autoplay) === `boolean`)) {
				throw new TypeError(`Property autoplay has invalid ${typeof (autoplay)} type`);
			}
			result.autoplay = autoplay;
		}
		const information = Reflect.get(source, `information`);
		if (information !== undefined) {
			if (!(typeof (information) === `number`)) {
				throw new TypeError(`Property information has invalid ${typeof (information)} type`);
			}
			result.information = information;
		}
		const type = Reflect.get(source, `type`);
		if (type !== undefined) {
			if (!(typeof (type) === `string`)) {
				throw new TypeError(`Property type has invalid ${typeof (type)} type`);
			}
			result.type = type;
		}
		const visualizations = Reflect.get(source, `visualizations`);
		if (visualizations !== undefined) {
			if (!(visualizations instanceof Array)) {
				throw new TypeError(`Property visualizations has invalid ${(visualizations)} type`);
			}
			result.#visualizations = new Map(/** @type {Array<[Visualizations, VisualizationSettings]>} */(Object.values(Visualizations).map((type, index) => {
				const visualization = visualizations.at(index);
				switch (type) {
					case Visualizations.spectrogram: return [type, (/** @type {VisualizationSettings} */ (visualization === undefined ? new SpectrogramVisualizationSettings() : SpectrogramVisualizationSettings.import(visualization)))];
					case Visualizations.waveform: return [type, (/** @type {VisualizationSettings} */ (visualization === undefined ? new WaveformVisualizationSettings() : WaveformVisualizationSettings.import(visualization)))];
					default: throw new TypeError(`Invalid type ${type}`);
				}
			})));
		}
		return result;
	}
	/**
	 * @param {Settings} source 
	 * @returns {SettingsNotation}
	 */
	static export(source) {
		const result = (/** @type {SettingsNotation} */ ({}));
		result.loop = source.loop;
		result.autoplay = source.autoplay;
		result.information = source.information;
		result.type = source.type;
		result.visualizations = Array.from(source.#visualizations).map(([type, visualization]) => {
			if (visualization instanceof SpectrogramVisualizationSettings) {
				return SpectrogramVisualizationSettings.export(visualization);
			} else if (visualization instanceof WaveformVisualizationSettings) {
				return WaveformVisualizationSettings.export(visualization);
			} else throw new TypeError(`Invalid type ${type}`);
		});
		return result;
	}
	/** @type {Array<String>} */ static #themes = [`system`, `light`, `dark`];
	/** @readonly */ static get themes() {
		return this.#themes;
	}
	/** @type {Boolean} */ #loop = true;
	get loop() {
		return this.#loop;
	}
	set loop(value) {
		this.#loop = value;
	}
	/** @type {Boolean} */ #autoplay = true;
	get autoplay() {
		return this.#autoplay;
	}
	set autoplay(value) {
		this.#autoplay = value;
	}
	/** @type {Number} */ #information = 6;
	get information() {
		return this.#information;
	}
	set information(value) {
		if (value < 0) {
			throw new RangeError(`Value out of range [0 - +∞)`);
		}
		this.#information = value;
	}
	/** @type {Visualizations} */ #type = Visualizations.spectrogram;
	get type() {
		return this.#type;
	}
	set type(value) {
		if (Object.values(Visualizations).includes(value)) {
			this.#type = value;
		} else throw new ReferenceError(`Invalid value ${value}`);
	}
	/** @type {Map<Visualizations, VisualizationSettings>} */ #visualizations = new Map([
		[Visualizations.spectrogram, new SpectrogramVisualizationSettings()],
		[Visualizations.waveform, new WaveformVisualizationSettings()],
	]);
	/** @readonly */ get visualization() {
		const result = this.#visualizations.get(this.type);
		if (result === undefined) {
			throw new ReferenceError(`Settings are not defined for visualization ${this.type}`);
		}
		return result;
	}
}
//#endregion
//#region Metadata
const developer = document.getElement(HTMLMetaElement, `meta[name="author"]`).content;
const title = document.getElement(HTMLMetaElement, `meta[name="application-name"]`).content;
const containerSettings = new NotationContainer(Settings, `${developer}.${title}.Settings`);
/** @type {Locker<File[]>} */ const lockerPlaylist = new Locker(developer, title, `Playlist`);
const search = location.getSearchMap();
const theme = search.get(`theme`);
if (theme !== undefined && Settings.themes.includes(theme)) {
	document.documentElement.dataset[`theme`] = theme;
}
const reset = search.get(`reset`);
switch (reset) {
	case `settings`: {
		containerSettings.reset();
	}
	default: break;
}
const settings = containerSettings.content;
//#endregion

export {
	Datalist,
	Visualizer,
	Visualizations,
	VisualizationSettings,
	SpectrogramVisualizationSettings,
	WaveformVisualizationSettings,
	Settings,
	containerSettings,
	lockerPlaylist,
	search,
	settings,
};