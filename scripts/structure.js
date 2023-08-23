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
		this.#arrayFrequencyData = new Uint8Array(this.length);
		this.#arrayTimeDomainData = new Uint8Array(this.length);
		this.#volumeFrequency = 0;
		this.#volumeTimeDomain = 0;

		this.addEventListener(`render`, (event) => {
			this.#analyser.getByteFrequencyData(this.#arrayFrequencyData);
			this.#analyser.getByteTimeDomainData(this.#arrayTimeDomainData);
			let summaryFrequency = 0, summaryTimeDomain = 0;
			let summarySquareFrequency = 0, summarySquareTimeDomain = 0;
			for (let index = 0; index < this.length; index++) {
				const dataFrequency = this.#arrayFrequencyData[index] / 255, dataTimeDomain = this.#arrayTimeDomainData[index] / 128 - 1;
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
/** @enum {String} */ const Visualizations = {
	/** @readonly */ spectrogram: `spectrogram`,
	/** @readonly */ waveform: `waveform`,
};
Object.freeze(Visualizations);

/**
 * @typedef SettingsNotation
 * @property {Boolean} [loop]
 * @property {Number | undefined} [quality]
 * @property {Visualizations} [type]
 * @property {Boolean} [autoplay]
 */

class Settings {
	/**
	 * @param {any} source 
	 */
	static import(source) {
		const result = new Settings();
		const loop = Reflect.get(source, `loop`);
		if (loop !== undefined) {
			if (typeof (loop) !== `boolean`) {
				throw new TypeError(`Source 'loop' property must be 'Boolean' type.`);
			}
			result.loop = loop;
		}
		const quality = Reflect.get(source, `quality`);
		if (quality !== undefined) {
			if (typeof (quality) !== `number`) {
				throw new TypeError(`Source 'quality' property must be 'Number' type.`);
			}
			result.quality = quality;
		}
		const type = Reflect.get(source, `type`);
		if (type !== undefined) {
			if (typeof (type) !== `string`) {
				throw new TypeError(`Source 'type' property must be 'Visualization' type.`);
			}
			result.type = type;
		}
		const autoplay = Reflect.get(source, `autoplay`);
		if (autoplay !== undefined) {
			if (typeof (autoplay) !== `boolean`) {
				throw new TypeError(`Source 'autoplay' property must be 'Boolean' type.`);
			}
			result.autoplay = autoplay;
		}
		return result;
	}
	/**
	 * @param {Settings} source 
	 */
	static export(source) {
		const result = (/** @type {SettingsNotation} */ ({}));
		result.loop = source.loop;
		result.quality = source.quality;
		result.type = source.type;
		result.autoplay = source.autoplay;
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
	/** @type {Boolean} */ #loop = true;
	get loop() {
		return this.#loop;
	}
	set loop(value) {
		this.#loop = value;
	}
	/** @type {Number} */ #quality = 10;
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
	/** @type {Visualizations} */ #type = Visualizations.spectrogram;
	get type() {
		return this.#type;
	}
	set type(value) {
		if (Object.values(Visualizations).includes(value)) {
			this.#type = value;
		} else throw new TypeError(`Invalid visualization: '${value}'.`);
	}
	/** @type {Boolean} */ #autoplay = true;
	get autoplay() {
		return this.#autoplay;
	}
	set autoplay(value) {
		this.#autoplay = value;
	}
	reset() {
		const settings = new Settings();
		this.loop = settings.loop;
		this.quality = settings.quality;
		this.type = settings.type;
		this.autoplay = settings.autoplay;
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

/** @type {Archive<SettingsNotation>} */ const archiveSettings = new Archive(`${developer}.${title}.Settings`, Settings.export(new Settings()));
// /** @type {Database<Blob>} */ const databasePlaylist = new Database(`${developer}.${title}.Playlist`);

const search = Manager.getSearch();
const settings = Settings.import((() => {
	const protocol = search.get(`protocol`);
	if (protocol === undefined) {
		return archiveSettings.data;
	} else {
		const keys = Object.keys(Settings.export(new Settings()));
		const values = protocol.split(`-`, keys.length);
		return JSON.parse(`{ ${keys.map((key, index) => `"${key}": ${values[index]}`).join(`, `)} }`);
	}
})());
const theme = search.get(`theme`);
switch (theme) {
	case `light`: {
		document.documentElement.dataset[`theme`] = theme;
	} break;
}
//#endregion
