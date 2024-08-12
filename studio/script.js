/** @typedef {import("../scripts/modules/storage.js").DatabaseStore} DatabaseStore */

"use strict";

import { DataPair } from "../scripts/modules/extensions.js";
import { Timespan } from "../scripts/modules/measures.js";
import { Database } from "../scripts/modules/storage.js";
import { Visualizer } from "../scripts/structure.js";

//#region Controller
/**
 * Represents the controller for the application.
 */
class Controller {
	/** @type {DatabaseStore} */
	#storeAudiolist;
	/** @type {HTMLAudioElement} */
	#audioPlayer;
	/**
	 * @returns {boolean}
	 */
	get markAudioReady() {
		return (this.#audioPlayer.dataset[`ready`] !== undefined);
	}
	/**
	 * @param {boolean} value 
	 * @returns {void}
	 */
	set markAudioReady(value) {
		if (value) this.#audioPlayer.dataset[`ready`] = ``;
		else delete this.#audioPlayer.dataset[`ready`];
	}
	/**
	 * @returns {boolean}
	 */
	get markAudioPlaying() {
		return (this.#audioPlayer.dataset[`playing`] !== undefined);
	}
	/**
	 * @param {boolean} value 
	 * @returns {void}
	 */
	set markAudioPlaying(value) {
		if (!this.markAudioReady) return;
		if (value) this.#audioPlayer.dataset[`playing`] = ``;
		else delete this.#audioPlayer.dataset[`playing`];
	}
	/**
	 * @param {number} seconds 
	 * @returns {string}
	 */
	#toPlaytimeString(seconds) {
		const time = Timespan.viaDuration(seconds * 1000);
		return `${(time.hours * 60 + time.minutes).toString().padStart(2, `0`)}:${(time.seconds).toString().padStart(2, `0`)}`;
	}
	/**
	 * @param {number} seconds 
	 * @returns {string}
	 */
	#toPlaytimeInformation(seconds) {
		const audioPlayer = this.#audioPlayer;
		let result = this.#toPlaytimeString(seconds);
		if (Number.isNaN(audioPlayer.duration)) return result;
		return result + ` • ${this.#toPlaytimeString(audioPlayer.duration)}`;
	}
	/** @type {HTMLInputElement} */
	#inputTogglePlaylist;
	/**
	 * @returns {void}
	 */
	#fixTogglePlaylist() {
		this.#inputTogglePlaylist.checked = this.markAudioReady;
	}
	/** @type {HTMLInputElement} */
	#inputTimeTrack;
	/**
	 * @readonly
	 * @returns {number}
	 */
	get #factorAudioTrack() {
		const inputTimeTrack = this.#inputTimeTrack;
		return Number(inputTimeTrack.value).interpolate(0, Number(inputTimeTrack.max) - Number(inputTimeTrack.min));
	}
	/**
	 * Contains the main logic for the application.
	 * @returns {Promise<void>}
	 */
	async main() {
		//#region Initialize
		const storeAudiolist = this.#storeAudiolist = await Database.Store.open(`${navigator.dataPath}`, `Audiolist`);

		const audioPlayer = this.#audioPlayer = document.getElement(HTMLAudioElement, `audio#player`);
		const canvas = document.getElement(HTMLCanvasElement, `canvas#display`);
		const inputLoader = document.getElement(HTMLInputElement, `input#loader`);

		const divInterface = document.getElement(HTMLDivElement, `div#interface`);
		const inputTogglePlaylist = this.#inputTogglePlaylist = document.getElement(HTMLInputElement, `input#toggle-playlist`);
		const spanTime = document.getElement(HTMLSpanElement, `span#time`);
		const buttonToggleFullscreen = document.getElement(HTMLButtonElement, `button#toggle-fullscreen`);
		const inputTimeTrack = this.#inputTimeTrack = document.getElement(HTMLInputElement, `input#time-track`);

		const divConfigurator = document.getElement(HTMLDivElement, `div#configurator`);
		const inputSmoothingFactor = document.getElement(HTMLInputElement, `input#smoothing-factor`);
		const inputMinDecibels = document.getElement(HTMLInputElement, `input#min-decibels`);
		const inputMaxDecibels = document.getElement(HTMLInputElement, `input#max-decibels`);
		//#endregion
		//#region Player
		const autoplay = false;
		audioPlayer.addEventListener(`loadstart`, (event) => window.insure(async () => {
			await window.load(Promise.withSignal((signal, resolve, reject) => {
				audioPlayer.addEventListener(`canplay`, (event) => resolve(null), { signal });
				audioPlayer.addEventListener(`error`, (event) => reject(event.error), { signal });
			}));
			this.markAudioReady = true;
			if (autoplay) await audioPlayer.play();
		}, () => this.#fixTogglePlaylist()));
		audioPlayer.addEventListener(`emptied`, (event) => {
			this.markAudioReady = false;
			this.#fixTogglePlaylist();
		});
		audioPlayer.addEventListener(`play`, (event) => {
			this.markAudioPlaying = true;
		});
		audioPlayer.addEventListener(`pause`, (event) => {
			this.markAudioPlaying = false;
		});

		/** @type {(File | undefined)[]} */
		let [audioRecent] = await storeAudiolist.select(0);
		if (audioRecent !== undefined && !(audioRecent instanceof File)) throw new TypeError(`Invalid recent audiofile type`);
		window.addEventListener(`beforeunload`, async (event) => {
			try {
				await storeAudiolist.update(new DataPair(0, audioRecent));
			} catch (error) {
				event.preventDefault();
			}
		});

		if (audioRecent !== undefined) {
			audioPlayer.src = URL.createObjectURL(audioRecent);
		}
		//#endregion
		//#region Visualizer
		await Promise.withSignal((signal, resolve, reject) => {
			const scriptVisualizations = document.head.appendChild(document.createElement(`script`));
			scriptVisualizations.type = `module`;
			scriptVisualizations.addEventListener(`load`, (event) => resolve(null), { signal });
			scriptVisualizations.addEventListener(`error`, (event) => reject(event.error), { signal });
			scriptVisualizations.src = `../scripts/visualizations.js`;
		});
		const visualizer = await Visualizer.build(canvas, audioPlayer, `Pulsar`);

		window.addEventListener(`keydown`, (event) => {
			if (event.ctrlKey && event.code === `Numpad1`) {
				event.preventDefault();
				visualizer.minDecibels -= 10;
				console.log(`min decibels: ${visualizer.minDecibels}`);
			} else if (event.ctrlKey && event.code === `Numpad3`) {
				event.preventDefault();
				visualizer.minDecibels += 10;
				console.log(`min decibels: ${visualizer.minDecibels}`);
			}

			if (event.ctrlKey && event.code === `Numpad7`) {
				event.preventDefault();
				visualizer.maxDecibels -= 10;
				console.log(`min decibels: ${visualizer.maxDecibels}`);
			} else if (event.ctrlKey && event.code === `Numpad9`) {
				event.preventDefault();
				visualizer.maxDecibels += 10;
				console.log(`min decibels: ${visualizer.maxDecibels}`);
			}

			if (event.ctrlKey && event.code === `Numpad4`) {
				event.preventDefault();
				visualizer.smoothing = (visualizer.smoothing * 10 - 1) / 10;
				console.log(`min decibels: ${visualizer.smoothing}`);
			} else if (event.ctrlKey && event.code === `Numpad6`) {
				event.preventDefault();
				visualizer.smoothing = (visualizer.smoothing * 10 + 1) / 10;
				console.log(`min decibels: ${visualizer.smoothing}`);
			}
		});
		//#endregion
		//#region Loader
		inputLoader.addEventListener(`input`, (event) => {
			const files = inputLoader.files;
			if (files !== null) {
				const file = files.item(0);
				if (file !== null) {
					audioRecent = file;
					audioPlayer.src = URL.createObjectURL(file);
				}
			}
			inputLoader.value = ``;
		});
		//#endregion
		//#region Interface
		divInterface.addEventListener(`click`, async (event) => {
			if (event.eventPhase !== Event.AT_TARGET || audioPlayer.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) return;
			if (audioPlayer.paused) await audioPlayer.play();
			else audioPlayer.pause();
		});

		inputTogglePlaylist.addEventListener(`change`, (event) => {
			inputTogglePlaylist.checked = !inputTogglePlaylist.checked;
			if (inputTogglePlaylist.checked) {
				audioPlayer.removeAttribute(`src`);
				audioPlayer.srcObject = null;
				audioRecent = undefined;
			} else inputLoader.click();
		});

		visualizer.addEventListener(`update`, (event) => {
			spanTime.innerText = this.#toPlaytimeInformation(audioPlayer.currentTime);
		});

		buttonToggleFullscreen.addEventListener(`click`, (event) => window.insure(async () => {
			if (document.fullscreenElement) await document.exitFullscreen();
			else await document.documentElement.requestFullscreen();
		}));

		visualizer.addEventListener(`update`, (event) => {
			const factor = (Number.isNaN(audioPlayer.duration)
				? 0
				: audioPlayer.currentTime / audioPlayer.duration
			);
			inputTimeTrack.value = `${factor * 100}`;
			inputTimeTrack.style.setProperty(`--track-value`, `${factor * 100}%`);
		});
		inputTimeTrack.addEventListener(`input`, (event) => {
			const factor = this.#factorAudioTrack;
			inputTimeTrack.style.setProperty(`--track-value`, `${factor * 100}%`);
			const time = (Number.isNaN(audioPlayer.duration)
				? 0
				: audioPlayer.duration * factor
			);
			spanTime.innerText = this.#toPlaytimeInformation(time);
		});
		inputTimeTrack.addEventListener(`change`, (event) => {
			const factor = this.#factorAudioTrack;
			inputTimeTrack.style.setProperty(`--track-value`, `${factor * 100}%`);
			const time = (Number.isNaN(audioPlayer.duration)
				? 0
				: audioPlayer.duration * factor
			);
			spanTime.innerText = this.#toPlaytimeInformation(time);
			audioPlayer.currentTime = time;
		});
		//#endregion
		//#region Configurator
		window.addEventListener(`keydown`, (event) => {
			if (event.code === `Tab`) {
				event.preventDefault();
				divConfigurator.hidden = !divConfigurator.hidden;
			}
		});

		inputSmoothingFactor.value = String(visualizer.smoothing);
		inputSmoothingFactor.addEventListener(`input`, (event) => window.insure(() => {
			visualizer.smoothing = Number(inputSmoothingFactor.value);
		}));

		inputMinDecibels.value = String(visualizer.minDecibels);
		inputMinDecibels.addEventListener(`input`, (event) => window.insure(() => {
			event.preventDefault();
			let minValue = Number(inputMinDecibels.value);
			if (minValue > visualizer.maxDecibels) minValue = visualizer.maxDecibels;
			visualizer.minDecibels = minValue;
			inputMinDecibels.value = String(minValue);
		}));

		inputMaxDecibels.value = String(visualizer.maxDecibels);
		inputMaxDecibels.addEventListener(`input`, (event) => window.insure(() => {
			event.preventDefault();
			let maxValue = Number(inputMaxDecibels.value);
			if (visualizer.minDecibels > maxValue) maxValue = visualizer.minDecibels;
			visualizer.maxDecibels = maxValue;
			inputMaxDecibels.value = String(maxValue);
		}));
		//#endregion
	}
};
const controller = new Controller();
await window.assert(() => controller.main());
//#endregion
