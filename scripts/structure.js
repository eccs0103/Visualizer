// @ts-ignore
/** @typedef {import("./components/archive.js")} */
// @ts-ignore
/** @typedef {import("./components/manager.js")} */
// @ts-ignore
/** @typedef {import("./components/animator.js")} */

"use strict";

//#region Visualizer
/** @enum {String} */ const Datalist = {
	/** @readonly */ frequency: `frequency`,
	/** @readonly */ timeDomain: `timeDomain`,
};
Object.freeze(Datalist);

class Visualizer extends Animator {
	/**
	 * @param {CanvasRenderingContext2D} context 
	 * @param {HTMLMediaElement} media 
	 */
	constructor(context, media) {
		super(context);

		const audioContext = new AudioContext();
		this.#analyser = audioContext.createAnalyser();
		const source = audioContext.createMediaElementSource(media);
		source.connect(this.#analyser);
		this.#analyser.connect(audioContext.destination);
		media.addEventListener(`play`, async (event) => {
			await audioContext.resume();
		});
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
		this.addEventListener(`render`, (event) => {
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
	 * @param {Number} value 
	 * @param {Number} length default 256
	 * @returns [0 - 1]
	 */
	toFactor(value, length = 256) {
		return (value + 1) / length;
	}
	/**
	 * @param {Number} value 
	 * @param {Number} length default 256
	 * @returns [0 - 1]
	 */
	toSignedFactor(value, length = 256) {
		return (value + 1) / (length / 2) - 1;
	}
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

class VisualizationSettings {
	/**
	 * @param {any} source 
	 */
	static import(source) {
		if (typeof (source) !== `object`) {
			throw new TypeError(`Source has invalid ${typeof (source)} type`);
		}
		const quality = Reflect.get(source, `quality`);
		if (quality !== undefined && typeof (quality) !== `number`) {
			throw new TypeError(`Property quality has invalid ${typeof (quality)} type`);
		}
		const smoothing = Reflect.get(source, `smoothing`);
		if (smoothing !== undefined && typeof (smoothing) !== `number`) {
			throw new TypeError(`Property smoothing has invalid ${typeof (smoothing)} type`);
		}
		const minDecibels = Reflect.get(source, `minDecibels`);
		if (minDecibels !== undefined && typeof (minDecibels) !== `number`) {
			throw new TypeError(`Property minDecibels has invalid ${typeof (minDecibels)} type`);
		}
		const maxDecibels = Reflect.get(source, `maxDecibels`);
		if (maxDecibels !== undefined && typeof (maxDecibels) !== `number`) {
			throw new TypeError(`Property maxDecibels has invalid ${typeof (maxDecibels)} type`);
		}
		const result = new VisualizationSettings();
		if (quality !== undefined) result.quality = quality;
		if (smoothing !== undefined) result.smoothing = smoothing;
		if (minDecibels !== undefined) result.minDecibels = minDecibels;
		if (maxDecibels !== undefined) result.maxDecibels = maxDecibels;
		return result;
	}
	/**
	 * @param {VisualizationSettings} source 
	 */
	static export(source) {
		const result = (/** @type {VisualizationSettingsNotation} */ ({}));
		if (source.quality !== undefined) result.quality = source.quality;
		if (source.smoothing !== undefined) result.smoothing = source.smoothing;
		if (source.minDecibels !== undefined) result.minDecibels = source.minDecibels;
		if (source.maxDecibels !== undefined) result.maxDecibels = source.maxDecibels;
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
	reset() {
		const settings = new VisualizationSettings();
		this.quality = settings.quality;
		this.smoothing = settings.smoothing;
		this.minDecibels = settings.minDecibels;
		this.maxDecibels = settings.maxDecibels;
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
	 */
	static import(source) {
		const base = super.import(source);
		const anchor = Reflect.get(source, `anchor`);
		if (anchor !== undefined && typeof (anchor) !== `number`) {
			throw new TypeError(`Property anchor has invalid ${typeof (anchor)} type`);
		}
		const result = new SpectrogramVisualizationSettings();
		result.quality = base.quality;
		result.smoothing = base.smoothing;
		result.minDecibels = base.minDecibels;
		result.maxDecibels = base.maxDecibels;
		if (anchor !== undefined) result.anchor = anchor;
		return result;
	}
	/**
	 * @param {SpectrogramVisualizationSettings} source 
	 */
	static export(source) {
		const result = (/** @type {SpectrogramVisualizationSettingsNotation} */ ({}));
		if (source.quality !== undefined) result.quality = source.quality;
		if (source.smoothing !== undefined) result.smoothing = source.smoothing;
		if (source.minDecibels !== undefined) result.minDecibels = source.minDecibels;
		if (source.maxDecibels !== undefined) result.maxDecibels = source.maxDecibels;
		if (source.anchor !== undefined) result.anchor = source.anchor;
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
	reset() {
		super.reset();
		const settings = new SpectrogramVisualizationSettings();
		this.smoothing = settings.smoothing;
		this.anchor = settings.anchor;
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
	 */
	static import(source) {
		const base = super.import(source);
		const result = new WaveformVisualizationSettings();
		result.quality = base.quality;
		result.smoothing = base.smoothing;
		result.minDecibels = base.minDecibels;
		result.maxDecibels = base.maxDecibels;
		return result;
	}
	/**
	 * @param {WaveformVisualizationSettings} source 
	 */
	static export(source) {
		const result = (/** @type {WaveformVisualizationSettingsNotation} */ ({}));
		if (source.quality !== undefined) result.quality = source.quality;
		if (source.smoothing !== undefined) result.smoothing = source.smoothing;
		if (source.minDecibels !== undefined) result.minDecibels = source.minDecibels;
		if (source.maxDecibels !== undefined) result.maxDecibels = source.maxDecibels;
		return result;
	}
	constructor() {
		super();
		this.smoothing = 0.2;
	}
	reset() {
		super.reset();
		const settings = new WaveformVisualizationSettings();
		this.smoothing = settings.smoothing;
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

class Settings {
	/**
	 * @param {any} source 
	 */
	static import(source) {
		if (typeof (source) !== `object`) {
			throw new TypeError(`Property source has invalid ${typeof (source)} type`);
		}
		const loop = Reflect.get(source, `loop`);
		if (loop !== undefined && typeof (loop) !== `boolean`) {
			throw new TypeError(`Property loop has invalid ${typeof (loop)} type`);
		}
		const autoplay = Reflect.get(source, `autoplay`);
		if (autoplay !== undefined && typeof (autoplay) !== `boolean`) {
			throw new TypeError(`Property autoplay has invalid ${typeof (autoplay)} type`);
		}
		const information = Reflect.get(source, `information`);
		if (information !== undefined && typeof (information) !== `number`) {
			throw new TypeError(`Property information has invalid ${typeof (information)} type`);
		}
		const type = Reflect.get(source, `type`);
		if (type !== undefined && typeof (type) !== `string`) {
			throw new TypeError(`Property type has invalid ${typeof (type)} type`);
		}

		const $visualizations = Reflect.get(source, `visualizations`);
		if ($visualizations !== undefined && !($visualizations instanceof Array)) {
			throw new TypeError(`Property visualizations has invalid ${($visualizations)} type`);
		}
		const visualizations = new Map(/** @type {Array<[Visualizations, VisualizationSettings]>} */(Object.values(Visualizations).map((type, index) => {
			const visualization = $visualizations?.at(index);
			switch (type) {
				case Visualizations.spectrogram: return [type, (/** @type {VisualizationSettings} */ (visualization === undefined ? new SpectrogramVisualizationSettings() : SpectrogramVisualizationSettings.import(visualization)))];
				case Visualizations.waveform: return [type, (/** @type {VisualizationSettings} */ (visualization === undefined ? new WaveformVisualizationSettings() : WaveformVisualizationSettings.import(visualization)))];
				default: throw new TypeError(`Invalid type ${type}`);
			}
		})));
		const result = new Settings();
		if (loop !== undefined) result.loop = loop;
		if (autoplay !== undefined) result.autoplay = autoplay;
		if (information !== undefined) result.information = information;
		if (type !== undefined) result.type = type;
		result.#visualizations = visualizations;
		return result;
	}
	/**
	 * @param {Settings} source 
	 */
	static export(source) {
		const result = (/** @type {SettingsNotation} */ ({}));
		if (source.loop !== undefined) result.loop = source.loop;
		if (source.autoplay !== undefined) result.autoplay = source.autoplay;
		if (source.information !== undefined) result.information = source.information;
		if (source.type !== undefined) result.type = source.type;
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
			throw new ReferenceError(`Settings are not defined for visualization ${this.visualization}`);
		}
		return result;
	}
	reset() {
		const settings = new Settings();
		this.loop = settings.loop;
		this.autoplay = settings.autoplay;
		this.information = settings.information;
		this.type = settings.type;
		for (const [, visualization] of this.#visualizations) {
			visualization.reset();
		}
	}
}
//#endregion
//#region Metadata
const metaAuthor = document.querySelector(`meta[name="author"]`);
if (!(metaAuthor instanceof HTMLMetaElement)) {
	throw new TypeError(`Invalid element: ${metaAuthor}`);
}
const developer = metaAuthor.content;

const metaApplicationName = document.querySelector(`meta[name="application-name"]`);
if (!(metaApplicationName instanceof HTMLMetaElement)) {
	throw new TypeError(`Invalid element: ${metaApplicationName}`);
}
const title = metaApplicationName.content;

const search = Manager.getSearch();
const reset = search.get(`reset`);
if (reset !== undefined) {
	if (reset === `all`) {
		for (let index = 0; index < localStorage.length; index++) {
			const value = localStorage.key(index);
			if (value === null) {
				throw new RangeError(`Index out of range`);
			}
			localStorage.removeItem(value);
		}
	} else {
		localStorage.removeItem(reset);
	}
}

/** @type {Archive<SettingsNotation>} */ const archiveSettings = new Archive(`${developer}.${title}.Settings`, Settings.export(new Settings()));
// /** @type {Database<Blob>} */ const databasePlaylist = new Database(`${developer}.${title}.Playlist`);

const settings = Settings.import((() => {
	// const protocol = search.get(`protocol`);
	// if (protocol === undefined) {
	return archiveSettings.data;
	// } else {
	// 	const keys = Object.keys(Settings.export(new Settings()));
	// 	const values = protocol.split(`-`, keys.length);
	// 	return JSON.parse(`{ ${keys.map((key, index) => `"${key}": ${values[index]}`).join(`, `)} }`);
	// }
})());
const theme = search.get(`theme`);
if (theme !== undefined && Settings.themes.includes(theme)) {
	document.documentElement.dataset[`theme`] = theme;
}
//#endregion
