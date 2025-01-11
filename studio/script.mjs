"use strict";

import { Settings, Visualizer } from "../scripts/structure.mjs";

import { } from "../scripts/dom/extensions.mjs";
// import { } from "../scripts/dom/palette.mjs";
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
	 * @param {any} reason 
	 * @returns {Promise<void>}
	 */
	static async #catch(reason) {
		const error = Error.from(reason);
		let message = String(error);
		message += `\n\nAn error occurred. Any further actions may result in errors. To prevent this from happening, would you like to reload?`;
		if (await window.confirmAsync(message)) location.reload();
		throw reason;
	}
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
			await Controller.#catch(reason);
		}
	}
	constructor() {
		if (Controller.#locked) throw new TypeError(`Illegal constructor`);
	}
	//#endregion
	//#region Model
	/**
	 * @returns {Promise<void>}
	 */
	async #buildModel() {
		await Promise.withSignal((signal, resolve, reject) => {
			const scriptVisualizations = document.head.appendChild(document.createElement(`script`));
			scriptVisualizations.type = `module`;
			scriptVisualizations.addEventListener(`load`, event => resolve(null), { signal });
			scriptVisualizations.addEventListener(`error`, event => reject(event.error ?? event.message), { signal });
			scriptVisualizations.src = `../scripts/visualizations.mjs`;
		});

		const settings = this.#settings = (await ArchiveManager.construct(`${navigator.dataPath}.Settings`, Settings)).content;
		const storeAudiolist = this.#storeAudiolist = await Database.Store.open(`${navigator.dataPath}`, `Audiolist`);
	}
	/** @type {Settings} */
	#settings;
	/** @type {DatabaseStore} */
	#storeAudiolist;
	/**
	 * @returns {Promise<File?>}
	 */
	async #getRecentAudio() {
		const storeAudiolist = this.#storeAudiolist;
		try {
			const [file] = Array.import(await storeAudiolist.select(0), `audiolist`);
			if (file === undefined) return null;
			if (!(file instanceof File)) throw new TypeError(`Unable to import audiolist due its ${typename(file)} type`);
			return file;
		} catch (reason) {
			console.error(reason);
			return null;
		}
	}
	/**
	 * @param {File?} file 
	 * @returns {Promise<boolean>}
	 */
	async #setRecentAudio(file) {
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
	//#endregion
	//#region View
	/**
	 * @returns {Promise<void>}
	 */
	async #buildView() {
		const { body } = document;

		const audioPlayer = this.#audioPlayer = body.getElement(HTMLAudioElement, `audio#player`);
		const inputAudioLoader = this.#inputAudioLoader = body.getElement(HTMLInputElement, `input#audio-loader`);
		const canvas = body.getElement(HTMLCanvasElement, `canvas#display`);
		const visualizer = this.#visualizer = new Visualizer(canvas, audioPlayer);

		const divInterface = this.#divInterface = body.getElement(HTMLDivElement, `div#interface`);
		const buttonAudioDrive = this.#buttonAudioDrive = divInterface.getElement(HTMLButtonElement, `button#audio-drive`);
		const buttonOpenConfigurator = this.#buttonOpenConfigurator = divInterface.getElement(HTMLButtonElement, `button#open-configurator`);
		const bPlaybackTime = this.#bPlaybackTime = divInterface.getElement(HTMLElement, `b#playback-time`);
		const inputPlaybackTrack = this.#inputPlaybackTrack = divInterface.getElement(HTMLInputElement, `input#playback-track`);

		const dialogConfigurator = this.#dialogConfigurator = document.getElement(HTMLDialogElement, `dialog#configurator`);
		const buttonCloseConfigurator = this.#buttonCloseConfigurator = dialogConfigurator.getElement(HTMLButtonElement, `button#close-configurator`);
		const inputVisualizerRate = this.#inputVisualizerRate = dialogConfigurator.getElement(HTMLInputElement, `input#visualizer-rate`);
		const selectVisualizerVisualization = this.#selectVisualizerVisualization = dialogConfigurator.getElement(HTMLSelectElement, `select#visualizer-visualization`);
		const inputVisualizationQuality = this.#inputVisualizationQuality = dialogConfigurator.getElement(HTMLInputElement, `input#visualization-quality`);
		const inputVisualizationSmoothing = this.#inputVisualizationSmoothing = dialogConfigurator.getElement(HTMLInputElement, `input#visualization-smoothing`);
		const inputVisualizationSpread = this.#inputVisualizationSpread = dialogConfigurator.getElement(HTMLInputElement, `input#visualization-spread`);
		const inputVisualizationFocus = this.#inputVisualizationFocus = dialogConfigurator.getElement(HTMLInputElement, `input#visualization-focus`);
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
		if (value) dataset[`ready`] = String.empty;
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
		if (value) dataset[`playing`] = String.empty;
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
	/**
	 * @param {File} file 
	 * @returns {Promise<void>}
	 */
	async #insertAudioFile(file) {
		const audioPlayer = this.#audioPlayer;
		await window.load(Promise.withSignal((signal, resolve, reject) => {
			audioPlayer.addEventListener(`canplay`, event => resolve(null), { signal });
			audioPlayer.addEventListener(`error`, event => reject(event.error ?? event.message), { signal });
			audioPlayer.src = URL.createObjectURL(file);
		}));
	}
	/**
	 * @returns {void}
	 */
	#ejectAudioFile() {
		const audioPlayer = this.#audioPlayer;
		audioPlayer.removeAttribute(`src`);
		audioPlayer.srcObject = null;
	}
	/**
	 * @returns {Promise<void>}
	 */
	async #loadRecentAudio() {
		let file = await this.#getRecentAudio();
		if (file === null) return;
		await this.#insertAudioFile(file);
	}
	/**
	 * @param {File?} file 
	 * @returns {Promise<void>}
	 */
	async #saveRecentAudio(file) {
		if (file === null) this.#ejectAudioFile();
		else await this.#insertAudioFile(file);
		await this.#setRecentAudio(file);
	}
	/** @type {HTMLInputElement} */
	#inputAudioLoader;
	/** @type {Visualizer} */
	#visualizer;
	/** @type {HTMLDivElement} */
	#divInterface;
	/** @type {HTMLButtonElement} */
	#buttonAudioDrive;
	/** @type {HTMLButtonElement} */
	#buttonOpenConfigurator;
	/** @type {HTMLElement} */
	#bPlaybackTime;
	/** @type {HTMLInputElement} */
	#inputPlaybackTrack;
	/**
	 * @returns {number}
	 */
	#getPlaybackFactor() {
		const { value, min, max } = this.#inputPlaybackTrack;
		return Number(value).interpolate(Number(min), Number(max));
	}
	/** @type {HTMLDialogElement} */
	#dialogConfigurator;
	/**
	 * @param {string} opacity 
	 * @param {string} easing 
	 * @returns {Keyframe}
	 */
	static #createAppearanceKeyframe(opacity, easing) {
		return { opacity, easing };
	}
	/**
	 * @param {boolean} value 
	 * @returns {Promise<void>}
	 */
	async #setConfiguratorActivity(value) {
		const dialogConfigurator = this.#dialogConfigurator;
		const appear = Controller.#createAppearanceKeyframe(`1`, `ease-in`), disappear = Controller.#createAppearanceKeyframe(`0`, `ease-out`);
		const duration = 50, fill = `both`;

		if (value) {
			dialogConfigurator.show();
			await dialogConfigurator.animate([disappear, appear], { duration, fill }).finished;
		} else {
			await dialogConfigurator.animate([appear, disappear], { duration, fill }).finished;
			dialogConfigurator.close();
		}
	}
	/** @type {HTMLButtonElement} */
	#buttonCloseConfigurator;
	/** @type {HTMLInputElement} */
	#inputVisualizerRate;
	/** @type {HTMLSelectElement} */
	#selectVisualizerVisualization;
	/**
	 * @returns {void}
	 */
	#applyVisualizationSelection() {
		const settings = this.#settings;

		const visualizer = this.#visualizer;

		const selectVisualizerVisualization = this.#selectVisualizerVisualization;
		const inputVisualizationQuality = this.#inputVisualizationQuality;
		const inputVisualizationSmoothing = this.#inputVisualizationSmoothing;
		const inputVisualizationSpread = this.#inputVisualizationSpread;
		const inputVisualizationFocus = this.#inputVisualizationFocus;

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
	}
	/** @type {HTMLInputElement} */
	#inputVisualizationQuality;
	/** @type {HTMLInputElement} */
	#inputVisualizationSmoothing;
	/** @type {HTMLInputElement} */
	#inputVisualizationSpread;
	/** @type {HTMLInputElement} */
	#inputVisualizationFocus;
	/**
	 * @returns {Promise<void>}
	 */
	async #runViewInitialization() {
		const settings = this.#settings;

		const audioPlayer = this.#audioPlayer;
		const inputAudioLoader = this.#inputAudioLoader;
		const visualizer = this.#visualizer;

		const divInterface = this.#divInterface;
		const buttonAudioDrive = this.#buttonAudioDrive;
		const buttonOpenConfigurator = this.#buttonOpenConfigurator;
		const bPlaybackTime = this.#bPlaybackTime;
		const inputPlaybackTrack = this.#inputPlaybackTrack;

		const dialogConfigurator = this.#dialogConfigurator;
		const buttonCloseConfigurator = this.#buttonCloseConfigurator;
		const inputVisualizerRate = this.#inputVisualizerRate;
		const selectVisualizerVisualization = this.#selectVisualizerVisualization;
		const inputVisualizationQuality = this.#inputVisualizationQuality;
		const inputVisualizationSmoothing = this.#inputVisualizationSmoothing;
		const inputVisualizationSpread = this.#inputVisualizationSpread;
		const inputVisualizationFocus = this.#inputVisualizationFocus;

		///

		audioPlayer.addEventListener(`canplay`, (event) => {
			this.markAudioReady = true;
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

		visualizer.rate = settings.visualizer.rate;
		visualizer.visualization = settings.visualizer.visualization;
		visualizer.quality = settings.visualizer.configuration.quality;
		visualizer.smoothing = settings.visualizer.configuration.smoothing;
		visualizer.focus = settings.visualizer.configuration.focus;
		visualizer.spread = settings.visualizer.configuration.spread;

		await this.#loadRecentAudio();
		inputAudioLoader.addEventListener(`input`, async (event) => {
			try {
				const files = Object.suppress(inputAudioLoader.files, `files list`);
				const file = files.item(0);
				if (file === null) return;
				await this.#saveRecentAudio(file);
			} catch (reason) {
				await Controller.#catch(reason);
			} finally {
				bPlaybackTime.innerText = this.#toPlaytimeInformation(audioPlayer.currentTime);
				inputAudioLoader.value = String.empty;
			}
		});

		///

		divInterface.addEventListener(`click`, async (event) => {
			if (audioPlayer.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) return;
			event.stopImmediatePropagation();
			await this.#toggleAudioState(audioPlayer.paused);
		});

		buttonAudioDrive.addEventListener(`click`, async (event) => {
			event.stopPropagation();
			if (audioPlayer.readyState === HTMLMediaElement.HAVE_NOTHING) inputAudioLoader.click();
			else await this.#saveRecentAudio(null);
		});

		buttonOpenConfigurator.addEventListener(`click`, async (event) => {
			event.stopPropagation();
			await this.#setConfiguratorActivity(true);
			settings.isOpenedConfigurator = dialogConfigurator.open;
		});

		audioPlayer.addEventListener(`timeupdate`, (event) => {
			if (document.activeElement === inputPlaybackTrack) return;
			const factor = (audioPlayer.currentTime / audioPlayer.duration).orDefault(0);
			inputPlaybackTrack.value = `${factor * 100}`;
			inputPlaybackTrack.style.setProperty(`--track-value`, `${factor * 100}%`);
			bPlaybackTime.innerText = this.#toPlaytimeInformation(audioPlayer.currentTime);
		});
		inputPlaybackTrack.addEventListener(`pointerup`, event => inputPlaybackTrack.blur());
		inputPlaybackTrack.addEventListener(`input`, (event) => {
			if (audioPlayer.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) return;
			const factor = this.#getPlaybackFactor();
			inputPlaybackTrack.style.setProperty(`--track-value`, `${factor * 100}%`);
			const time = (audioPlayer.duration * factor).orDefault(0);
			bPlaybackTime.innerText = this.#toPlaytimeInformation(time);
		});
		inputPlaybackTrack.addEventListener(`change`, (event) => {
			if (audioPlayer.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) return;
			const factor = this.#getPlaybackFactor();
			inputPlaybackTrack.style.setProperty(`--track-value`, `${factor * 100}%`);
			const time = (audioPlayer.duration * factor).orDefault(0);
			bPlaybackTime.innerText = this.#toPlaytimeInformation(time);
			audioPlayer.currentTime = time;
		});

		///

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
		selectVisualizerVisualization.addEventListener(`change`, event => this.#applyVisualizationSelection());

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
	}
	/**
	 * @returns {Promise<void>}
	 */
	async #runViewKeybindings() {
		const settings = this.#settings;
		const audioPlayer = this.#audioPlayer;
		const dialogConfigurator = this.#dialogConfigurator;
		const selectVisualizerVisualization = this.#selectVisualizerVisualization;

		window.addEventListener(`keydown`, async (event) => {
			if (event.code !== `Space`) return;
			event.preventDefault();
			await this.#toggleAudioState(audioPlayer.paused);
		});

		window.addEventListener(`keydown`, async (event) => {
			if (event.shiftKey || event.code !== `Tab`) return;
			event.preventDefault();
			await this.#setConfiguratorActivity(!dialogConfigurator.open);
			settings.isOpenedConfigurator = dialogConfigurator.open;
		});

		window.addEventListener(`keydown`, async (event) => {
			if (!event.shiftKey || event.code !== `Tab`) return;
			event.preventDefault();
			selectVisualizerVisualization.selectedIndex = (selectVisualizerVisualization.selectedIndex + 1) % selectVisualizerVisualization.length;
			this.#applyVisualizationSelection();
		});
	}
	//#endregion

	/**
	 * @returns {Promise<void>}
	 */
	async #main() {
		await this.#buildModel();

		await this.#buildView();
		await this.#runViewInitialization();
		await this.#runViewKeybindings();
	}
}
//#endregion

Controller.build();
