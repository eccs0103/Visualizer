"use strict";
try {
	const isTest = Application.search.get(`test`) !== undefined;
	const settings = Settings.import(archiveSettings.data);
	const inputLoader = (/** @type {HTMLInputElement} */ (document.querySelector(`input#loader`)));

	//#region Canvas
	const canvas = (/** @type {HTMLCanvasElement} */ (document.querySelector(`canvas#visualizer`)));
	//#region Resize
	function resize() {
		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width;
		canvas.height = rect.height;
	}
	resize();
	window.addEventListener(`resize`, resize);
	//#endregion
	//#region Context
	const context = (() => {
		const contextTemp = canvas.getContext(`2d`);
		if (!contextTemp) {
			throw new ReferenceError(`Element 'contextTemp' isn't defined.`);
		}
		return contextTemp;
	})();
	//#endregion
	//#region Render
	const hightlightMotion = false;
	const duration = settings.highlightCycleTime;
	const anchor = isTest ? 0.8 : 1;
	/**
	 * @param {Uint8Array} data 
	 * @param {Number} time
	 */
	function render(data, time) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		const gapPercentage = settings.gapPercentage;
		const pathWidth = canvas.width / (data.length * (1 + gapPercentage) - gapPercentage);
		const pathGap = pathWidth * gapPercentage;
		const timeCoefficent = (time % (duration * 1000)) / (duration * 1000);
		const darkness = Color.black.toString();
		data.forEach((datul, index) => {
			const pathX = (pathWidth + pathGap) * index;
			const pathHeight = canvas.height * (datul / 256);
			const pathY = (canvas.height - pathHeight) * anchor;
			const pathCoefficent = index / data.length;
			const gradient = context.createLinearGradient(pathX, 0, pathX + pathWidth, canvas.height);
			const hue = (pathCoefficent + (hightlightMotion ? timeCoefficent : 0)) * 360;
			const saturation = 100;
			const value = audioPlayer.currentTime / audioPlayer.duration > pathCoefficent ? 100 : 50;
			gradient.addColorStop(anchor - Math.abs(anchor - 0) * 1 / 3, Color.viaHSV(hue, saturation, value).toString());
			gradient.addColorStop(anchor, Color.viaHSV(hue, saturation, value * 0.25).toString());
			gradient.addColorStop(anchor + Math.abs(anchor - 1) * 1 / 3, Color.viaHSV(hue, saturation, value * 0.5).toString());
			context.fillStyle = gradient;
			context.fillRect(pathX, pathY, pathWidth, pathHeight);
		});
	}
	//#endregion
	//#region Analysys
	const audioContext = new AudioContext();
	const analyser = audioContext.createAnalyser();
	analyser.fftSize = settings.FFTSize;
	const frequencyData = new Uint8Array(analyser.frequencyBinCount * 0.7);
	const engine = new Engine(() => {
		analyser.getByteFrequencyData(frequencyData);
		render(frequencyData, engine.time);
	});
	//#endregion
	//#endregion
	//#region Player
	const audioPlayer = (/** @type {HTMLAudioElement} */ (document.querySelector(`audio#player`)));
	audioPlayer.loop = settings.loop;
	const source = audioContext.createMediaElementSource(audioPlayer);
	source.connect(analyser);
	analyser.connect(audioContext.destination);
	//
	audioPlayer.addEventListener(`play`, (event) => {
		engine.launched = true;
	});
	audioPlayer.addEventListener(`pause`, (event) => {
		engine.launched = false;
	});
	//
	audioPlayer.addEventListener(`play`, (event) => {
		audioPlayer.classList.toggle(`-playing`, true);
		audioPlayer.classList.toggle(`-paused`, false);
	});
	audioPlayer.addEventListener(`pause`, (event) => {
		audioPlayer.classList.toggle(`-playing`, false);
		audioPlayer.classList.toggle(`-paused`, true);
	});
	//
	canvas.addEventListener(`click`, (event) => {
		if (audioPlayer.src) {
			audioPlayer.pause();
		}
	});
	const divInterface = (/** @type {HTMLDivElement} */ (document.querySelector(`div#interface`)));
	divInterface.addEventListener(`click`, (event) => {
		if (audioPlayer.src) {
			if (audioPlayer.paused) {
				audioPlayer.play();
			}
		} else {
			inputLoader.click();
		}
	});
	/* const timer = 1;
	divInterface.addEventListener(`pointerdown`, (event) => {
		event.stopImmediatePropagation();
		const interval = setInterval(() => {
			inputLoader.click();
			clear();
		}, timer * 1000);
		function clear() {
			clearInterval(interval);
			divInterface.removeEventListener(`pointerup`, clear);
			divInterface.removeEventListener(`pointerleave`, clear);
		}
		divInterface.addEventListener(`pointerup`, clear);
		divInterface.addEventListener(`pointerleave`, clear);
	}); */

	/**
	 * @param {Blob} blob 
	 * @param {Number} time 
	 */
	async function analysys(blob, time) {
		const url = URL.createObjectURL(blob);
		audioPlayer.src = url;
		audioPlayer.currentTime = time;
		audioContext.resume();
	}
	//#endregion

	const aSettings = (/** @type {HTMLAnchorElement} */ (document.querySelector(`a[href="./settings.html"]`)));
	aSettings.addEventListener(`click`, (event) => {
		event.stopPropagation();
	});

	//#region Uploading
	inputLoader.addEventListener(`change`, (event) => {
		if (!inputLoader.files) {
			throw new ReferenceError(`Files list is empty.`);
		}
		const file = inputLoader.files[0];
		analysys(file, 0);
	});
	//#endregion

	console.log(`https://github.com/eccs0103/Visualizer/blob/main/resources/Pandocrator%20-%20Ethernal%20(Demo).mp3?raw=true`);
} catch (exception) {
	Application.prevent(exception);
}
