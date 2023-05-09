// @ts-ignore
/** @typedef {import("./structure")} */
// @ts-ignore
/** @typedef {import("./modules/engine")} */
// @ts-ignore
/** @typedef {import("./modules/animator")} */
// @ts-ignore
/** @typedef {import("./modules/color")} */

"use strict";

try {
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
	/* audioPlayer.addEventListener(`loadeddata`, (event) => {
		audioPlayer.pause();
	}); */
	//#endregion
	//#region Analysis
	const audioContext = new AudioContext();
	const analyser = audioContext.createAnalyser();
	analyser.fftSize = settings.FFTSize;
	const source = audioContext.createMediaElementSource(audioPlayer);
	source.connect(analyser);
	analyser.connect(audioContext.destination);
	const dataFrequency = new Uint8Array(analyser.frequencyBinCount * 0.7);
	const dataTimeDomain = new Uint8Array(analyser.frequencyBinCount * 0.7);
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
		analyser.getByteFrequencyData(dataFrequency);
		analyser.getByteTimeDomainData(dataTimeDomain);
		switch (settings.type) {
			//#region Waveform
			case VisualizerType.waveform: {
				//#region Initialize
				context.clearRect(-canvas.width / 2, -canvas.height, canvas.width, canvas.height);
				const volume = (dataFrequency.reduce((summary, datul) => summary + datul, 0) / dataFrequency.length) / 255;
				const duration = settings.waveformHighlightCycleTime;
				//#endregion
				//#region Background
				const anchor = (settings.waveformReflection ? 0.8 : 1);
				const anchorTop = anchor * 2 / 3;
				const anchorBottom = anchorTop + 1 / 3;
				const gradientBackground = context.createLinearGradient(canvas.width / 2, -canvas.height / 2, canvas.width / 2, canvas.height / 2);
				const background = Color.parse(getComputedStyle(document.body).backgroundColor);
				gradientBackground.addColorStop(anchorTop, background.toString());
				background.lightness /= 4;
				gradientBackground.addColorStop(anchor, background.toString());
				background.lightness *= 2;
				gradientBackground.addColorStop(anchorBottom, background.toString());
				context.fillStyle = gradientBackground;
				context.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
				const transform = context.getTransform();
				transform.a = 1 + 0.1 * volume;
				transform.d = 1 + 0.1 * volume;
				// transform = ((1 + 0.1 * animator.pulse(1000)) * (1 + 0.1 * volume) * Math.PI);
				context.setTransform(transform);
				//#endregion
				//#region Time domain path
				// context.strokeStyle = background.invert().toString();
				// // context.lineWidth = pathWidth;
				// context.beginPath();
				// dataTimeDomain.forEach((datul, index) => {
				// 	/** @type {Coordinate} */ const path = {
				// 		x: (index / dataTimeDomain.length - 0.5) * canvas.width,
				// 		y: (canvas.height / 2) * (datul / 255),
				// 	};
				// 	context.lineTo(path.x, path.y);
				// });
				// context.stroke();
				//#endregion
				//#region Frequency path
				const gapPercentage = settings.waveformGapPercentage;
				const pathWidth = canvas.width / (dataFrequency.length * (1 + gapPercentage) - gapPercentage);
				const pathGap = pathWidth * gapPercentage;
				dataFrequency.forEach((datul, index) => {
					const pathX = (pathWidth + pathGap) * index - canvas.width / 2;
					const pathHeight = canvas.height * (datul / 255);
					const pathY = (canvas.height - pathHeight) * anchor - canvas.height / 2;
					const pathCoefficent = index / dataFrequency.length;
					const isPlayed = (audioPlayer.currentTime / audioPlayer.duration > pathCoefficent);
					const gradient = context.createLinearGradient(pathX, -canvas.height / 2, pathX, canvas.height / 2);
					const highlight = Color.viaHSL(pathCoefficent * 360, 100, 50).rotate(-animator.impulse(duration * 1000) * 360).illuminate(0.2 + 0.8 * volume).rotate(volume * 60);
					if (!isPlayed) {
						highlight.lightness /= 2;
					}
					gradient.addColorStop(anchorTop, highlight.toString());
					highlight.lightness /= 4;
					gradient.addColorStop(anchor, highlight.toString());
					highlight.lightness *= 2;
					gradient.addColorStop(anchorBottom, highlight.toString());
					context.fillStyle = gradient;
					context.fillRect(pathX, pathY, pathWidth, pathHeight);
				});
				//#endregion
			} break;
			//#endregion
			//#region Pulsar
			case VisualizerType.pulsar: {
				context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
				const duration = settings.waveformHighlightCycleTime;
				const volume = (dataFrequency.reduce((summary, datul) => summary + datul, 0) / dataFrequency.length) / 255;
				const radius = Math.min(canvas.width, canvas.height) / 4;
				context.lineWidth = radius / 50;

				dataFrequency.forEach((datul, index) => {
					const angle = (index / dataFrequency.length) * 360;
					const distance = radius * (1 + 0.5 * datul / 255) * (1 + 0.5 * volume);
					const highlight = Color.viaHSL(angle, 100, 50).rotate(-animator.impulse(duration * 1000) * 360).illuminate(0.2 + 0.8 * volume).rotate(volume * 60);
					context.strokeStyle = highlight.toString();

					context.beginPath();
					/** @type {Coordinate} */ const begin = {
						x: distance * Math.sin(angle / 180 * Math.PI),
						y: distance * Math.cos(angle / 180 * Math.PI),
					};
					context.lineTo(begin.x, begin.y);
					/** @type {Coordinate} */ const end = {
						x: distance * Math.sin((angle + 1) / 180 * Math.PI),
						y: distance * Math.cos((angle + 1) / 180 * Math.PI),
					};
					context.lineTo(end.x, end.y);
					context.closePath();
					context.stroke();
				});
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
	divInterface.addEventListener(`click`, (event) => {
		if (event.eventPhase != event.BUBBLING_PHASE && audioPlayer.src && audioPlayer.paused) {
			audioPlayer.play();
		}
	});
	const inputLoader = (/** @type {HTMLInputElement} */ (document.querySelector(`input#loader`)));
	inputLoader.addEventListener(`change`, (event) => {
		event.stopPropagation();
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
