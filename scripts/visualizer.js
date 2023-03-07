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
	// console.log(getComputedStyle(document.documentElement).getPropertyValue(`--color-background`));
	/**
	 * @param {Uint8Array} data 
	 */
	function render(data) {
		//#region Classic
		switch (settings.type) {
			case VisualizerType.classic: {
				const duration = settings.classicHighlightCycleTime;
				const anchor = settings.classicReflection ? 0.8 : 1;
				/* const gradientBackground = context.createLinearGradient(canvas.width / 2, 0, canvas.width / 2, canvas.height);
				const hueBackground = 0;
				const saturationBackground = 0;
				const valueBackground = 10;
				gradientBackground.addColorStop(anchor - Math.abs(anchor - 0) * 1 / 3, Color.viaHSV(hueBackground, saturationBackground, valueBackground).toString());
				gradientBackground.addColorStop(anchor, Color.viaHSV(hueBackground, saturationBackground, valueBackground * 0.25).toString());
				gradientBackground.addColorStop(anchor + Math.abs(anchor - 1) * 1 / 3, Color.viaHSV(hueBackground, saturationBackground, valueBackground * 0.5).toString());
				context.fillStyle = gradientBackground;
				context.fillRect(0, 0, canvas.width, canvas.height); */
				context.clearRect(0, 0, canvas.width, canvas.height);
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
					const hue = Math.floor(((pathCoefficent + (settings.classicHightlightMotion ? timeCoefficent : 0)) * 360) % 361);
					const saturation = 100;
					let lightness = 50;
					if (audioPlayer.currentTime / audioPlayer.duration < pathCoefficent)
						lightness /= 2;
					const highlight = Color.viaHSL(hue, saturation, lightness);
					gradient.addColorStop(anchor - Math.abs(anchor - 0) * 1 / 3, highlight.toString(ColorFormat.RGB));
					highlight.lightness /= 2;
					gradient.addColorStop(anchor, highlight.toString(ColorFormat.RGB));
					highlight.lightness *= 2;
					gradient.addColorStop(anchor + Math.abs(anchor - 1) * 1 / 3, highlight.toString(ColorFormat.RGB));
					context.fillStyle = gradient;
					context.fillRect(pathX, pathY, pathWidth, pathHeight);
				});
			} break;
			default: throw new TypeError(`Invalid visualizer type: '${settings.type}'.`);
		}
		//#endregion
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
