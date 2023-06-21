// @ts-ignore
/** @typedef {import("./structure.js")} */
// @ts-ignore
/** @typedef {import("./modules/color.js")} */
// @ts-ignore
/** @typedef {import("./modules/coordinate.js")} */

"use strict";

try {
	const search = Application.search;
	//#region Player
	class MyAudioElement extends HTMLAudioElement {
		constructor() {
			super();
			this.classList.add(`-paused`);
			this.addEventListener(`play`, (event) => {
				this.classList.replace(`-paused`, `-playing`);
			});
			this.addEventListener(`pause`, (event) => {
				this.classList.replace(`-playing`, `-paused`);
			});
		}
	}
	customElements.define(`my-audio`, MyAudioElement, { extends: `audio` });

	const audioPlayer = (/** @type {MyAudioElement} */ (document.querySelector(`audio#player`)));
	audioPlayer.loop = settings.loop;

	/**
	 * @param {Number} number 
	 */
	function toTimeString(number) {
		const hours = Math.floor(number / 3600);
		const minutes = Math.floor((number % 3600) / 60);
		const seconds = Math.floor(number % 60);
		const milliseconds = Math.floor((number % 1) * 100);
		return `${hours == 0 ? `` : `${hours.toString().padStart(2, `0`)}:`}${minutes.toString().padStart(2, `0`)}:${seconds.toString().padStart(2, `0`)}`;
	}
	//#endregion
	//#region Interface
	const divInterface = (/** @type {HTMLDivElement} */ (document.querySelector(`div#interface`)));
	divInterface.addEventListener(`click`, (event) => {
		if (event.eventPhase != Event.BUBBLING_PHASE && audioPlayer.readyState == HTMLMediaElement.HAVE_ENOUGH_DATA && audioPlayer.paused) {
			audioPlayer.play();
		}
	});

	const inputLoader = (/** @type {HTMLInputElement} */ (document.querySelector(`input#loader`)));
	inputLoader.addEventListener(`input`, async (event) => {
		event.stopPropagation();
		if (!inputLoader.files) {
			throw new ReferenceError(`Files list is empty.`);
		}
		const file = inputLoader.files[0];
		audioPlayer.src = URL.createObjectURL(file);
		// await databasePlaylist.set(`history`, file);
		if (settings.autoFullscreen) {
			document.documentElement.requestFullscreen({ navigationUI: `hide` });
		}
	});

	const aSettings = (/** @type {HTMLAnchorElement} */ (document.querySelector(`a[href="./settings.html"]`)));
	aSettings.addEventListener(`click`, (event) => {
		event.stopPropagation();
	});

	const spanTime = (/** @type {HTMLSpanElement} */ (document.querySelector(`span#time`)));

	const buttonToggleFullscreen = (/** @type {HTMLButtonElement} */ (document.querySelector(`button#toggle-fullscreen`)));
	buttonToggleFullscreen.addEventListener(`click`, async (event) => {
		if (document.fullscreenElement == null) {
			await document.documentElement.requestFullscreen({ navigationUI: `hide` });
		} else {
			await document.exitFullscreen();
		}
	});

	// void async function () {
	// 	const history = await databasePlaylist.get(`history`);
	// 	if (history !== undefined) {
	// 		audioPlayer.src = URL.createObjectURL(history);
	// 	}
	// }();

	const inputTimeTrack = (/** @type {HTMLInputElement} */ (document.querySelector(`input#time-track`)));
	inputTimeTrack.style.setProperty(`--procent-fill`, `${Number(inputTimeTrack.value) * 100}%`);
	inputTimeTrack.addEventListener(`input`, (event) => {
		inputTimeTrack.style.setProperty(`--procent-fill`, `${Number(inputTimeTrack.value) * 100}%`);
	});
	inputTimeTrack.addEventListener(`change`, (event) => {
		audioPlayer.currentTime = Number(inputTimeTrack.value) * audioPlayer.duration;
	});
	//#endregion
	//#region Canvas
	const canvas = (/** @type {HTMLCanvasElement} */ (document.querySelector(`canvas#visualizer`)));
	canvas.addEventListener(`click`, (event) => {
		if (audioPlayer.readyState == HTMLMediaElement.HAVE_ENOUGH_DATA) {
			audioPlayer.pause();
		}
	});
	//
	const visualizer = new Visualizer(canvas, audioPlayer);
	visualizer.FPSLimit = 120;
	visualizer.quality = settings.quality;
	const duration = 5;
	//
	visualizer.renderer((context) => {
		spanTime.innerText = `${toTimeString(audioPlayer.currentTime)}`;
		if (!Number.isNaN(audioPlayer.duration)) {
			spanTime.innerText += ` • ${toTimeString(audioPlayer.duration)}`;
		}
		inputTimeTrack.style.setProperty(`--procent-fill`, `${(audioPlayer.currentTime / audioPlayer.duration) * 100}%`);
		//
		if (search.get(`debug`) === `on`) {
			Application.debug({
				[`visualizer type`]: `${settings.type}`,
				[`frequency length`]: `${visualizer.length} bit`,
				[`quality`]: `${visualizer.quality} level`,
				[`launched`]: `${visualizer.launched}`,
				[`was launched`]: `${visualizer.wasLaunched}`,
				[`FPS limit`]: `${visualizer.FPSLimit}`,
				[`FPS`]: `${visualizer.FPS.toFixed()}`,
				[`audio time`]: `${(visualizer.time / 1000).toFixed(3)}s`,
				[`audio duration`]: `${audioPlayer.duration.toFixed(3)}s`,
				[`alternating volume`]: `${visualizer.getVolume(DataType.frequency).toFixed(3)}`,
				[`direct volume`]: `${visualizer.getVolume(DataType.timeDomain).toFixed(3)}`,
				[`alternating amplitude`]: `${visualizer.getAmplitude(DataType.frequency).toFixed(3)}`,
				[`direct amplitude`]: `${visualizer.getAmplitude(DataType.timeDomain).toFixed(3)}`,
				[`possibly bit`]: `${visualizer.isBeat()}`,
				[`cycle duration`]: `${duration.toFixed(3)}s`,
				[`fullscreen`]: `${document.fullscreenElement !== null}`,
				[`auto fullscreen`]: `${settings.autoFullscreen}`,
			});
		}
		//
		switch (settings.type) {
			//#region Spectrogram
			case VisualizerType.spectrogram: {
				context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
				//
				const anchor = 0.8 - 0.1 * visualizer.getAmplitude();
				const anchorTop = anchor * 2 / 3;
				const anchorBottom = anchorTop + 1 / 3;
				const gradientBackground = context.createLinearGradient(canvas.width / 2, -canvas.height / 2, canvas.width / 2, canvas.height / 2);
				const colorBackground = Color.parse(getComputedStyle(document.body).backgroundColor, ColorFormat.RGB);
				gradientBackground.addColorStop(anchorTop, colorBackground.toString());
				colorBackground.lightness /= 4;
				gradientBackground.addColorStop(anchor, colorBackground.toString());
				colorBackground.lightness *= 2;
				gradientBackground.addColorStop(anchorBottom, colorBackground.toString());
				context.fillStyle = gradientBackground;
				context.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
				//
				const transform = context.getTransform();
				transform.a = 1 + 0.2 * visualizer.getAmplitude();
				transform.d = 1 + 0.2 * visualizer.getAmplitude();
				transform.b = (visualizer.pulse(duration * 1000) * (0.2 * visualizer.getAmplitude()) * Math.PI / 16);
				context.setTransform(transform);
				//
				const data = visualizer.getData(DataType.frequency);
				for (let index = 0; index < canvas.width; index++) {
					const coefficent = index / canvas.width;
					const datul = data[Math.floor(coefficent * visualizer.length)] / 255;
					const size = new Coordinate(0, canvas.height * datul);
					const position = new Coordinate(index - canvas.width / 2, (canvas.height - size.y) * anchor - canvas.height / 2);
					const gradientPath = context.createLinearGradient(position.x, -canvas.height / 2, position.x, canvas.height / 2);
					const highlight = Color.viaHSL(coefficent * 360, 100, 50)
						.rotate(-visualizer.impulse(duration * 1000) * 360 + visualizer.getAmplitude() * (360 / duration))
						.illuminate(0.2 + 0.8 * visualizer.getVolume(DataType.frequency));
					gradientPath.addColorStop(anchorTop, highlight.toString());
					highlight.lightness /= 4;
					gradientPath.addColorStop(anchor, highlight.toString());
					highlight.lightness *= 2;
					gradientPath.addColorStop(anchorBottom, highlight.toString());
					context.fillStyle = gradientPath;
					context.fillRect(position.x, position.y, 1, size.y);
				}
			} break;
			//#endregion
			//#region Waveform
			case VisualizerType.waveform: {
				context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
				//
				const transform = context.getTransform();
				transform.a = 1 + 0.4 * visualizer.getAmplitude();
				transform.d = 1 + 0.4 * visualizer.getAmplitude();
				context.setTransform(transform);
				//
				const data = visualizer.getData(DataType.timeDomain);
				const radius = Math.min(canvas.width, canvas.height) / 2;
				context.lineWidth = radius / 256;
				//
				const colorBackground = Color.parse(getComputedStyle(document.body).backgroundColor, ColorFormat.RGB);
				context.fillStyle = colorBackground
					.invert()
					.illuminate(0.2 + 0.8 * visualizer.getVolume(DataType.frequency))
					.toString();
				context.beginPath();
				for (let index = 0; index < canvas.width; index++) {
					const coefficent = index / canvas.width;
					const datul = data[Math.floor(coefficent * visualizer.length)] / 128 - 1;
					const position = new Coordinate(
						index - canvas.width / 2,
						(radius / 2) * (datul) * (visualizer.getVolume(DataType.timeDomain))
					);
					context.lineTo(position.x, position.y);
				}
				context.fill();
				//
				const gradientPath = context.createConicGradient(0, 0, 0);
				context.beginPath();
				for (let angle = 0; angle < 360; angle++) {
					const coefficent = angle / 360;
					const datul = data[Math.floor(coefficent * visualizer.length)] / 128 - 1;
					const distance = (radius) * (0.6 + 0.2 * (datul) * (visualizer.getVolume(DataType.timeDomain)));
					const position = new Coordinate(
						distance * Math.sin(coefficent * 2 * Math.PI),
						distance * Math.cos(coefficent * 2 * Math.PI)
					);
					const highlight = Color.viaHSL(coefficent * 360, 100, 50)
						.rotate(-visualizer.impulse(duration * 1000) * 360 + visualizer.getAmplitude() * (360 / duration))
						.illuminate(0.2 + 0.8 * visualizer.getVolume(DataType.frequency));
					gradientPath.addColorStop(coefficent, highlight.toString(ColorFormat.RGB, true));
					context.lineTo(position.x, position.y);
				}
				context.closePath();
				context.strokeStyle = gradientPath;
				context.stroke();
			} break;
			//#endregion
			default: throw new TypeError(`Invalid visualizer type: '${settings.type}'.`);
		}
	});
	//
	audioPlayer.addEventListener(`play`, (event) => {
		visualizer.launched = true;
	});
	audioPlayer.addEventListener(`pause`, (event) => {
		visualizer.launched = false;
		visualizer.invoke();
	});
	//#endregion
} catch (exception) {
	Application.prevent(exception);
}