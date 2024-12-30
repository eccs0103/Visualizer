"use strict";

import { Settings, Visualizer } from "../scripts/structure.mjs";

import { } from "../scripts/dom/generators.mjs";
import { } from "../scripts/dom/extensions.mjs";
import { } from "../scripts/dom/palette.mjs";
import { ArchiveManager, Database } from "../scripts/dom/storage.mjs";
import { DataPair } from "../scripts/core/extensions.mjs";
import { Timespan } from "../scripts/core/measures.mjs";

/** @typedef {import("../scripts/dom/storage.mjs").DatabaseStore} DatabaseStore */

//#region Controller
/**
 * Represents the controller for the application.
 */
class Controller {
	//#region Internal
	/** @type {boolean} */
	static #locked = true;
	/**
	 * Starts the main application flow.
	 * @returns {Promise<void>}
	 */
	static async build() {
		Controller.#locked = false;
		const self = new Controller();
		Controller.#locked = true;

		try {
			await self.#main();
		} catch (reason) {
			const error = Error.from(reason);
			let message = String(error);
			message += `\n\nAn error occurred. Any further actions may result in errors. To prevent this from happening, would you like to reload?`;
			if (await window.confirmAsync(message)) location.reload();
			throw reason;
		}
	}
	constructor() {
		if (Controller.#locked) throw new TypeError(`Illegal constructor`);
	}
	//#endregion
	//#region Implementation
	/** @type {DatabaseStore} */
	#storeAudiolist;
	/**
	 * @returns {Promise<File?>}
	 */
	async #loadRecentAudio() {
		const storeAudiolist = this.#storeAudiolist;
		try {
			const [audioRecent] = Array.import(await storeAudiolist.select(0), `audiolist`);
			if (audioRecent === undefined) return null;
			if (!(audioRecent instanceof File)) throw new TypeError(`Unable to import audiolist due its ${typename(audioRecent)} type`);
			return audioRecent;
		} catch (reason) {
			console.error(reason);
			return null;
		}
	}
	/**
	 * @param {File?} file 
	 * @returns {Promise<boolean>}
	 */
	async #saveRecentAudio(file) {
		const storeAudiolist = this.#storeAudiolist;
		try {
			if (file === null) await storeAudiolist.remove(0);
			else await storeAudiolist.update(new DataPair(0, file));
			return true;
		} catch (reason) {
			console.error(reason);
			return false;
		}
	}
	/** @type {HTMLAudioElement} */
	#audioPlayer;
	/**
	 * @returns {boolean}
	 */
	get markAudioReady() {
		const { dataset } = this.#audioPlayer;
		return (dataset[`ready`] !== undefined);
	}
	/**
	 * @param {boolean} value 
	 * @returns {void}
	 */
	set markAudioReady(value) {
		const { dataset } = this.#audioPlayer;
		if (value) dataset[`ready`] = ``;
		else delete dataset[`ready`];
	}
	/**
	 * @returns {boolean}
	 */
	get markAudioPlaying() {
		const { dataset } = this.#audioPlayer;
		return (dataset[`playing`] !== undefined);
	}
	/**
	 * @param {boolean} value 
	 * @returns {void}
	 */
	set markAudioPlaying(value) {
		if (!this.markAudioReady) return;
		const { dataset } = this.#audioPlayer;
		if (value) dataset[`playing`] = ``;
		else delete dataset[`playing`];
	}
	/**
	 * @param {boolean} value 
	 * @returns {Promise<void>}
	 */
	async #toggleAudioState(value) {
		const audioPlayer = this.#audioPlayer;
		if (value) await audioPlayer.play();
		else audioPlayer.pause();
	}
	/**
	 * @param {number} seconds 
	 * @returns {string}
	 */
	static #toPlaytimeString(seconds) {
		const time = Timespan.viaTime(false, 0, 0, seconds);
		return `${(time.hours * 60 + time.minutes).toString().padStart(2, `0`)}:${(time.seconds).toString().padStart(2, `0`)}`;
	}
	/**
	 * @param {number} seconds 
	 * @returns {string}
	 */
	#toPlaytimeInformation(seconds) {
		const audioPlayer = this.#audioPlayer;
		const current = Controller.#toPlaytimeString(seconds);
		if (Number.isNaN(audioPlayer.duration)) return current;
		return `${current} • ${Controller.#toPlaytimeString(audioPlayer.duration)}`;
	}
	/** @type {HTMLInputElement} */
	#inputPlaybackTime;
	/**
	 * @readonly
	 * @returns {number}
	 */
	get #factorAudioTrack() {
		const inputPlaybackTime = this.#inputPlaybackTime;
		return Number(inputPlaybackTime.value).interpolate(0, Number(inputPlaybackTime.max) - Number(inputPlaybackTime.min));
	}
	/** @type {HTMLDialogElement} */
	#dialogConfigurator;
	/** @type {Keyframe} */
	#keyframeAppear = { opacity: `1` };
	/** @type {Keyframe} */
	#keyframeDisappear = { opacity: `0` };
	/**
	 * @param {boolean} value 
	 * @returns {Promise<void>}
	 */
	async #setConfiguratorActivity(value) {
		const dialogConfigurator = this.#dialogConfigurator;
		const keyframeAppear = this.#keyframeAppear, keyframeDisappear = this.#keyframeDisappear;
		const duration = 50, fill = `both`;

		if (value) {
			dialogConfigurator.show();
			await dialogConfigurator.animate([keyframeDisappear, keyframeAppear], { duration, fill }).finished;
		} else {
			await dialogConfigurator.animate([keyframeAppear, keyframeDisappear], { duration, fill }).finished;
			dialogConfigurator.close();
		}
	}
	/**
	 * @returns {Promise<void>}
	 */
	async #main() {
		//#region Awake
		await Promise.withSignal((signal, resolve, reject) => {
			const scriptVisualizations = document.head.appendChild(document.createElement(`script`));
			scriptVisualizations.type = `module`;
			scriptVisualizations.addEventListener(`load`, event => resolve(null), { signal });
			scriptVisualizations.addEventListener(`error`, event => reject(event.error ?? event.message), { signal });
			scriptVisualizations.src = `../scripts/visualizations.mjs`;
		});

		const storeAudiolist = this.#storeAudiolist = await Database.Store.open(`${navigator.dataPath}`, `Audiolist`);
		const settings = (await ArchiveManager.construct(`${navigator.dataPath}.Settings`, Settings)).content;

		const audioPlayer = this.#audioPlayer = document.getElement(HTMLAudioElement, `audio#player`);
		const canvas = document.getElement(HTMLCanvasElement, `canvas#display`);
		const inputAudioLoader = document.getElement(HTMLInputElement, `input#audio-loader`);

		const divInterface = document.getElement(HTMLDivElement, `div#interface`);
		const buttonAudioDrive = document.getElement(HTMLButtonElement, `button#audio-drive`);
		const buttonOpenConfigurator = document.getElement(HTMLButtonElement, `button#open-configurator`);
		const bPlaybackTime = document.getElement(HTMLElement, `b#playback-time`);
		const inputPlaybackTimeTrack = this.#inputPlaybackTime = document.getElement(HTMLInputElement, `input#playback-time-track`);

		const dialogConfigurator = this.#dialogConfigurator = document.getElement(HTMLDialogElement, `dialog#configurator`);
		const buttonCloseConfigurator = document.getElement(HTMLButtonElement, `button#close-configurator`);
		const inputVisualizerRate = document.getElement(HTMLInputElement, `input#visualizer-rate`);
		const selectVisualizerVisualization = document.getElement(HTMLSelectElement, `select#visualizer-visualization`);
		const inputVisualizationQuality = document.getElement(HTMLInputElement, `input#visualization-quality`);
		const inputVisualizationSmoothing = document.getElement(HTMLInputElement, `input#visualization-smoothing`);
		const inputVisualizationSpread = document.getElement(HTMLInputElement, `input#visualization-spread`);
		const inputVisualizationFocus = document.getElement(HTMLInputElement, `input#visualization-focus`);
		//#endregion
		//#region Subsystem build
		audioPlayer.addEventListener(`loadstart`, async (event) => {
			try {
				await window.load(Promise.withSignal((signal, resolve, reject) => {
					audioPlayer.addEventListener(`canplay`, event => resolve(null), { signal });
					audioPlayer.addEventListener(`error`, event => reject(event.error), { signal });
				}));
				this.markAudioReady = true;
				bPlaybackTime.innerText = this.#toPlaytimeInformation(audioPlayer.currentTime);
			} catch (reason) {
				console.error(reason);
			}
		});
		audioPlayer.addEventListener(`emptied`, (event) => {
			this.markAudioReady = false;
		});
		audioPlayer.addEventListener(`play`, (event) => {
			this.markAudioPlaying = true;
		});
		audioPlayer.addEventListener(`pause`, (event) => {
			this.markAudioPlaying = false;
		});

		let audioRecent = await this.#loadRecentAudio();
		if (audioRecent !== null) {
			audioPlayer.src = URL.createObjectURL(audioRecent);
		}
		window.addEventListener(`beforeunload`, async (event) => {
			if (!await this.#saveRecentAudio(audioRecent)) event.preventDefault();
		});

		const visualizer = Visualizer.build(canvas, audioPlayer);
		visualizer.rate = settings.visualizer.rate;
		visualizer.visualization = settings.visualizer.visualization;
		visualizer.quality = settings.visualizer.configuration.quality;
		visualizer.smoothing = settings.visualizer.configuration.smoothing;
		visualizer.focus = settings.visualizer.configuration.focus;
		visualizer.spread = settings.visualizer.configuration.spread;

		inputAudioLoader.addEventListener(`input`, (event) => {
			try {
				const files = inputAudioLoader.files ?? Error.throws(`Unable to detect files list`);
				const file = files.item(0);
				if (file === null) return;
				audioRecent = file;
				audioPlayer.src = URL.createObjectURL(file);
			} finally {
				inputAudioLoader.value = ``;
			}
		});
		//#endregion
		//#region Interface build
		divInterface.addEventListener(`click`, async (event) => {
			try {
				if (audioPlayer.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) return;
				event.stopImmediatePropagation();
				await this.#toggleAudioState(audioPlayer.paused);
			} catch (error) {
				console.error(error);
			}
		});

		buttonAudioDrive.addEventListener(`click`, (event) => {
			event.stopPropagation();
			if (audioPlayer.readyState !== HTMLMediaElement.HAVE_NOTHING) {
				audioPlayer.removeAttribute(`src`);
				audioPlayer.srcObject = null;
				audioRecent = null;
			} else inputAudioLoader.click();
		});

		buttonOpenConfigurator.addEventListener(`click`, async (event) => {
			event.stopPropagation();
			await this.#setConfiguratorActivity(true);
			settings.isOpenedConfigurator = dialogConfigurator.open;
		});

		audioPlayer.addEventListener(`timeupdate`, (event) => {
			if (document.activeElement === inputPlaybackTimeTrack) return;
			const factor = (Number.isNaN(audioPlayer.duration)
				? 0
				: audioPlayer.currentTime / audioPlayer.duration
			);
			inputPlaybackTimeTrack.value = `${factor * 100}`;
			inputPlaybackTimeTrack.style.setProperty(`--track-value`, `${factor * 100}%`);
			bPlaybackTime.innerText = this.#toPlaytimeInformation(audioPlayer.currentTime);
		});
		inputPlaybackTimeTrack.addEventListener(`pointerup`, (event) => {
			inputPlaybackTimeTrack.blur();
		});
		inputPlaybackTimeTrack.addEventListener(`input`, (event) => {
			if (audioPlayer.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) return;
			const factor = this.#factorAudioTrack;
			inputPlaybackTimeTrack.style.setProperty(`--track-value`, `${factor * 100}%`);
			const time = (Number.isNaN(audioPlayer.duration)
				? 0
				: audioPlayer.duration * factor
			);
			bPlaybackTime.innerText = this.#toPlaytimeInformation(time);
		});
		inputPlaybackTimeTrack.addEventListener(`change`, (event) => {
			if (audioPlayer.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) return;
			const factor = this.#factorAudioTrack;
			inputPlaybackTimeTrack.style.setProperty(`--track-value`, `${factor * 100}%`);
			const time = (Number.isNaN(audioPlayer.duration)
				? 0
				: audioPlayer.duration * factor
			);
			bPlaybackTime.innerText = this.#toPlaytimeInformation(time);
			audioPlayer.currentTime = time;
		});
		//#endregion
		//#region Configurator build
		await this.#setConfiguratorActivity(settings.isOpenedConfigurator);
		buttonCloseConfigurator.addEventListener(`click`, async (event) => {
			await this.#setConfiguratorActivity(false);
			settings.isOpenedConfigurator = dialogConfigurator.open;
		});

		inputVisualizerRate.value = String(visualizer.rate);
		inputVisualizerRate.addEventListener(`change`, (event) => {
			visualizer.rate = Number(inputVisualizerRate.value);
			inputVisualizerRate.value = String(visualizer.rate);
			settings.visualizer.rate = visualizer.rate;
		});

		for (const visualization of Visualizer.visualizations) {
			const option = selectVisualizerVisualization.appendChild(document.createElement(`option`));
			option.value = visualization;
			option.innerText = visualization;
		}
		selectVisualizerVisualization.value = visualizer.visualization;
		selectVisualizerVisualization.addEventListener(`change`, (event) => {
			visualizer.visualization = selectVisualizerVisualization.value;
			settings.visualizer.visualization = visualizer.visualization;

			visualizer.quality = settings.visualizer.configuration.quality;
			inputVisualizationQuality.value = String(visualizer.quality);

			visualizer.smoothing = settings.visualizer.configuration.smoothing;
			inputVisualizationSmoothing.value = String(visualizer.smoothing);

			visualizer.focus = settings.visualizer.configuration.focus;
			inputVisualizationFocus.value = String(visualizer.focus);

			visualizer.spread = settings.visualizer.configuration.spread;
			inputVisualizationSpread.value = String(visualizer.spread);
		});

		inputVisualizationQuality.value = String(visualizer.quality);
		inputVisualizationQuality.addEventListener(`change`, (event) => {
			visualizer.quality = Number(inputVisualizationQuality.value);
			inputVisualizationQuality.value = String(visualizer.quality);
		});
		inputVisualizationQuality.addEventListener(`change`, (event) => {
			settings.visualizer.configuration.quality = visualizer.quality;
		});

		inputVisualizationSmoothing.value = String(visualizer.smoothing);
		inputVisualizationSmoothing.addEventListener(`input`, (event) => {
			visualizer.smoothing = Number(inputVisualizationSmoothing.value);
		});
		inputVisualizationSmoothing.addEventListener(`change`, (event) => {
			settings.visualizer.configuration.smoothing = visualizer.smoothing;
		});

		inputVisualizationFocus.value = String(visualizer.focus);
		inputVisualizationFocus.addEventListener(`input`, (event) => {
			visualizer.focus = Number(inputVisualizationFocus.value);
		});
		inputVisualizationFocus.addEventListener(`change`, (event) => {
			settings.visualizer.configuration.focus = visualizer.focus;
		});

		inputVisualizationSpread.value = String(visualizer.spread);
		inputVisualizationSpread.addEventListener(`input`, (event) => {
			visualizer.spread = Number(inputVisualizationSpread.value);
		});
		inputVisualizationSpread.addEventListener(`change`, (event) => {
			settings.visualizer.configuration.spread = visualizer.spread;
		});
		//#endregion

		window.addEventListener(`keydown`, async (event) => {
			if (event.code === `Space`) {
				event.preventDefault();
				await this.#toggleAudioState(audioPlayer.paused);
			}

			if (event.code === `Tab`) {
				event.preventDefault();
				await this.#setConfiguratorActivity(!dialogConfigurator.open);
				settings.isOpenedConfigurator = dialogConfigurator.open;
			}
		});
	}
	//#endregion
}
//#endregion

Controller.build();
