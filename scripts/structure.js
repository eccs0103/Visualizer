// @ts-ignore
/** @typedef {import("./modules/archive.js")} */
// @ts-ignore
/** @typedef {import("./modules/database.js")} */
// @ts-ignore
/** @typedef {import("./modules/application.js")} */
// @ts-ignore
/** @typedef {import("./modules/engine.js")} */
// @ts-ignore
/** @typedef {import("./modules/animator.js")} */

"use strict";

//#region Visualizer
/** @enum {String} */ const DataType = {
	/** @readonly */ frequency: `frequency`,
	/** @readonly */ timeDomain: `time domain`,
};

/**
 * @callback VisualizerHandler
 * @param {CanvasRenderingContext2D} context
 * @returns {void}
 */

class Visualizer extends Animator {
	/**
	 * @param {HTMLCanvasElement} canvas 
	 * @param {HTMLMediaElement} media 
	 */
	constructor(canvas, media) {
		super(canvas);

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
		//
		// const reader = new FileReader();
		// reader.addEventListener(`loadend`, (event) => {
		// 	const uint8Array = new Uint8Array(/** @type {ArrayBuffer} */(reader.result));
		// 	const mp4File = new File([uint8Array], `${Date.now()}.mp4`, {
		// 		type: `video/mp4`
		// 	});
		// 	Application.download(mp4File);
		// });
		// //
		// const stream = canvas.captureStream(); // Get video stream from canvas
		// const destination = audioContext.createMediaStreamDestination();
		// stream.addTrack(destination.stream.getAudioTracks()[0]);

		// this.#recorder = new MediaRecorder(stream, {
		// 	mimeType: `video/webm`,
		// });

		// const chunks = [];
		// this.#recorder.addEventListener(`dataavailable`, (event) => {
		// 	chunks.push(event.data);
		// });
		// this.#recorder.addEventListener(`stop`, (event) => {
		// 	const webmFile = new File(chunks, `${Date.now()}.webm`, {
		// 		type: `video/webm`
		// 	});
		// 	reader.readAsArrayBuffer(webmFile);
		// });
	}
	// #recorder;
	// get launched() {
	// 	return super.launched;
	// }
	// set launched(value) {
	// 	if (value) {
	// 		this.#recorder.start();
	// 		super.launched = true;
	// 	} else {
	// 		super.launched = false;
	// 		this.#recorder.stop();
	// 	}
	// }
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
	 * @param {DataType} type lengthvolume
	 */
	getData(type) {
		switch (type) {
			case DataType.frequency: return this.#arrayFrequencyData;
			case DataType.timeDomain: return this.#arrayTimeDomainData;
			default: throw new TypeError(`Invalid data type: '${type}'.`);
		}
	}
	/** @type {Number} */ #volumeFrequency;
	/** @type {Number} */ #volumeTimeDomain;
	/**
	 * @param {DataType} type 
	 */
	getVolume(type) {
		switch (type) {
			case DataType.frequency: return this.#volumeFrequency;
			case DataType.timeDomain: return this.#volumeTimeDomain;
			default: throw new TypeError(`Invalid data type: '${type}'.`);
		}
	}
	/** @type {Number} */ #amplitudeFrequency;
	/** @type {Number} */ #amplitudeTimeDomain;
	/**
	 * @param {DataType} type 
	 */
	getAmplitude(type = DataType.timeDomain) {
		switch (type) {
			case DataType.frequency: return this.#amplitudeFrequency;
			case DataType.timeDomain: return this.#amplitudeTimeDomain;
			default: throw new TypeError(`Invalid data type: '${type}'.`);
		}
	}
	isBeat() {
		return (this.#amplitudeTimeDomain > this.#volumeFrequency);
	}
	/**
	 * @param {VisualizerHandler} handler 
	 */
	renderer(handler) {
		super.renderer((context) => {
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
			handler(context);
		});
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
 * @property {Boolean | undefined} autoFullscreen
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
			result.loop = source.loop;
		}
		const quality = Reflect.get(source, `quality`);
		if (quality !== undefined) {
			if (typeof (quality) !== `number`) {
				throw new TypeError(`Source 'quality' property must be 'Number' type.`);
			}
			result.quality = source.quality;
		}
		const type = Reflect.get(source, `type`);
		if (type !== undefined) {
			if (typeof (type) !== `string`) {
				throw new TypeError(`Source 'type' property must be 'VisualizerType' type.`);
			}
			result.type = source.type;
		}
		const autoFullscreen = Reflect.get(source, `autoFullscreen`);
		if (autoFullscreen !== undefined) {
			if (typeof (autoFullscreen) !== `boolean`) {
				throw new TypeError(`Source 'autoFullscreen' property must be 'Boolean' type.`);
			}
			result.autoFullscreen = source.autoFullscreen;
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
		result.autoFullscreen = source.autoFullscreen;
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
		this.autoFullscreen = false;
	}
	/** @type {Boolean} */ #loop;
	get loop() {
		return this.#loop;
	}
	set loop(value) {
		this.#loop = value;
	}
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
	/** @type {Boolean} */ #autoFullscreen;
	get autoFullscreen() {
		return this.#autoFullscreen;
	}
	set autoFullscreen(value) {
		this.#autoFullscreen = value;
	}
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

const search = Application.search;
let settings = Settings.import((() => {
	const protocol = search.get(`protocol`);
	if (protocol === undefined) {
		return archiveSettings.data;
	} else {
		const keys = Object.keys(Settings.export(new Settings()));
		const values = protocol.split(`-`, keys.length);
		return JSON.parse(`{ ${keys.map((key, index) => `"${key}": ${values[index]}`).join(`, `)} }`);
	}
})());

const theme = Application.search.get(`theme`);
switch (theme) {
	case `light`: {
		document.documentElement.dataset[`theme`] = theme;
	} break;
}
/** @type {Database<Blob>} */ const databasePlaylist = new Database(`${Application.developer}\\${Application.title}\\Playlist`);
//#endregion