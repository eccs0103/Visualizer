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
			//#region Waveform
			case VisualizerType.waveform: {
				/* const [hours, minutes, seconds] = (() => {
					const seconds = animator.time / 1000;
					const minutes = seconds / 60;
					const hours = minutes / 60;
					return [Math.floor(hours), Math.floor(minutes % 60), Math.floor(seconds % 60)];
				})(); */
				const [volume, minAmplitude, maxAmplitude, averageAmplitude] = (() => {
					let summary = 0, min = data[0], max = data[0];
					data.forEach((datul) => {
						summary += datul;
						if (datul < min) min = datul;
						if (datul > max) max = datul;
					});
					const volume = (summary / data.length) / 255;
					const minAmplitude = (min) / 255;
					const maxAmplitude = (max) / 255;
					const averageAmplitude = maxAmplitude - minAmplitude;
					//const decibels = 20 * Math.log10(averageAmplitude / 32767);
					return [volume, minAmplitude, maxAmplitude, averageAmplitude];
				})();
				// const a = animator.pulse(1000) * (averageAmplitude - maxAmplitude) * Math.PI / 72;
				// context.setTransform(1 + 0.2 * volume, a, 0, 1, a, 0);
				const duration = settings.waveformHighlightCycleTime;
				const anchor = (settings.waveformReflection ? 0.75 : 1) * (1 + 0.1 * volume);
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
				const gapPercentage = settings.waveformGapPercentage;
				const pathWidth = canvas.width / (data.length * (1 + gapPercentage) - gapPercentage);
				const pathGap = pathWidth * gapPercentage;
				data.forEach((datul, index) => {
					const pathX = (pathWidth + pathGap) * index;
					const pathHeight = canvas.height * (datul / 255);
					const pathY = (canvas.height - pathHeight) * anchor;
					const pathCoefficent = index / data.length;
					const isPlayed = (audioPlayer.currentTime / audioPlayer.duration > pathCoefficent);
					const gradient = context.createLinearGradient(pathX, 0, pathX, canvas.height);
					const highlight = Color.viaHSL(pathCoefficent * 360, 100, 50).rotate(-animator.impulse(duration * 1000) * 360).illuminate(volume);
					// highlight.alpha = volume;
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
				// context.save();
				// context.translate(canvas.width / 2, canvas.height / 2);
				// context.setTransform(1 + 0.2 * volume, 0, 0, 1 + 0.2 * volume, 0, 0);
				// context.restore();
			} break;
			//#endregion
			//#region Pulsar
			case VisualizerType.pulsar: {
				const volume = data.reduce((summary, datul) => summary + datul, 0) / data.length / 255;
				/**
				 * @typedef Coordinate
				 * @property {Number} x
				 * @property {Number} y
				 */
				const radius = Math.min(canvas.width, canvas.height) / 2;
				const diameter = 2 * radius;
				/** @type {Coordinate} */ const center = { x: canvas.width / 2, y: canvas.height / 2 };
				const imageData = context.createImageData(diameter, diameter);
				const pixels = imageData.data;
				const duration = settings.waveformHighlightCycleTime;
				for (let index = 0; index < diameter * diameter; index++) {
					/** @type {Coordinate} */ const position = { x: index % diameter - radius, y: Math.floor(index / diameter) - radius };
					const channel = (index % diameter) * diameter * 4 + Math.floor(index / diameter) * 4;
					const distance = Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2));
					const angle = (() => {
						let angle = Math.atan2(position.y, -position.x) * 180 / Math.PI;
						if (angle < 0) {
							angle += 360;
						}
						return angle;
					})();
					const datul = data[Math.floor(data.length * angle / 360)];
					if (distance <= radius * datul / 255) {
						const highlight = Color.viaHSL(angle, distance / radius * 50 + 50, 50).rotate(-animator.impulse(duration * 1000) * 360).illuminate(volume);
						pixels[channel] = highlight.red;
						pixels[channel + 1] = highlight.green;
						pixels[channel + 2] = highlight.blue;
						pixels[channel + 3] = 255;
					}
				}
				context.putImageData(imageData, center.x - radius, center.y - radius);
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
