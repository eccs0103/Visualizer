// @ts-ignore
/** @typedef {import("./modules/archive.js")} */
// @ts-ignore
/** @typedef {import("./modules/application.js")} */
// @ts-ignore
/** @typedef {import("./modules/engine.js")} */
// @ts-ignore
/** @typedef {import("./modules/animator.js")} */

"use strict";

//#region Visualizer
/**
 * @callback VisualizerHandler
 * @param {CanvasRenderingContext2D} context
 * @returns {void}
 */

class Visualizer extends Animator {
	/**
	 * @param {HTMLCanvasElement} canvas 
	 */
	constructor(canvas) {
		super(canvas);
		this.#audioContext = new AudioContext();
		this.#analyser = this.#audioContext.createAnalyser();
		this.#analyser.fftSize = Math.pow(2, 10);
		this.#arrayFrequencyData = new Uint8Array(this.#analyser.frequencyBinCount);
		this.#arrayTimeDomainData = new Uint8Array(this.#analyser.frequencyBinCount);
	}
	#audioContext;
	/** @type {AnalyserNode} */ #analyser;
	/** @readonly */ get analyser() {
		return this.#analyser;
	}
	get quality() {
		return Math.log2(this.#analyser.fftSize);
	}
	set quality(value) {
		this.#analyser.fftSize = Math.pow(2, value);
		this.#arrayFrequencyData = new Uint8Array(this.#analyser.frequencyBinCount);
		this.#arrayTimeDomainData = new Uint8Array(this.#analyser.frequencyBinCount);
	}
	/** @type {Uint8Array} */ #arrayFrequencyData;
	/** @readonly */ get arrayFrequencyData() {
		return this.#arrayFrequencyData;
	}
	/** @type {Uint8Array} */ #arrayTimeDomainData;
	/** @readonly */ get arrayTimeDomainData() {
		return this.#arrayTimeDomainData;
	}
	/** @type {MediaElementAudioSourceNode | undefined} */ #source;
	/**
	 * @param {HTMLMediaElement} media 
	 */
	connect(media) {
		this.#source = this.#audioContext.createMediaElementSource(media);
		this.#source.connect(this.#analyser);
		this.#analyser.connect(this.#audioContext.destination);
		media.addEventListener(`play`, (event) => {
			this.launched = true;
			this.#audioContext.resume();
		});
		media.addEventListener(`pause`, (event) => {
			this.launched = false;
		});
	}
	disconnect() {
		this.#analyser.disconnect();
		if (this.#source) {
			this.#source.disconnect();
			this.#source = undefined;
		}
	}
	/**
	 * @param {VisualizerHandler} handler 
	 */
	renderer(handler) {
		this.#analyser.getByteFrequencyData(this.#arrayFrequencyData);
		this.#analyser.getByteTimeDomainData(this.#arrayTimeDomainData);
		super.renderer(handler);
	}
	isBeat() {
		// Вычисляем амплитуду звука
		let summary = 0;
		for (let index = 0; index < length; index++) {
			const value = this.#arrayTimeDomainData[index] / 128 - 1; // Нормализуем значения от -1 до 1
			summary += value * value; // Суммируем квадраты значений
		}
		const amplitude = Math.sqrt(summary / length); // Вычисляем среднеквадратическое значение

		// Определяем порог для срабатывания бита
		const threshold = 0.5; // Подберите подходящий порог для вашего аудио

		// Проверяем, превышает ли амплитуда пороговое значение
		return (amplitude > threshold);
	}
}
//#endregion
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