"use strict";

import { } from "./modules/diagnostics.js";
import { } from "./modules/extensions.js";
import { FastEngine } from "./modules/generators.js";
import { } from "./modules/measures.js";
import { } from "./modules/palette.js";
import { } from "./modules/storage.js";

const { sqpw, sqrt, log2 } = Math;

//#region Data types
/**
 * @enum {number}
 */
const DataTypes = {
	/**
	 * @readonly
	 */
	frequency: 0,
	/**
	 * @readonly
	 */
	timeDomain: 1,
};
Object.freeze(DataTypes);

/** @type {Readonly<DataTypes[]>} */
const arrayDataTypes = Object.freeze(Object.values(DataTypes));
//#endregion
//#region Audio package
/**
 * @typedef {InstanceType<AudioPackage.Manager>} AudioPackageManager
 */

class AudioPackage {
	//#region Manager
	static Manager = class AudioPackageManager {
		/**
		 * @param {HTMLMediaElement} media 
		 */
		constructor(media) {
			this.#media = media;
			const audioContext = new AudioContext();
			media.addEventListener(`play`, (event) => window.assert(async () => {
				await audioContext.resume();
			}));
			const source = this.#source = audioContext.createMediaElementSource(media);
			const analyser = this.#analyser = audioContext.createAnalyser();
			source.connect(analyser);
			analyser.connect(audioContext.destination);

			this.smoothing = 0.7;

			const audioPackage = this.#package = AudioPackage.#construct(analyser.frequencyBinCount);
		}
		/** @type {HTMLMediaElement} */
		#media;
		/** @type {MediaElementAudioSourceNode} */
		#source;
		/** @type {AnalyserNode} */
		#analyser;
		/**
		 * @returns {number}
		 */
		get quality() {
			return log2(this.#analyser.fftSize);
		}
		/**
		 * @param {number} value 
		 * @returns {void}
		 */
		set quality(value) {
			if (!Number.isInteger(value)) return;
			if (5 > value || value > 15) return;
			const analyser = this.#analyser;
			analyser.fftSize = (1 << value);
			this.#package.#datalist = new Map(arrayDataTypes.map(type => [type, new Uint8Array(analyser.frequencyBinCount)]));
		}
		/**
		 * @returns {number}
		 */
		get smoothing() {
			return this.#analyser.smoothingTimeConstant;
		}
		/**
		 * @param {number} value 
		 * @returns {void}
		 */
		set smoothing(value) {
			if (!Number.isFinite(value)) return;
			if (0 > value || value > 1) return;
			this.#analyser.smoothingTimeConstant = value;
		}
		/**
		 * @returns {number}
		 */
		get minDecibels() {
			return this.#analyser.minDecibels;
		}
		/**
		 * @param {number} value 
		 * @returns {void}
		 */
		set minDecibels(value) {
			if (!Number.isFinite(value)) return;
			if (value >= this.#analyser.maxDecibels) return;
			this.#analyser.minDecibels = value;
		}
		/**
		 * @returns {number}
		 */
		get maxDecibels() {
			return this.#analyser.maxDecibels;
		}
		/**
		 * @param {number} value 
		 * @returns {void}
		 */
		set maxDecibels(value) {
			if (!Number.isFinite(value)) return;
			if (this.#analyser.minDecibels >= value) return;
			this.#analyser.maxDecibels = value;
		}
		/** @type {AudioPackage} */
		#package;
		/**
		 * @readonly
		 * @returns {AudioPackage}
		 */
		get package() {
			return this.#package;
		}
		/**
		 * @returns {void}
		 */
		update() {
			const analyser = this.#analyser;
			const tapeLength = analyser.frequencyBinCount;
			const audioPackage = this.#package;
			for (const [type, data] of audioPackage.#datalist) {
				if (!arrayDataTypes.includes(type)) continue;
				if (this.#media.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
					switch (type) {
						case DataTypes.frequency: analyser.getByteFrequencyData(data); break;
						case DataTypes.timeDomain: analyser.getByteTimeDomainData(data); break;
					}
				} else data.fill(0);
				let summary = 0, summarySquare = 0;
				for (let index = 0; index < tapeLength; index++) {
					const datul = data[index];
					summary += datul;
					summarySquare += sqpw(datul);
				}
				audioPackage.#volumes.set(type, summary / tapeLength);
				audioPackage.#amplitudes.set(type, sqrt(summarySquare / tapeLength));
			}
		}
	};
	//#endregion

	/** @type {boolean} */
	static #locked = true;
	/**
	 * @param {ConstructorParameters<typeof AudioPackage>} args 
	 * @returns {AudioPackage}
	 */
	static #construct(...args) {
		AudioPackage.#locked = false;
		const result = new AudioPackage(...args);
		AudioPackage.#locked = true;
		return result;
	}
	/**
	 * @param {number} length 
	 */
	constructor(length) {
		if (AudioPackage.#locked) throw new TypeError(`Illegal constructor`);
		this.#tapeLength = length;
		this.#datalist = new Map(arrayDataTypes.map(type => [type, new Uint8Array(length)]));
		this.#volumes = new Map(arrayDataTypes.map(type => [type, 0]));
		this.#amplitudes = new Map(arrayDataTypes.map(type => [type, 0]));
	}
	/** @type {number} */
	#tapeLength;
	/**
	 * @readonly
	 * @returns {number}
	 */
	get tapeLength() {
		return this.#tapeLength;
	}
	/** @type {Map<DataTypes, Uint8Array>} */
	#datalist;
	/**
	 * @param {DataTypes} type 
	 * @returns {Uint8Array}
	 * @throws {TypeError}
	 */
	getData(type) {
		const data = this.#datalist.get(type);
		if (data === undefined) throw new TypeError(`Invalid data '${type}' type`);
		return data;
	}
	/** @type {Map<DataTypes, number>} */
	#volumes;
	/**
	 * @param {DataTypes} type 
	 * @returns {number}
	 * @throws {TypeError}
	 */
	getVolume(type) {
		const volume = this.#volumes.get(type);
		if (volume === undefined) throw new TypeError(`Invalid data '${type}' type`);
		return volume;
	}
	/** @type {Map<DataTypes, number>} */
	#amplitudes;
	/**
	 * @param {DataTypes} type 
	 * @returns {number}
	 * @throws {TypeError}
	 */
	getAmplitude(type) {
		const amplitude = this.#amplitudes.get(type);
		if (amplitude === undefined) throw new TypeError(`Invalid data '${type}' type`);
		return amplitude;
	}
}
//#endregion
//#region Visualizer
/**
 * @typedef {InstanceType<Visualizer.Visualization>} VisualizerVisualization
 */

/**
 * @typedef {(new (...args: void[]) => VisualizerVisualization)} VisualizationMethod
 */

/**
 * @typedef {Object} UncomposedVisualizerEventMap
 * @property {Event} update
 * @property {UIEvent} resize
 * 
 * @typedef {EventListener & UncomposedVisualizerEventMap} VisualizerEventMap
 */

class Visualizer extends EventTarget {
	//#region Visualization
	static Visualization = class VisualizerVisualization {
		constructor() {
			if (Visualizer.#locked) throw new TypeError(`Illegal constructor`);
			this.#visualizer = Visualizer.#temporary;
		}
		/** @type {Visualizer} */
		#visualizer;
		/**
		 * @readonly
		 * @returns {CanvasRenderingContext2D}
		 */
		get context() {
			return this.#visualizer.#context;
		}
		/**
		 * @readonly
		 * @returns {AudioPackage}
		 */
		get audio() {
			return this.#visualizer.#manager.package;
		}
		/**
		 * @readonly
		 * @returns {boolean}
		 */
		get isLaunched() {
			return this.#visualizer.#engine.launched;
		}
		/**
		 * @readonly
		 * @returns {number}
		 */
		get delta() {
			return this.#visualizer.#engine.delta;
		}
		/**
		 * @readonly
		 * @returns {number}
		 */
		get FPS() {
			return this.#visualizer.#engine.FPS;
		}
		/**
		 * @returns {Promise<void>}
		 */
		async resize() { }
		/**
		 * @returns {Promise<void>}
		 */
		async update() { }
	};
	//#endregion

	/** @type {Map<string, VisualizationMethod>} */
	static #visualizations = new Map();
	/**
	 * @readonly
	 * @returns {string[]}
	 */
	static get visualizations() {
		return Array.from(Visualizer.#visualizations.keys());
	}
	/**
	 * @param {string} name 
	 * @param {VisualizationMethod} method 
	 */
	static attach(name, method) {
		if (Visualizer.#visualizations.has(name)) throw new Error(`Visualization with name '${name}' already attached`);
		Visualizer.#visualizations.set(name, method);
	}
	/** @type {Visualizer} */
	static #temporary;
	/**
	 * @param {HTMLCanvasElement} canvas 
	 * @param {HTMLMediaElement} media 
	 * @param {string} name 
	 * @returns {Promise<Visualizer>}
	 */
	static async build(canvas, media, name) {
		const visualizer = Visualizer.#temporary = Visualizer.#construct();
		visualizer.#canvas = canvas;
		visualizer.#fixCanvasSize();
		window.addEventListener(`resize`, (event) => visualizer.#fixCanvasSize());

		const context = canvas.getContext(`2d`);
		if (context === null) throw new Error(`Unable to get context`);
		visualizer.#context = context;
		visualizer.#fixContextSize();
		window.addEventListener(`resize`, (event) => visualizer.#fixContextSize());

		const manager = visualizer.#manager = new AudioPackage.Manager(media);

		const engine = visualizer.#engine = new FastEngine();
		media.addEventListener(`play`, (event) => {
			engine.launched = true;
		});
		media.addEventListener(`pause`, (event) => {
			engine.launched = false;
		});
		media.addEventListener(`emptied`, async (event) => {
			await visualizer.#triggerVisualizationUpdate();
			engine.launched = false;
		});

		const method = Visualizer.#visualizations.get(name);
		if (method === undefined) throw new Error(`Visualization with name '${name}' doesn't attached`);
		const visualization = visualizer.#visualization = Visualizer.#visualize(method);
		await visualizer.#triggerVisualizationResize();
		window.addEventListener(`resize`, async (event) => await visualizer.#triggerVisualizationResize());
		await visualizer.#triggerVisualizationUpdate();
		engine.addEventListener(`update`, async (event) => await visualizer.#triggerVisualizationUpdate());

		return visualizer;
	}
	/** @type {boolean} */
	static #locked = true;
	/**
	 * @param {ConstructorParameters<typeof Visualizer>} args 
	 * @returns {Visualizer}
	 */
	static #construct(...args) {
		Visualizer.#locked = false;
		const result = new Visualizer(...args);
		Visualizer.#locked = true;
		return result;
	}
	/**
	 * @param {VisualizationMethod} method 
	 * @param {ConstructorParameters<VisualizationMethod>} args 
	 * @returns {VisualizerVisualization}
	 */
	static #visualize(method, ...args) {
		Visualizer.#locked = false;
		const result = Reflect.construct(method, args);
		Visualizer.#locked = true;
		return result;
	}
	constructor() {
		super();
		if (Visualizer.#locked) throw new TypeError(`Illegal constructor`);
	}
	/**
	 * @template {keyof VisualizerEventMap} K
	 * @param {K} type
	 * @param {(this: FastEngine, ev: VisualizerEventMap[K]) => any} listener
	 * @param {boolean | AddEventListenerOptions} options
	 * @returns {void}
	 */
	addEventListener(type, listener, options = false) {
		// @ts-ignore
		return super.addEventListener(type, listener, options);
	}
	/**
	 * @template {keyof VisualizerEventMap} K
	 * @param {K} type
	 * @param {(this: FastEngine, ev: VisualizerEventMap[K]) => any} listener
	 * @param {boolean | EventListenerOptions} options
	 * @returns {void}
	 */
	removeEventListener(type, listener, options = false) {
		// @ts-ignore
		return super.addEventListener(type, listener, options);
	}
	/** @type {HTMLCanvasElement} */
	#canvas;
	/**
	 * @returns {void}
	 */
	#fixCanvasSize() {
		const { width, height } = this.#canvas.getBoundingClientRect();
		this.#canvas.width = width;
		this.#canvas.height = height;
	}
	/** @type {CanvasRenderingContext2D} */
	#context;
	/**
	 * @returns {void}
	 */
	#fixContextSize() {
		const transform = this.#context.getTransform();
		transform.e = this.#canvas.width / 2;
		transform.f = this.#canvas.height / 2;
		this.#context.setTransform(transform);
	}
	/** @type {AudioPackageManager} */
	#manager;
	/**
	 * @returns {number}
	 */
	get quality() {
		return this.#manager.quality;
	}
	/**
	 * @param {number} value 
	 * @returns {void}
	 */
	set quality(value) {
		this.#manager.quality = value;
	}
	/**
	 * @returns {number}
	 */
	get smoothing() {
		return this.#manager.smoothing;
	}
	/**
	 * @param {number} value 
	 * @returns {void}
	 */
	set smoothing(value) {
		this.#manager.smoothing = value;
	}
	/**
	 * @returns {number}
	 */
	get minDecibels() {
		return this.#manager.minDecibels;
	}
	/**
	 * @param {number} value 
	 * @returns {void}
	 */
	set minDecibels(value) {
		this.#manager.minDecibels = value;
	}
	/**
	 * @returns {number}
	 */
	get maxDecibels() {
		return this.#manager.maxDecibels;
	}
	/**
	 * @param {number} value 
	 * @returns {void}
	 */
	set maxDecibels(value) {
		this.#manager.maxDecibels = value;
	}
	/** @type {FastEngine} */
	#engine;
	/** @type {VisualizerVisualization} */
	#visualization;
	/**
	 * @returns {Promise<void>}
	 */
	async #triggerVisualizationResize() {
		await this.#visualization.resize();
		await this.#visualization.update();
		this.dispatchEvent(new UIEvent(`resize`));
	}
	/**
	 * @returns {Promise<void>}
	 */
	async #triggerVisualizationUpdate() {
		this.#manager.update();
		await this.#visualization.update();
		this.dispatchEvent(new UIEvent(`update`));
	}
}
//#endregion

export { DataTypes, AudioPackage, Visualizer };