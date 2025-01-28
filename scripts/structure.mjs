"use strict";

import { DataPair } from "./core/extensions.mjs";
// import { } from "./core/generators.mjs";
// import { } from "./core/measures.mjs";
// import { } from "./core/palette.mjs";

import { } from "./workers/extensions.mjs";
import { Engine, FastEngine } from "./workers/generators.mjs";
// import { } from "./workers/measures.mjs";

const { sqrt, sqpw, log2, round } = Math;

//#region Audio types
/**
 * @enum {number}
 */
const AudioTypes = {
	/**
	 * Frequency spectrum type.
	 * @readonly
	 * @returns {0}
	 */
	FREQUENCY_TYPE: 0,
	/**
	 * Time domain type.
	 * @readonly
	 * @returns {1}
	 */
	TEMPORAL_TYPE: 1,
};
Object.freeze(AudioTypes);
//#endregion
//#region Audioset
/**
 * @typedef {InstanceType<typeof Audioset.Manager>} AudiosetManager
 */

/**
 * @template T
 */
class Audioset {
	//#region Manager
	static Manager = class AudiosetManager {
		/**
		 * Checks if the given quality value is within the acceptable range.
		 * @param {number} value The quality level to validate.
		 * @returns {boolean}
		 */
		static checkQuality(value) {
			if (!Number.isInteger(value)) return false;
			if (5 > value || value > 15) return false;
			return true;
		}
		/**
		 * Validates the smoothing level for audio analysis.
		 * @param {number} value The smoothing level to validate.
		 * @returns {boolean}
		 */
		static checkSmoothing(value) {
			if (!Number.isFinite(value)) return false;
			if (0 > value || value > 1) return false;
			return true;
		}
		/**
		 * Checks if the provided focus value is a valid number.
		 * @param {number} value The focus level to validate.
		 * @returns {boolean}
		 */
		static checkFocus(value) {
			if (!Number.isFinite(value)) return false;
			return true;
		}
		/**
		 * Validates the spread level for audio analysis.
		 * @param {number} value The spread level to validate.
		 * @returns {boolean}
		 */
		static checkSpread(value) {
			if (!Number.isFinite(value)) return false;
			if (0 >= value) return false;
			return true;
		}
		/**
		 * @param {HTMLMediaElement} media The media element for audio analysis.
		 */
		constructor(media) {
			const context = new AudioContext();
			media.addEventListener(`play`, async event => await context.resume());

			const source = context.createMediaElementSource(media);
			const analyser = this.#analyser = context.createAnalyser();
			const mapDataReaders = this.#mapDataReaders = new Map();
			mapDataReaders.set(AudioTypes.FREQUENCY_TYPE, analyser.getByteFrequencyData.bind(analyser));
			mapDataReaders.set(AudioTypes.TEMPORAL_TYPE, analyser.getByteTimeDomainData.bind(analyser));

			source.connect(analyser);
			analyser.connect(context.destination);

			this.#audioset = Audioset.#construct(analyser.frequencyBinCount, [AudioTypes.FREQUENCY_TYPE, AudioTypes.TEMPORAL_TYPE]);
			this.#dataTemporary = new Uint8Array(analyser.frequencyBinCount);
		}
		/** @type {AnalyserNode} */
		#analyser;
		/** @type {Map<AudioTypes, (array: Uint8Array) => void>} */
		#mapDataReaders;
		/**
		 * @param {AudioTypes} type 
		 * @param {Uint8Array} data 
		 * @returns {void}
		 */
		#readByteData(type, data) {
			const readByteData = this.#mapDataReaders.get(type);
			if (readByteData === undefined) throw new ReferenceError(`Data reader for '${type}' data not initialized`);
			readByteData(data);
		}
		/**
		 * Gets the quality level of the audio analysis, influencing analysis detail.
		 * Higher values provide more detailed audio analysis.
		 * @returns {number}
		 */
		get quality() {
			return log2(this.#analyser.fftSize);
		}
		/**
		 * Sets the quality level for audio analysis.
		 * Acceptable values range between 5 and 15.
		 * @param {number} value 
		 * @returns {void}
		 */
		set quality(value) {
			if (!AudiosetManager.checkQuality(value)) return;
			const analyser = this.#analyser;
			const audioset = this.#audioset;
			const types = audioset.#types;
			analyser.fftSize = (1 << value);
			audioset.#length = analyser.frequencyBinCount;
			audioset.#datalist = new Map(Array.from(types, type => [type, new Float32Array(analyser.frequencyBinCount)]));
			this.#dataTemporary = new Uint8Array(analyser.frequencyBinCount);
		}
		/**
		 * Gets the smoothing level applied to the analysis for a smoother transition between values.
		 * @returns {number}
		 */
		get smoothing() {
			return this.#analyser.smoothingTimeConstant;
		}
		/**
		 * Sets the smoothing level for the analysis.
		 * Acceptable values range from 0 (no smoothing) to 1 (maximum smoothing).
		 * @param {number} value 
		 * @returns {void}
		 */
		set smoothing(value) {
			if (!Audioset.Manager.checkSmoothing(value)) return;
			this.#analyser.smoothingTimeConstant = value;
		}
		/**
		 * Gets the focus level of the audio analysis, which adjusts the central volume value.
		 * @returns {number}
		 */
		get focus() {
			const { minDecibels, maxDecibels } = this.#analyser;
			return (minDecibels + maxDecibels) / 2;
		}
		/**
		 * Sets the focus level for the analysis.
		 * This shifts the central volume value for analysis purposes.
		 * @param {number} value 
		 * @returns {void}
		 */
		set focus(value) {
			if (!AudiosetManager.checkFocus(value)) return;
			const { spread } = this;
			const analyser = this.#analyser;
			analyser.minDecibels = value - spread;
			analyser.maxDecibels = value + spread;
		}
		/**
		 * Gets the range of volume levels used in the analysis.
		 * This adjusts the width of the analyzed volume range.
		 * @returns {number}
		 */
		get spread() {
			const { minDecibels, maxDecibels } = this.#analyser;
			return (maxDecibels - minDecibels) / 2;
		}
		/**
		 * Sets the volume range for the analysis, expanding or contracting the focus area.
		 * The value must be greater than 0.
		 * @param {number} value 
		 * @returns {void}
		 */
		set spread(value) {
			if (!AudiosetManager.checkSpread(value)) return;
			const analyser = this.#analyser, { focus } = this;
			analyser.minDecibels = focus - value;
			analyser.maxDecibels = focus + value;
		}
		/** @type {Audioset<AudioTypes>} */
		#audioset;
		/**
		 * Audioset serviced by manager.
		 * @readonly
		 * @returns {Audioset<AudioTypes>}
		 */
		get audioset() {
			return this.#audioset;
		}
		/** @type {boolean} */
		#autofix = true;
		/**
		 * @returns {void}
		 */
		#fix() {
			const audioset = this.#audioset;
			const analyser = this.#analyser;
			const { minDecibels } = analyser;
			const range = analyser.maxDecibels - minDecibels;

			let minimum = Infinity, maximum = -Infinity;
			audioset.getData(AudioTypes.FREQUENCY_TYPE).forEach((datum) => {
				const decibel = (datum / 255) * range + minDecibels;
				if (decibel < minimum) minimum = decibel;
				if (decibel > maximum) maximum = decibel;
			});

			try {
				analyser.minDecibels = minimum;
				analyser.maxDecibels = maximum + 1;
			} catch {
				console.warn(`[${minimum} - ${maximum}]`);
				return;
			}
		}
		/** @type {Uint8Array} */
		#dataTemporary;
		/**
		 * Refreshes the audio analysis data for the current media element state.
		 * Retrieves updated values for volume and amplitude.
		 * @returns {void}
		 */
		refresh() {
			const audioset = this.#audioset;
			const { length } = audioset;
			const types = audioset.#types;
			const dataTemporary = this.#dataTemporary;

			for (const [type, data] of audioset.#datalist) {
				if (!types.has(type)) return;

				this.#readByteData(type, dataTemporary);
				let linear = 0, quadratic = 0;
				for (let index = 0; index < length; index++) {
					const unit = dataTemporary[index] / 255;
					data[index] = unit;
					linear += unit;
					quadratic += sqpw(unit);
				}

				audioset.#volumes.set(type, linear / length);
				audioset.#amplitudes.set(type, sqrt(quadratic / length));
			}
		}
	};
	//#endregion

	/** @type {boolean} */
	static #locked = true;
	/**
	 * @template T
	 * @param {number} length 
	 * @param {T[]} types 
	 * @returns {Audioset<T>}
	 */
	static #construct(length, types) {
		Audioset.#locked = false;
		const self = new Audioset(length, types);
		Audioset.#locked = true;
		return self;
	}
	/**
	 *  @param {number} length The number of measurements in the audio data.
	 * @param {T[]} types The types of audio data to analyze.
	 * @throws {TypeError} If the constructor is called directly.
	 */
	constructor(length, types) {
		if (Audioset.#locked) throw new TypeError(`Illegal constructor`);
		this.#length = length;
		this.#types = new Set(types);
		this.#datalist = new Map(types.map(type => [type, new Float32Array(length)]));
		this.#volumes = new Map(types.map(type => [type, 0]));
		this.#amplitudes = new Map(types.map(type => [type, 0.5]));
	}
	/** @type {number} */
	#length;
	/**
	 * Gets the total number of measurements in audio data.
	 * @readonly
	 * @returns {number}
	 */
	get length() {
		return this.#length;
	}
	/** @type {Set<T>} */
	#types;
	/** @type {Map<T, Float32Array>} */
	#datalist;
	/**
	 * Retrieves audio data for the specified type.
	 * @param {T} type The data type (e.g., frequency or time domain).
	 * @returns {Float32Array} The data array for analysis.
	 * @throws {TypeError} If an invalid data type is specified.
	 */
	getData(type) {
		const data = this.#datalist.get(type);
		if (data === undefined) throw new TypeError(`Invalid data '${type}' type`);
		return data;
	}
	/** @type {Map<T, number>} */
	#volumes;
	/**
	 * Gets the current volume level for the specified data type.
	 * @param {T} type The data type.
	 * @returns {number} The volume level.
	 * @throws {TypeError} If an invalid data type is specified.
	 */
	getVolume(type) {
		const volume = this.#volumes.get(type);
		if (volume === undefined) throw new TypeError(`Invalid data '${type}' type`);
		return volume;
	}
	/** @type {Map<T, number>} */
	#amplitudes;
	/**
	 * Gets the current amplitude level for the specified data type.
	 * @param {T} type The data type.
	 * @returns {number} The amplitude level.
	 * @throws {TypeError} If an invalid data type is specified.
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
 * @typedef {InstanceType<typeof Visualizer.Visualization>} VisualizerVisualization
 */

/**
 * @typedef {object} VisualizerEventMap
 * @property {Event} update
 * @property {Event} rebuild
 */

/**
 * Class to manipulate visualizations.
 */
class Visualizer extends EventTarget {
	//#region Visualization
	/**
	 * Abstract base class for creating custom visualizations for the visualizer.
	 * @abstract
	 */
	static Visualization = class VisualizerVisualization {
		constructor() {
			if (new.target === VisualizerVisualization) throw new TypeError(`Unable to create an instance of an abstract class`);
		}
		/** @type {Visualizer?} */
		#owner = null;
		/**
		 * @readonly
		 * @returns {Visualizer}
		 */
		get #visualizer() {
			if (this.#owner === null) {
				this.#owner = Object.suppress(Visualizer.#self);
			}
			return this.#owner;
		}
		/**
		 * The rendering context for drawing.
		 * @readonly
		 * @returns {CanvasRenderingContext2D}
		 */
		get context() {
			return this.#visualizer.#context;
		}
		/**
		 * The audioset for analysis.
		 * @readonly
		 * @returns {Audioset<AudioTypes>}
		 */
		get audioset() {
			return this.#visualizer.#manager.audioset;
		}
		/**
		 * True if the visualizer is active, false otherwise.
		 * @readonly
		 * @returns {boolean}
		 */
		get isLaunched() {
			return this.#visualizer.#engine.launched;
		}
		/**
		 * Time delta since the last update.
		 * @readonly
		 * @returns {number}
		 */
		get delta() {
			return this.#visualizer.#engine.delta;
		}
		/**
		 * Frames per second.
		 * @readonly
		 * @returns {number}
		 */
		get fps() {
			return this.#visualizer.#engine.fps;
		}
		/**
		 * Called during the (re)building of the visualization.
		 * This includes actions like resizing the context or switching between visualizations.
		 * @returns {void}
		 */
		rebuild() {
			return;
		}
		/**
		 * Called on every frame update during the visualization's lifecycle.
		 * @returns {void}
		 */
		update() {
			return;
		}
	};
	//#endregion

	/**
	 * Checks if the given frame rate value validity.
	 * @param {number} value The frame rate value to check.
	 * @returns {boolean} True if the value is valid; otherwise, false.
	 */
	static checkRate(value) {
		if (!Number.isFinite(value)) return false;
		if (30 > value || value > 300) return false;
		if (value % 30 !== 0) return false;
		return true;
	}
	/** @type {Map<string, VisualizerVisualization>} */
	static #attachments = new Map();
	/**
	 * Attaches a visualization to the visualizer.
	 * @param {string} name The name of the visualization.
	 * @param {VisualizerVisualization} visualization The visualization instance.
	 * @returns {void}
	 */
	static attach(name, visualization) {
		if (Visualizer.#attachments.has(name)) throw new Error(`Visualization with name '${name}' already attached`);
		Visualizer.#attachments.set(name, visualization);
	}
	/**
	 * First available visualization name.
	 * @readonly
	 * @returns {string}
	 */
	static get defaultVisualization() {
		const result = Visualizer.#attachments.keys().next();
		if (result.done) throw new ReferenceError(`Unable to find any attachment`);
		return result.value;
	}
	/**
	 * List of available visualization names.
	 * @readonly
	 * @returns {string[]}
	 */
	static get visualizations() {
		return Array.from(Visualizer.#attachments.keys());
	}
	/** @type {Visualizer?} */
	static #self = null;
	/**
	 * @param {HTMLCanvasElement} canvas The canvas element for drawing.
	 * @param {HTMLMediaElement} media The media element for audio input.
	 */
	constructor(canvas, media) {
		super();

		const engine = this.#engine = new FastEngine(true);
		document.addEventListener(`visibilitychange`, event => engine.launched = !document.hidden);

		this.#canvas = canvas;
		this.#fixCanvasSize();
		window.addEventListener(`resize`, event => this.#fixCanvasSize());
		this.#context = Object.suppress(canvas.getContext(`2d`));

		Visualizer.#self = this;
		const manager = this.#manager = new Audioset.Manager(media);
		engine.addEventListener(`trigger`, event => manager.refresh());

		this.#attachment = DataPair.fromArray(Array.from(Visualizer.#attachments).at(0) ?? Error.throws(`No visualization is attached to the visualizer.`));
		this.#rebuild();
		window.addEventListener(`resize`, event => this.#rebuild());
		engine.addEventListener(`trigger`, event => this.#update());
	}
	/**
	 * @template {keyof VisualizerEventMap} K
	 * @overload
	 * @param {K} type 
	 * @param {(this: Visualizer, ev: VisualizerEventMap[K]) => any} listener 
	 * @param {boolean | AddEventListenerOptions} [options] 
	 * @returns {void}
	 */
	/**
	 * @overload
	 * @param {string} type 
	 * @param {EventListenerOrEventListenerObject} listener 
	 * @param {boolean | AddEventListenerOptions} [options] 
	 * @returns {void}
	 */
	/**
	 * @param {string} type 
	 * @param {EventListenerOrEventListenerObject} listener 
	 * @param {boolean | AddEventListenerOptions} options 
	 * @returns {void}
	 */
	addEventListener(type, listener, options = false) {
		return super.addEventListener(type, listener, options);
	}
	/**
	 * @template {keyof VisualizerEventMap} K
	 * @overload
	 * @param {K} type 
	 * @param {(this: Visualizer, ev: VisualizerEventMap[K]) => any} listener 
	 * @param {boolean | EventListenerOptions} [options] 
	 * @returns {void}
	 */
	/**
	 * @overload
	 * @param {string} type 
	 * @param {EventListenerOrEventListenerObject} listener 
	 * @param {boolean | EventListenerOptions} [options] 
	 * @returns {void}
	 */
	/**
	 * @param {string} type 
	 * @param {EventListenerOrEventListenerObject} listener 
	 * @param {boolean | EventListenerOptions} options 
	 * @returns {void}
	 */
	removeEventListener(type, listener, options = false) {
		return super.removeEventListener(type, listener, options);
	}
	/** @type {Engine} */
	#engine;
	/**
	 * Gets the current frame rate limit.
	 * @returns {number}
	 */
	get rate() {
		return round(this.#engine.limit);
	}
	/**
	 * Sets a new frame rate limit within an allowable range.
	 * @param {number} value 
	 * @returns {void}
	 */
	set rate(value) {
		if (!Visualizer.checkRate(value)) return;
		this.#engine.limit = round(value);
	}
	/** @type {DataPair<string, VisualizerVisualization>} */
	#attachment;
	/**
	 * Gets the name of the current visualization.
	 * @returns {string}
	 */
	get visualization() {
		return this.#attachment.key;
	}
	/**
	 * Sets a new visualization by its name.
	 * @param {string} value The key name of the visualization to attach.
	 * @returns {void}
	 * @throws {Error} If the specified visualization is not attached.
	 */
	set visualization(value) {
		const visualization = Visualizer.#attachments.get(value);
		if (visualization === undefined) throw new Error(`Visualization with name '${value}' doesn't attached`);
		this.#attachment = new DataPair(value, visualization);
		this.#clear();
		this.#rebuild();
	}
	/**
	 * @returns {void}
	 */
	#clear() {
		const { value: visualization } = this.#attachment;
		const { context } = visualization;
		context.reset();
		context.resetTransform();
	}
	/**
	 * @returns {void}
	 */
	#rebuild() {
		const { value: visualization } = this.#attachment;
		visualization.rebuild();
		visualization.update();
		this.dispatchEvent(new Event(`rebuild`));
	}
	/**
	 * @returns {void}
	 */
	#update() {
		const { value: visualization } = this.#attachment;
		visualization.update();
		this.dispatchEvent(new Event(`update`));
	}
	/** @type {HTMLCanvasElement} */
	#canvas;
	/**
	 * @returns {void}
	 */
	#fixCanvasSize() {
		const canvas = this.#canvas, { width, height } = canvas.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;
	}
	/** @type {CanvasRenderingContext2D} */
	#context;
	/** @type {AudiosetManager} */
	#manager;
	/**
	 * Quality level of the visualization.
	 * @returns {number}
	 */
	get quality() {
		return this.#manager.quality;
	}
	/**
	 * Sets the quality level for visualization.
	 * @param {number} value 
	 * @returns {void}
	 */
	set quality(value) {
		this.#manager.quality = value;
	}
	/**
	 * Smoothing level of the visualization.
	 * @returns {number}
	 */
	get smoothing() {
		return this.#manager.smoothing;
	}
	/**
	 * Sets the smoothing level for visualization.
	 * @param {number} value 
	 * @returns {void}
	 */
	set smoothing(value) {
		this.#manager.smoothing = value;
	}
	/**
	 * Focus level of the visualization.
	 * @returns {number}
	 */
	get focus() {
		return this.#manager.focus;
	}
	/**
	 * Sets the focus level for visualization.
	 * @param {number} value 
	 * @returns {void}
	 */
	set focus(value) {
		this.#manager.focus = value;
	}
	/**
	 * Spread level of the visualization.
	 * @returns {number}
	 */
	get spread() {
		return this.#manager.spread;
	}
	/**
	 * Sets the spread level for visualization.
	 * @param {number} value 
	 * @returns {void}
	 */
	set spread(value) {
		this.#manager.spread = value;
	}
}
//#endregion

//#region Visualization configuration
/**
 * @typedef {Object} VisualizationConfigurationNotation
 * @property {number} [quality]
 * @property {number} [smoothing]
 * @property {number} [focus]
 * @property {number} [spread]
 */

class VisualizationConfiguration {
	/**
	 * @param {any} source 
	 * @param {string} name 
	 * @returns {VisualizationConfiguration}
	 */
	static import(source, name = `source`) {
		try {
			const shell = Object.import(source);
			const configuration = new VisualizationConfiguration();
			const quality = Reflect.get(shell, `quality`);
			if (quality !== undefined) {
				configuration.quality = Number.import(quality, `property quality`);
			}
			const smoothing = Reflect.get(shell, `smoothing`);
			if (smoothing !== undefined) {
				configuration.smoothing = Number.import(smoothing, `property smoothing`);
			}
			const focus = Reflect.get(shell, `focus`);
			if (focus !== undefined) {
				configuration.focus = Number.import(focus, `property focus`);
			}
			const spread = Reflect.get(shell, `spread`);
			if (spread !== undefined) {
				configuration.spread = Number.import(spread, `property spread`);
			}
			return configuration;
		} catch (cause) {
			throw new TypeError(`Unable to import ${(name)} due its ${typename(source)} type`, { cause });
		}
	}
	/**
	 * @returns {VisualizationConfigurationNotation}
	 */
	export() {
		return {
			quality: this.#quality,
			smoothing: this.#smoothing,
			focus: this.#focus,
			spread: this.#spread,
		};
	}
	/** @type {number} */
	#quality = 10;
	/**
	 * @returns {number}
	 */
	get quality() {
		return this.#quality;
	}
	/**
	 * @param {number} value 
	 * @returns {void}
	 */
	set quality(value) {
		if (!Audioset.Manager.checkQuality(value)) throw new Error(`Invalid value '${value}' for quality`);
		this.#quality = value;
	}
	/** @type {number} */
	#smoothing = 0.7;
	/**
	 * @returns {number}
	 */
	get smoothing() {
		return this.#smoothing;
	}
	/**
	 * @param {number} value 
	 * @returns {void}
	 */
	set smoothing(value) {
		if (!Audioset.Manager.checkSmoothing(value)) throw new Error(`Invalid value '${value}' for smoothing`);
		this.#smoothing = value;
	}
	/** @type {number} */
	#focus = -65;
	/**
	 * @returns {number}
	 */
	get focus() {
		return this.#focus;
	}
	/**
	 * @param {number} value 
	 * @returns {void}
	 */
	set focus(value) {
		if (!Audioset.Manager.checkFocus(value)) throw new Error(`Invalid value '${value}' for focus`);
		this.#focus = value;
	}
	/** @type {number} */
	#spread = 35;
	/**
	 * @returns {number}
	 */
	get spread() {
		return this.#spread;
	}
	/**
	 * @param {number} value 
	 * @returns {void}
	 */
	set spread(value) {
		if (!Audioset.Manager.checkSpread(value)) throw new Error(`Invalid value '${value}' for spread`);
		this.#spread = value;
	}
}
//#endregion
//#region Visualization attachment
/**
 * @typedef {[string, VisualizationConfigurationNotation]} VisualizationAttachmentNotation
 */

class VisualizationAttachment {
	/**
	 * @param {any} source 
	 * @param {string} name 
	 * @returns {VisualizationAttachment}
	 */
	static import(source, name = `source`) {
		try {
			const shell = Array.import(source);
			const name = String.import(shell[0], `property name`);
			const configuration = VisualizationConfiguration.import(shell[1], `property configuration`);
			return new VisualizationAttachment(name, configuration);
		} catch (cause) {
			throw new TypeError(`Unable to import ${(name)} due its ${typename(source)} type`, { cause });
		}
	}
	/**
	 * @returns {VisualizationAttachmentNotation}
	 */
	export() {
		return [
			this.#name,
			this.#configuration.export()
		];
	}
	/**
	 * @param {Readonly<[string, VisualizationConfiguration]>} source 
	 * @returns {VisualizationAttachment}
	 */
	static fromArray(source) {
		const [name, configuration] = source;
		return new VisualizationAttachment(name, configuration);
	}
	/**
	 * @returns {[string, VisualizationConfiguration]}
	 */
	toArray() {
		return [this.#name, this.#configuration];
	}
	/**
	 * @param {string} name 
	 * @param {VisualizationConfiguration} configuration 
	 */
	constructor(name, configuration) {
		this.#name = name;
		this.#configuration = configuration;
	}
	/** @type {string} */
	#name;
	/**
	 * @readonly
	 * @returns {string}
	 */
	get name() {
		return this.#name;
	}
	/** @type {VisualizationConfiguration} */
	#configuration;
	/**
	 * @readonly
	 * @returns {VisualizationConfiguration}
	 */
	get configuration() {
		return this.#configuration;
	}
}
//#endregion
//#region Visualizer configuration
/**
 * @typedef {Object} VisualizerConfigurationNotation
 * @property {number} [rate]
 * @property {string} [visualization]
 * @property {VisualizationAttachmentNotation[]} [attachments]
 */

class VisualizerConfiguration {
	/**
	 * @param {any} source 
	 * @param {string} name 
	 * @returns {VisualizerConfiguration}
	 */
	static import(source, name = `source`) {
		try {
			const shell = Object.import(source);
			const result = new VisualizerConfiguration();
			const rate = Reflect.get(shell, `rate`);
			if (rate !== undefined) {
				result.rate = Number.import(rate, `property rate`);
			}
			const visualization = Reflect.get(shell, `visualization`);
			if (visualization !== undefined) {
				result.visualization = String.import(visualization, `property visualization`);
			}
			const attachments = Reflect.get(shell, `attachments`);
			if (attachments !== undefined) {
				const mapping = new Map(Array.import(attachments, `property attachments`).map((item, index) => VisualizationAttachment.import(item, `property attachments[${(index)}]`).toArray()));
				result.#mapping = new Map(Visualizer.visualizations.map(name => [name, mapping.get(name) ?? new VisualizationConfiguration()]));
			}
			return result;
		} catch (cause) {
			throw new TypeError(`Unable to import ${(name)} due its ${typename(source)} type`, { cause });
		}
	}
	/**
	 * @returns {VisualizerConfigurationNotation}
	 */
	export() {
		return {
			rate: this.#rate,
			visualization: this.#visualization,
			attachments: Array.from(this.#mapping).map(attachment => VisualizationAttachment.fromArray(attachment).export())
		};
	};
	/** @type {number} */
	#rate = 120;
	/**
	 * @returns {number}
	 */
	get rate() {
		return this.#rate;
	}
	/**
	 * @param {number} value 
	 * @returns {void}
	 */
	set rate(value) {
		if (!Visualizer.checkRate(value)) throw new Error(`Invalid value '${value}' for rate`);
		this.#rate = value;
	}
	/** @type {string} */
	#visualization = Visualizer.defaultVisualization;
	/**
	 * @returns {string}
	 */
	get visualization() {
		return this.#visualization;
	}
	/**
	 * @param {string} value 
	 * @returns {void}
	 */
	set visualization(value) {
		if (!Visualizer.visualizations.includes(value)) throw new Error(`Invalid value '${value}' for visualization`);
		this.#visualization = value;
	}
	/** @type {Map<string, VisualizationConfiguration>} */
	#mapping = new Map(Visualizer.visualizations.map(name => [name, new VisualizationConfiguration()]));
	/**
	 * @readonly
	 * @returns {VisualizationConfiguration}
	 */
	get configuration() {
		const configuration = this.#mapping.get(this.#visualization);
		if (configuration === undefined) throw new Error(`Unable to find configuration for visualization '${this.#visualization}'`);
		return configuration;
	}
}
//#endregion
//#region Settings
/**
 * @typedef {Object} SettingsNotation
 * @property {boolean} [isOpenedConfigurator]
 * @property {VisualizerConfigurationNotation} visualizer
 */

class Settings {
	/**
	 * @param {any} source 
	 * @param {string} name 
	 * @returns {Settings}
	 */
	static import(source, name = `source`) {
		try {
			const shell = Object.import(source);
			const result = new Settings();
			const isOpenedConfigurator = Reflect.get(shell, `isOpenedConfigurator`);
			if (isOpenedConfigurator !== undefined) {
				result.isOpenedConfigurator = Boolean.import(isOpenedConfigurator, `property isOpenedConfigurator`);
			}
			const visualizer = Reflect.get(shell, `visualizer`);
			if (visualizer !== undefined) {
				result.#visualizer = VisualizerConfiguration.import(visualizer, `property visualizer`);
			}
			return result;
		} catch (cause) {
			throw new TypeError(`Unable to import ${(name)} due its ${typename(source)} type`, { cause });
		}
	}
	/**
	 * @returns {SettingsNotation}
	 */
	export() {
		return {
			isOpenedConfigurator: this.#isOpenedConfigurator,
			visualizer: this.#visualizer.export(),
		};
	}
	/** @type {boolean} */
	#isOpenedConfigurator = false;
	/**
	 * @returns {boolean}
	 */
	get isOpenedConfigurator() {
		return this.#isOpenedConfigurator;
	}
	/**
	 * @param {boolean} value 
	 * @returns {void}
	 */
	set isOpenedConfigurator(value) {
		this.#isOpenedConfigurator = value;
	}
	/** @type {VisualizerConfiguration} */
	#visualizer = new VisualizerConfiguration();
	/**
	 * @readonly
	 * @returns {VisualizerConfiguration}
	 */
	get visualizer() {
		return this.#visualizer;
	}
}
//#endregion

export { AudioTypes, Visualizer, Settings };
