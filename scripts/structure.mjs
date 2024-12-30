"use strict";

import { DataPair } from "./core/extensions.mjs";
import { } from "./core/generators.mjs";
import { } from "./core/measures.mjs";
import { } from "./core/palette.mjs";
import { StaticEngine } from "./dom/generators.mjs";

import { } from "./workers/extensions.mjs";
import { } from "./workers/generators.mjs";
import { } from "./workers/measures.mjs";

const { sqpw, sqrt, log2, round } = Math;

//#region Data types
/**
 * Enum representing data types for audio analysis.
 * @enum {number}
 */
const DataTypes = {
	/**
	 * Frequency spectrum data.
	 * @readonly
	 */
	frequency: 0,
	/**
	 * Time domain data.
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
 * @typedef {InstanceType<typeof AudioPackage.Manager>} AudioPackageManager
 */

/**
 * Class representing audio analysis data.
 * Used to store and retrieve audio metrics, such as volume and amplitude.
 */
class AudioPackage {
	//#region Manager
	/**
	 * Manager for controlling and configuring audio analysis parameters.
	 */
	static Manager = class AudioPackageManager {
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
			this.#media = media;
			const context = new AudioContext();
			media.addEventListener(`play`, async (event) => {
				try {
					await context.resume();
				} catch (reason) {
					await window.alertAsync(Error.from(reason));
				}
			});

			const source = context.createMediaElementSource(media);
			const analyser = this.#analyser = context.createAnalyser();

			source.connect(analyser);
			analyser.connect(context.destination);

			this.#package = AudioPackage.#construct(analyser.frequencyBinCount);
		}
		/** @type {HTMLMediaElement} */
		#media;
		/** @type {AnalyserNode} */
		#analyser;
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
			if (!AudioPackageManager.checkQuality(value)) return;
			const analyser = this.#analyser;
			analyser.fftSize = (1 << value);
			this.#package.#tapeLength = analyser.frequencyBinCount;
			this.#package.#datalist = new Map(arrayDataTypes.map(type => [type, new Uint8Array(analyser.frequencyBinCount)]));
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
			if (!AudioPackage.Manager.checkSmoothing(value)) return;
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
			if (!AudioPackageManager.checkFocus(value)) return;
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
			if (!AudioPackageManager.checkSpread(value)) return;
			const analyser = this.#analyser, { focus } = this;
			analyser.minDecibels = focus - value;
			analyser.maxDecibels = focus + value;
		}
		/** @type {AudioPackage} */
		#package;
		/**
		 * Package serviced by manager.
		 * @readonly
		 * @returns {AudioPackage}
		 */
		get package() {
			return this.#package;
		}
		/**
		 * Updates the audio analysis data for the current media element state.
		 * Retrieves updated values for volume and amplitude.
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

				let linear = 0, quadratic = 0;
				for (let index = 0; index < tapeLength; index++) {
					const datum = data[index];
					linear += datum;
					quadratic += sqpw(datum);
				}
				audioPackage.#volumes.set(type, linear / tapeLength);
				audioPackage.#amplitudes.set(type, sqrt(quadratic / tapeLength));
			}
		}
	};
	//#endregion

	/** @type {boolean} */
	static #locked = true;
	/**
	 * @param {number} length The length of data to analyze.
	 * @returns {AudioPackage}
	 */
	static #construct(length) {
		AudioPackage.#locked = false;
		const self = new AudioPackage();
		AudioPackage.#locked = true;

		self.#tapeLength = length;
		self.#datalist = new Map(arrayDataTypes.map(type => [type, new Uint8Array(length)]));
		self.#volumes = new Map(arrayDataTypes.map(type => [type, 0]));
		self.#amplitudes = new Map(arrayDataTypes.map(type => [type, 0.5]));

		return self;
	}
	constructor() {
		if (AudioPackage.#locked) throw new TypeError(`Illegal constructor`);
	}
	/** @type {number} */
	#tapeLength;
	/**
	 * Gets the total number of measurements in audio data.
	 * @readonly
	 * @returns {number}
	 */
	get tapeLength() {
		return this.#tapeLength;
	}
	/** @type {Map<DataTypes, Uint8Array>} */
	#datalist;
	/**
	 * Retrieves audio data for the specified type.
	 * @param {DataTypes} type The data type (e.g., frequency or time domain).
	 * @returns {Uint8Array} The data array for analysis.
	 * @throws {TypeError} If an invalid data type is specified.
	 */
	getData(type) {
		const data = this.#datalist.get(type);
		if (data === undefined) throw new TypeError(`Invalid data '${type}' type`);
		return data;
	}
	/** @type {Map<DataTypes, number>} */
	#volumes;
	/**
	 * Gets the current volume level for the specified data type.
	 * @param {DataTypes} type The data type.
	 * @returns {number} The volume level.
	 * @throws {TypeError} If an invalid data type is specified.
	 */
	getVolume(type) {
		const volume = this.#volumes.get(type);
		if (volume === undefined) throw new TypeError(`Invalid data '${type}' type`);
		return volume;
	}
	/** @type {Map<DataTypes, number>} */
	#amplitudes;
	/**
	 * Gets the current amplitude level for the specified data type.
	 * @param {DataTypes} type The data type.
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
 * @typedef {InstanceType<typeof Visualizer.Visualiztion>} VisualizerVisualiztion
 */

/**
 * @typedef {object} VisualizerEventMap
 * @property {Event} trigger
 * @property {Event} resize
 */

/**
 * Class to manipulate visualizations.
 */
class Visualizer extends EventTarget {
	//#region Visualiztion
	/**
	 * Abstract base class for creating custom visualizations for the visualizer.
	 * @abstract
	 */
	static Visualiztion = class VisualizerVisualiztion {
		constructor() {
			if (new.target === VisualizerVisualiztion) throw new TypeError(`Unable to create an instance of an abstract class`);
		}
		/** @type {Visualizer?} */
		#owner;
		/**
		 * @readonly
		 * @returns {Visualizer}
		 */
		get #visualizer() {
			const visualizer = this.#owner ?? Visualizer.#self;
			if (visualizer === null) throw new Error(`Visualizer is currently unavailable.`);
			this.#owner = visualizer;
			return visualizer;
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
		 * The audio data for analysis.
		 * @readonly
		 * @returns {AudioPackage}
		 */
		get audio() {
			return this.#visualizer.#manager.package;
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
		get FPS() {
			return this.#visualizer.#engine.FPS;
		}
		/**
		 * Clears the canvas and resets the view.
		 * @returns {void}
		 */
		resize() {
			const { context } = this;
			const { width, height } = context.canvas;
			const transform = context.getTransform();
			context.clearRect(-transform.e / transform.a, -transform.f / transform.d, width / transform.a, height / transform.d);
		}
		/**
		 * Updates the visualization with new audio data.
		 * @returns {void}
		 */
		update() {
			const { context } = this;
			const { width, height } = context.canvas;
			const transform = context.getTransform();
			context.clearRect(-transform.e / transform.a, -transform.f / transform.d, width / transform.a, height / transform.d);
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
	/** @type {Map<string, VisualizerVisualiztion>} */
	static #attachments = new Map();
	/**
	 * Attaches a visualization to the visualizer.
	 * @param {string} name The name of the visualization.
	 * @param {VisualizerVisualiztion} visualization The visualization instance.
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
	/** @type {boolean} */
	static #locked = true;
	/** @type {Visualizer?} */
	static #self = null;
	/**
	 * Builds and initializes a new visualizer instance.
	 * @param {HTMLCanvasElement} canvas The canvas element for drawing.
	 * @param {HTMLMediaElement} media The media element for audio input.
	 * @returns {Visualizer}
	 */
	static build(canvas, media) {
		Visualizer.#locked = false;
		const self = this.#self = new Visualizer();
		Visualizer.#locked = true;

		self.#canvas = canvas;
		self.#fixCanvasSize();
		window.addEventListener(`resize`, event => self.#fixCanvasSize());

		const context = canvas.getContext(`2d`) ?? Error.throws(`Unable to get context`);
		self.#context = context;
		self.#fixContextSize();
		window.addEventListener(`resize`, event => self.#fixContextSize());

		self.#manager = new AudioPackage.Manager(media);

		const engine = self.#engine = new StaticEngine();
		media.addEventListener(`play`, (event) => {
			engine.launched = true;
		});
		media.addEventListener(`pause`, (event) => {
			engine.launched = false;
		});
		media.addEventListener(`emptied`, (event) => {
			self.#triggerVisualizationUpdate();
			engine.launched = false;
		});

		const attachment = Array.from(Visualizer.#attachments).at(0) ?? Error.throws(`No visualization is attached to the visualizer.`);
		self.#attachment = DataPair.fromArray(attachment);
		self.#triggerVisualizationResize();
		window.addEventListener(`resize`, event => self.#triggerVisualizationResize());
		self.#triggerVisualizationUpdate();
		engine.addEventListener(`trigger`, event => self.#triggerVisualizationUpdate());

		return self;
	}
	constructor() {
		super();
		if (Visualizer.#locked) throw new TypeError(`Illegal constructor`);
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
	/** @type {StaticEngine} */
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
	/** @type {DataPair<string, VisualizerVisualiztion>} */
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
		this.#triggerVisualizationResize();
	}
	/**
	 * @returns {void}
	 */
	#triggerVisualizationResize() {
		const { value: visualization } = this.#attachment;
		visualization.resize();
		visualization.update();
		this.dispatchEvent(new Event(`resize`));
	}
	/**
	 * @returns {void}
	 */
	#triggerVisualizationUpdate() {
		const manager = this.#manager, { value: visualization } = this.#attachment;
		manager.update();
		visualization.update();
		this.dispatchEvent(new Event(`trigger`));
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
	/**
	 * @returns {void}
	 */
	#fixContextSize() {
		const context = this.#context, { canvas } = context, transform = context.getTransform();
		transform.e = canvas.width / 2;
		transform.f = canvas.height / 2;
		context.setTransform(transform);
	}
	/** @type {AudioPackageManager} */
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
		if (!AudioPackage.Manager.checkQuality(value)) throw new Error(`Invalid value '${value}' for quality`);
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
		if (!AudioPackage.Manager.checkSmoothing(value)) throw new Error(`Invalid value '${value}' for smoothing`);
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
		if (!AudioPackage.Manager.checkFocus(value)) throw new Error(`Invalid value '${value}' for focus`);
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
		if (!AudioPackage.Manager.checkSpread(value)) throw new Error(`Invalid value '${value}' for spread`);
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

export { DataTypes, AudioPackage, Visualizer, Settings };
