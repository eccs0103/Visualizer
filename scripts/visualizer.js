"use strict";
try {
	const settings = Settings.import(archiveSettings.data);

	//#region Player
	const audioPlayer = (/** @type {HTMLAudioElement} */ (document.querySelector(`audio#player`)));
	audioPlayer.loop = settings.loop;
	audioPlayer.addEventListener(`play`, (event) => {
		audioPlayer.classList.toggle(`-playing`, true);
		audioPlayer.classList.toggle(`-paused`, false);
	});
	audioPlayer.addEventListener(`pause`, (event) => {
		audioPlayer.classList.toggle(`-playing`, false);
		audioPlayer.classList.toggle(`-paused`, true);
	});
	//#endregion
	//#region Analysis
	const audioContext = new AudioContext();
	const analyser = audioContext.createAnalyser();
	analyser.fftSize = settings.FFTSize;
	const source = audioContext.createMediaElementSource(audioPlayer);
	source.connect(analyser);
	analyser.connect(audioContext.destination);
	const data = new Uint8Array(analyser.frequencyBinCount * 0.7);
	/**
	 * @param {Blob} blob 
	 * @param {Number} time 
	 */
	function analysys(blob, time) {
		const url = URL.createObjectURL(blob);
		audioPlayer.src = url;
		audioPlayer.currentTime = time;
		audioContext.resume();
	}
	//#endregion
	//#region Canvas
	const canvas = (/** @type {HTMLCanvasElement} */ (document.querySelector(`canvas#visualizer`)));
	canvas.addEventListener(`click`, (event) => {
		if (audioPlayer.src) {
			audioPlayer.pause();
		}
	});
	const animator = new Animator(canvas);
	//#region Render
	animator.renderer((context) => {
		analyser.getByteFrequencyData(data);
		switch (settings.type) {
			//#region Classic
			case VisualizerType.classic: {
				const [hours, minutes, seconds] = (() => {
					const seconds = animator.time / 1000;
					const minutes = seconds / 60;
					const hours = minutes / 60;
					return [Math.floor(hours), Math.floor(minutes % 60), Math.floor(seconds % 60)];
				})();
				const [volume, amplitude, maxAmplitude, maxAmplitudeDecibels] = (() => {
					let volumeSummary = 0;
					let min = data[0], max = data[0];
					data.forEach((datul) => {
						volumeSummary += datul;
						if (datul < min) {
							min = datul;
						}
						if (datul > max) {
							max = datul;
						}
					});
					const volume = (volumeSummary / data.length) / 255;
					const amplitude = (max - min) / 255;
					const maxAmplitude = max / 255;
					const maxAmplitudeDecibels = 20 * Math.log10(maxAmplitude / 32767);
					return [volume, amplitude, maxAmplitude, maxAmplitudeDecibels];
				})();
				const duration = settings.classicHighlightCycleTime;
				const anchor = settings.classicReflection ? 0.8 : 1;
				const anchorTop = anchor * 2 / 3;
				const anchorBottom = anchorTop + 1 / 3;
				const gradientBackground = context.createLinearGradient(canvas.width / 2, 0, canvas.width / 2, canvas.height);
				const background = Color.parse(getComputedStyle(document.body).backgroundColor);
				gradientBackground.addColorStop(anchorTop, background.toString());
				background.lightness /= 4;
				gradientBackground.addColorStop(anchor, background.toString());
				background.lightness *= 2;
				gradientBackground.addColorStop(anchorBottom, background.toString());
				context.fillStyle = gradientBackground;
				context.fillRect(0, 0, canvas.width, canvas.height);
				const gapPercentage = settings.classicGapPercentage;
				const pathWidth = canvas.width / (data.length * (1 + gapPercentage) - gapPercentage);
				const pathGap = pathWidth * gapPercentage;
				const timeCoefficent = (animator.time % (duration * 1000)) / (duration * 1000);
				data.forEach((datul, index) => {
					const pathX = (pathWidth + pathGap) * index;
					const pathHeight = canvas.height * (datul / 255) * amplitude;
					const pathY = (canvas.height - pathHeight) * anchor;
					const pathCoefficent = index / data.length;
					const isPlayed = (audioPlayer.currentTime / audioPlayer.duration > pathCoefficent);
					const gradient = context.createLinearGradient(pathX, 0, pathX, canvas.height);
					const highlight = Color.viaHSL(Math.floor((pathCoefficent / 2 + timeCoefficent) * 360 % 361), 100, 50);
					if (!isPlayed) {
						highlight.lightness /= Math.sqrt(8);
					}
					gradient.addColorStop(anchorTop, highlight.toString());
					highlight.lightness /= 4;
					gradient.addColorStop(anchor, highlight.toString());
					highlight.lightness *= 2;
					gradient.addColorStop(anchorBottom, highlight.toString());
					context.fillStyle = gradient;
					context.fillRect(pathX, pathY, pathWidth, pathHeight);
				});
				// Application.debug(
				// 	`Time: ${hours == 0 ? `` : `${hours.toFixed().replace(/^(?!.{2})/, `0`)}:`}${minutes.toFixed().replace(/^(?!.{2})/, `0`)}:${seconds.toFixed().replace(/^(?!.{2})/, `0`)}`,
				// 	`FPS: ${animator.FPS.toFixed(2)}`,
				// 	`Volume: ${volume.toFixed(2)}`,
				// 	`Amplitude: ${amplitude.toFixed(2)}`,
				// 	`Max Amplitude: ${maxAmplitude.toFixed(2)}`,
				// 	`Max Amplitude Decibels: ${maxAmplitudeDecibels.toFixed(2)}`,
				// );
			} break;
			//#endregion
			default: throw new TypeError(`Invalid visualizer type: '${settings.type}'.`);
		}
	});
	//#endregion
	audioPlayer.addEventListener(`play`, (event) => {
		animator.launched = true;
	});
	audioPlayer.addEventListener(`pause`, (event) => {
		animator.launched = false;
	});
	//#endregion
	//#region Interface
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
