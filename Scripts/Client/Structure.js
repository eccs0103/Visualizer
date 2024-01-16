"use strict";

import { NotationContainer, NotationProgenitor } from "./Modules/Storage.js";
import { } from "./Modules/Extensions.js";
import { Locker } from "./Modules/Database.js";

const { log2, sqrt } = Math;

//#region Metadata
const developer = document.getElement(HTMLMetaElement, `meta[name="author"]`).content;
const title = document.getElement(HTMLMetaElement, `meta[name="application-name"]`).content;
//#endregion
//#region Settings
/** @enum {string} */ const Visualization = {
	/** @readonly @deprecated */ spectrogram: `spectrogram`,
	/** @readonly @deprecated */ waveform: `waveform`,
	/** @readonly */ pulsar: `pulsar`,
};
Object.freeze(Visualization);

/**
 * @typedef SettingsNotation
 * @property {Visualization} [visualization]
 */

class Settings extends NotationProgenitor {
	/**
	 * @param {SettingsNotation} source 
	 * @returns {Settings}
	 */
	static import(source) {
		const result = new Settings();
		if (source.visualization !== undefined) result.#visualization = source.visualization;
		return result;
	}
	/**
	 * @param {Settings} source 
	 * @returns {SettingsNotation}
	 */
	static export(source) {
		const result = (/** @type {SettingsNotation} */ ({}));
		result.visualization = source.visualization;
		return result;
	}
	/** @type {Visualization} */ #visualization = Visualization.pulsar;
	get visualization() {
		return this.#visualization;
	}
	set visualization(value) {
		this.#visualization = value;
	}
}
//#endregion

const containerSettings = new NotationContainer(Settings, `${developer}.${title}.Settings`);
const settings = containerSettings.content;

switch (settings.visualization) {
	case Visualization.spectrogram:
	case Visualization.waveform: {
		settings.visualization = Visualization.pulsar;
	} break;
}

/** @type {Locker<File[]>} */ const lockerPlaylist = new Locker(developer, title, `Playlist`);
const playlist = await lockerPlaylist.get() ?? [];
window.addEventListener(`beforeunload`, (event) => {
	lockerPlaylist.set(playlist);
});

//#region Visualizer
/** @enum {string} */ const DataTypes = {
		/** @readonly */ frequency: `frequency`,
		/** @readonly */ timeDomain: `timeDomain`,
};
Object.freeze(DataTypes);

class Visualizer extends EventTarget {
	/**
	 * @param {HTMLMediaElement} mediaElement 
	 */
	constructor(mediaElement) {
		super();

		this.#audioContext = new AudioContext();
		this.#source = this.#audioContext.createMediaElementSource(mediaElement);
		this.#analyser = this.#audioContext.createAnalyser();
		this.#data = new Map(Object.values(DataTypes).map(type => [type, new Uint8Array(this.length)]));
		this.#volume = new Map(Object.values(DataTypes).map(type => [type, 0]));
		this.#amplitude = new Map(Object.values(DataTypes).map(type => [type, 0]));

		this.#source.connect(this.#analyser);
		this.#analyser.connect(this.#audioContext.destination);

		this.addEventListener(`update`, (event) => {
			for (const [type, data] of this.#data) {
				if (mediaElement.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
					switch (type) {
						case DataTypes.frequency: {
							this.#analyser.getByteFrequencyData(data);
						} break;
						case DataTypes.timeDomain: {
							this.#analyser.getByteTimeDomainData(data);
						} break;
						default: throw new TypeError(`Invalid data ${type} type`);
					}
				} else {
					data.fill(0);
				}
				let summary = 0, summarySquare = 0;
				for (let index = 0; index < this.length; index++) {
					const datul = data[index];
					summary += datul;
					summarySquare += datul * datul;
				}
				this.#volume.set(type, summary / this.length);
				this.#amplitude.set(type, sqrt(summarySquare / this.length));
			}
		});
	}
	/** @type {AudioContext} */ #audioContext;
	/** @type {MediaElementAudioSourceNode} */ #source;
	/** @type {AnalyserNode} */ #analyser;
	/** @readonly */ get length() {
		return this.#analyser.frequencyBinCount;
	}
	/** @type {Map<string, Uint8Array>} */ #data;
	/**
	 * @param {DataTypes} type 
	 * @returns {Uint8Array}
	 */
	getData(type) {
		return this.#data.get(type) ?? (() => {
			throw new TypeError(`Invalid data ${type} type`);
		})();
	}
	/** @type {Map<string, number>} */ #volume;
	/**
	 * @param {DataTypes} type 
	 * @returns {number}
	 */
	getVolume(type) {
		return this.#volume.get(type) ?? (() => {
			throw new TypeError(`Invalid data ${type} type`);
		})();
	}
	/** @type {Map<string, number>} */ #amplitude;
	/**
	 * @param {DataTypes} type 
	 * @returns {number}
	 */
	getAmplitude(type) {
		return this.#amplitude.get(type) ?? (() => {
			throw new TypeError(`Invalid data ${type} type`);
		})();
	}
	get quality() {
		return log2(this.#analyser.fftSize);
	}
	set quality(value) {
		if (5 <= value && value <= 15) {
			this.#analyser.fftSize = (1 << value);
			this.#data = new Map(Object.values(DataTypes).map(type => [type, new Uint8Array(this.length)]));
		} else throw new RangeError(`Quality ${this.quality} out of range [5 - 15]`);
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
}
//#endregion

export { Visualization, Settings, containerSettings, settings, playlist, DataTypes, Visualizer };