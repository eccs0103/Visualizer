"use strict";
try {
	const settings = Settings.import(archiveSettings.data);

	//#region Media
	//#region Analysys
	const audioContext = new AudioContext();
	const analyser = audioContext.createAnalyser();
	analyser.fftSize = settings.FFTSize;
	const frequencyData = new Uint8Array(analyser.frequencyBinCount * 0.7);
	const engine = new Engine(() => {
		analyser.getByteFrequencyData(frequencyData);
		render(frequencyData);
	});
	//#endregion
	//#region Player
	const audioPlayer = (/** @type {HTMLAudioElement} */ (document.querySelector(`audio#player`)));
	audioPlayer.loop = settings.loop;
	const source = audioContext.createMediaElementSource(audioPlayer);
	source.connect(analyser);
	analyser.connect(audioContext.destination);
	//
	audioPlayer.addEventListener(`play`, (event) => {
		audioPlayer.classList.toggle(`-playing`, true);
		audioPlayer.classList.toggle(`-paused`, false);
	});
	audioPlayer.addEventListener(`pause`, (event) => {
		audioPlayer.classList.toggle(`-playing`, false);
		audioPlayer.classList.toggle(`-paused`, true);
	});
	audioPlayer.addEventListener(`play`, (event) => {
		engine.launched = true;
	});
	audioPlayer.addEventListener(`pause`, (event) => {
		engine.launched = false;
	});
	//
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
	//#endregion
	//#region Visualize
	const canvas = (/** @type {HTMLCanvasElement} */ (document.querySelector(`canvas#visualizer`)));
	canvas.addEventListener(`click`, (event) => {
		if (audioPlayer.src) {
			audioPlayer.pause();
		}
	});
	const divInterface = (/** @type {HTMLDivElement} */ (document.querySelector(`div#interface`)));
	const inputLoader = (/** @type {HTMLInputElement} */ (document.querySelector(`input#loader`)));
	divInterface.addEventListener(`click`, (event) => {
		if (audioPlayer.src) {
			if (audioPlayer.paused) {
				audioPlayer.play();
			}
		} else {
			inputLoader.click();
		}
	});
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
	/**
	 * @param {Uint8Array} data 
	 */
	function render(data) {
		switch (settings.type) {
			//#region Classic
			case VisualizerType.classic: {
				const duration = settings.classicHighlightCycleTime;
				const anchor = settings.classicReflection ? 0.8 : 1;
				const gradientBackground = context.createLinearGradient(canvas.width / 2, 0, canvas.width / 2, canvas.height);
				const background = Color.parse(getComputedStyle(document.body).backgroundColor);
				gradientBackground.addColorStop(anchor - Math.abs(anchor - 0) * 1 / 3, background.toString());
				background.lightness /= 4;
				gradientBackground.addColorStop(anchor, background.toString());
				background.lightness *= 2;
				gradientBackground.addColorStop(anchor + Math.abs(anchor - 1) * 1 / 3, background.toString());
				context.fillStyle = gradientBackground;
				context.fillRect(0, 0, canvas.width, canvas.height);
				const gapPercentage = settings.classicGapPercentage;
				const pathWidth = canvas.width / (data.length * (1 + gapPercentage) - gapPercentage);
				const pathGap = pathWidth * gapPercentage;
				const timeCoefficent = (engine.time % (duration * 1000)) / (duration * 1000);
				data.forEach((datul, index) => {
					const pathX = (pathWidth + pathGap) * index;
					const pathHeight = canvas.height * (datul / 256);
					const pathY = (canvas.height - pathHeight) * anchor;
					const pathCoefficent = index / data.length;
					const gradient = context.createLinearGradient(pathX, 0, pathX + pathWidth, canvas.height);
					const isPlayed = (audioPlayer.currentTime / audioPlayer.duration > pathCoefficent);
					const highlight = Color.viaHSL(Math.floor((pathCoefficent / 2 + timeCoefficent) * 360 % 361), 100, 50);
					if (!isPlayed) {
						highlight.lightness /= 2;
					}
					gradient.addColorStop(anchor - Math.abs(anchor - 0) * 1 / 3, highlight.toString());
					highlight.lightness /= 4;
					gradient.addColorStop(anchor, highlight.toString());
					highlight.lightness *= 2;
					gradient.addColorStop(anchor + Math.abs(anchor - 1) * 1 / 3, highlight.toString());
					context.fillStyle = gradient;
					context.fillRect(pathX, pathY, pathWidth, pathHeight);
				});
			} break;
			//#endregion
			default: throw new TypeError(`Invalid visualizer type: '${settings.type}'.`);
		}
	}
	//#endregion
	//#endregion
	//#region Uploading
	inputLoader.addEventListener(`change`, (event) => {
		if (!inputLoader.files) {
			throw new ReferenceError(`Files list is empty.`);
		}
		const file = inputLoader.files[0];
		analysys(file, 0);
	});
	//#endregion

	const aSettings = (/** @type {HTMLAnchorElement} */ (document.querySelector(`a[href="./settings.html"]`)));
	aSettings.addEventListener(`click`, (event) => {
		event.stopPropagation();
	});
} catch (exception) {
	Application.prevent(exception);
}
