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
	//#endregion
	//#region Analysis
	const audioContext = new AudioContext();
	const analyser = audioContext.createAnalyser();
	analyser.fftSize = settings.FFTSize;
	const source = audioContext.createMediaElementSource(audioPlayer);
	source.connect(analyser);
	analyser.connect(audioContext.destination);
	/**
	 * @param {Blob} blob 
	 * @param {Number} time 
	 */
	function analysys(blob, time = 0) {
		const url = URL.createObjectURL(blob);
		audioPlayer.src = url;
		audioPlayer.currentTime = time;
		audioContext.resume();
	}
	//#endregion
	//#region Canvas
	const canvas = (/** @type {HTMLCanvasElement} */ (document.querySelector(`canvas#visualizer`)));
	canvas.addEventListener(`click`, (event) => {
		if (audioPlayer.readyState == HTMLMediaElement.HAVE_ENOUGH_DATA) {
			audioPlayer.pause();
		}
	});
	const animator = new Animator(canvas);
	const duration = 6;
	const length = analyser.frequencyBinCount * 0.7;
	const [arrayFrequencyData, arrayTimeDomainData] = [new Uint8Array(length), new Uint8Array(length)];

	//#region Render
	switch (settings.type) {
		//#region Waveform
		case VisualizerType.waveform: {
			const colorBackground = Color.parse(getComputedStyle(document.body).backgroundColor);
			const gapPercentage = 0;
			/** @type {Coordinate} */ const size = {
				x: canvas.width / (length * (1 + gapPercentage) - gapPercentage),
				y: 0,
			};
			const gap = size.x * gapPercentage;
			//
			animator.renderer((context) => {
				analyser.getByteFrequencyData(arrayFrequencyData);
				context.clearRect(-canvas.width / 2, -canvas.height, canvas.width, canvas.height);
				const volume = (arrayFrequencyData.reduce((summary, datul) => summary + datul, 0) / length) / 255;
				//
				const anchor = 0.8 - 0.1 * volume;
				const anchorTop = anchor * 2 / 3;
				const anchorBottom = anchorTop + 1 / 3;
				const gradientBackground = context.createLinearGradient(canvas.width / 2, -canvas.height / 2, canvas.width / 2, canvas.height / 2);
				const colorBackgroundClone = colorBackground.clone();
				gradientBackground.addColorStop(anchorTop, colorBackgroundClone.toString());
				colorBackgroundClone.lightness /= 4;
				gradientBackground.addColorStop(anchor, colorBackgroundClone.toString());
				colorBackgroundClone.lightness *= 2;
				gradientBackground.addColorStop(anchorBottom, colorBackgroundClone.toString());
				context.fillStyle = gradientBackground;
				context.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
				const transform = context.getTransform();
				transform.a = 1 + 0.1 * volume;
				transform.d = 1 + 0.1 * volume;
				transform.b = (animator.pulse(duration * 1000) * (0.1 * volume) * Math.PI / 8);
				context.setTransform(transform);
				//
				arrayFrequencyData.forEach((datul, index) => {
					const coefficent = index / length;
					size.y = canvas.height * (datul / 255);
					/** @type {Coordinate} */ const position = {
						x: (size.x + gap) * index - canvas.width / 2,
						y: (canvas.height - size.y) * anchor - canvas.height / 2,
					};
					const isPlayed = (audioPlayer.currentTime / audioPlayer.duration > coefficent);
					const gradientPath = context.createLinearGradient(position.x, -canvas.height / 2, position.x, canvas.height / 2);
					const highlight = Color.viaHSL(coefficent * 360, 100, 50).rotate(-animator.impulse(duration * 1000) * 360).illuminate(0.2 + 0.8 * volume).rotate(volume * (360 / duration));
					if (!isPlayed) {
						highlight.lightness /= 2;
					}
					gradientPath.addColorStop(anchorTop, highlight.toString());
					highlight.lightness /= 4;
					gradientPath.addColorStop(anchor, highlight.toString());
					highlight.lightness *= 2;
					gradientPath.addColorStop(anchorBottom, highlight.toString());
					context.fillStyle = gradientPath;
					context.fillRect(position.x, position.y, size.x, size.y);
				});
			});
		} break;
		//#endregion
		//#region Pulsar
		case VisualizerType.pulsar: {
			const background = Color.parse(getComputedStyle(document.body).backgroundColor);
			//
			animator.renderer((context) => {
				analyser.getByteTimeDomainData(arrayTimeDomainData);
				context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
				const radius = Math.min(canvas.width, canvas.height) / 4;
				const volume = (arrayTimeDomainData.reduce((summary, datul) => summary + datul, 0) / length) / 255;
				context.lineWidth = canvas.width / settings.FFTSize;
				//
				context.strokeStyle = background.invert().toString();
				context.beginPath();
				arrayTimeDomainData.forEach((datul, index) => {
				/** @type {Coordinate} */ const position = {
						x: (index / length - 0.5) * canvas.width,
						y: (((datul / 255) - 0.5) * Math.pow(volume, 4)) * canvas.height,
					};
					context.lineTo(position.x, position.y);
				});
				context.stroke();
				//
				const gradientPath = context.createConicGradient(0, 0, 0);
				context.beginPath();
				arrayTimeDomainData.forEach((datul, index) => {
					const coefficent = index / length;
					const distance = radius * (1 + 1 * (datul / 255) * Math.pow(volume, 2));
					const highlight = Color.viaHSL(coefficent * 360, 100, 50).rotate(-animator.impulse(duration * 1000) * 360).illuminate(0.2 + 0.8 * volume).rotate(volume * (360 / duration));
					gradientPath.addColorStop(coefficent, highlight.toString());
					/** @type {Coordinate} */ const position = {
						x: distance * Math.sin(coefficent * 2 * Math.PI),
						y: distance * Math.cos(coefficent * 2 * Math.PI),
					};
					context.lineTo(position.x, position.y);
				});
				context.closePath();
				context.strokeStyle = gradientPath;
				context.stroke();
			});
		} break;
		//#endregion
		default: throw new TypeError(`Invalid visualizer type: '${settings.type}'.`);
	}
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
		if (event.eventPhase != Event.BUBBLING_PHASE && audioPlayer.readyState == HTMLMediaElement.HAVE_ENOUGH_DATA && audioPlayer.paused) {
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
		analysys(file);
	});

	const aSettings = (/** @type {HTMLAnchorElement} */ (document.querySelector(`a[href="./settings.html"]`)));
	aSettings.addEventListener(`click`, (event) => {
		event.stopPropagation();
	});
	//#endregion
} catch (exception) {
	Application.prevent(exception);
}