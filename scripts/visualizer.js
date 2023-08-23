// @ts-ignore
/** @typedef {import("./structure.js")} */
// @ts-ignore
/** @typedef {import("./components/colors.js")} */
// @ts-ignore
/** @typedef {import("./components/measures.js")} */

"use strict";

try {
	//#region Definition
	const audioPlayer = document.querySelector(`audio#player`);
	if (!(audioPlayer instanceof HTMLAudioElement)) {
		throw new TypeError(`Invalid element: ${audioPlayer}`);
	}

	const canvas = document.querySelector(`canvas#visualizer`);
	if (!(canvas instanceof HTMLCanvasElement)) {
		throw new TypeError(`Invalid element: ${canvas}`);
	}

	const context = canvas.getContext(`2d`);
	if (!(context instanceof CanvasRenderingContext2D)) {
		throw new TypeError(`Invalid element: ${context}`);
	}

	const divInterface = document.querySelector(`div#interface`);
	if (!(divInterface instanceof HTMLDivElement)) {
		throw new TypeError(`Invalid element: ${divInterface}`);
	}

	const inputLoader = document.querySelector(`input#loader`);
	if (!(inputLoader instanceof HTMLInputElement)) {
		throw new TypeError(`Invalid element: ${inputLoader}`);
	}

	const aSettings = document.querySelector(`a[href="./settings.html"]`);
	if (!(aSettings instanceof HTMLAnchorElement)) {
		throw new TypeError(`Invalid element: ${aSettings}`);
	}

	const spanTime = document.querySelector(`span#time`);
	if (!(spanTime instanceof HTMLSpanElement)) {
		throw new TypeError(`Invalid element: ${spanTime}`);
	}

	const buttonToggleFullscreen = document.querySelector(`button#toggle-fullscreen`);
	if (!(buttonToggleFullscreen instanceof HTMLButtonElement)) {
		throw new TypeError(`Invalid element: ${buttonToggleFullscreen}`);
	}

	const inputTimeTrack = document.querySelector(`input#time-track`);
	if (!(inputTimeTrack instanceof HTMLInputElement)) {
		throw new TypeError(`Invalid element: ${inputTimeTrack}`);
	}
	//#endregion
	//#region Initialize
	audioPlayer.classList.add(`-paused`);
	audioPlayer.addEventListener(`play`, (event) => {
		audioPlayer.classList.replace(`-paused`, `-playing`);
		visualizer.launched = true;
	});
	audioPlayer.addEventListener(`pause`, (event) => {
		audioPlayer.classList.replace(`-playing`, `-paused`);
		visualizer.launched = false;
	});
	audioPlayer.loop = settings.loop;
	audioPlayer.autoplay = settings.autoplay
	audioPlayer.addEventListener(`loadstart`, (event) => {
		console.log(`a`);
		Manager.load(new Promise((resolve) => {
			audioPlayer.addEventListener(`loadeddata`, (event) => {
				resolve(undefined);
			}, { once: true });
		}));
	});

	canvas.addEventListener(`click`, (event) => {
		if (audioPlayer.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
			audioPlayer.pause();
		}
	});
	const visualizer = new Visualizer(context, audioPlayer);
	visualizer.FPSLimit = Infinity;
	visualizer.quality = settings.quality;
	const duration = 5;

	/**
	 * @param {Number} number 
	 */
	function toTimeString(number) {
		const hours = Math.floor(number / 3600);
		const minutes = Math.floor((number % 3600) / 60);
		const seconds = Math.floor(number % 60);
		const milliseconds = Math.floor((number % 1) * 100);
		return `${hours === 0 ? `` : `${hours.toString().padStart(2, `0`)}:`}${minutes.toString().padStart(2, `0`)}:${seconds.toString().padStart(2, `0`)}`;
	}

	context.translate(canvas.width / 2, canvas.height / 2);
	visualizer.addEventListener(`resize`, (event) => {
		context.translate(canvas.width / 2, canvas.height / 2);
	});
	visualizer.addEventListener(`render`, (event) => {
		spanTime.innerText = `${toTimeString(audioPlayer.currentTime)}`;
		if (!Number.isNaN(audioPlayer.duration)) {
			spanTime.innerText += ` • ${toTimeString(audioPlayer.duration)}`;
		}
		inputTimeTrack.style.setProperty(`--procent-fill`, `${(audioPlayer.currentTime / audioPlayer.duration) * 100}%`);
		//
		if (search.get(`debug`) === `on`) {
			Manager.log({
				[`visualization`]: `${settings.type}`,
				[`frequency length`]: `${visualizer.length} bit`,
				[`quality`]: `${visualizer.quality} level`,
				[`launched`]: `${visualizer.launched}`,
				[`FPS limit`]: `${visualizer.FPSLimit}`,
				[`FPS`]: `${visualizer.FPS.toFixed()}`,
				[`audio time`]: `${audioPlayer.currentTime.toFixed(3)}s`,
				[`audio duration`]: `${audioPlayer.duration.toFixed(3)}s`,
				[`alternating volume`]: `${visualizer.getVolume(Datalist.frequency).toFixed(3)}`,
				[`direct volume`]: `${visualizer.getVolume(Datalist.timeDomain).toFixed(3)}`,
				[`alternating amplitude`]: `${visualizer.getAmplitude(Datalist.frequency).toFixed(3)}`,
				[`direct amplitude`]: `${visualizer.getAmplitude(Datalist.timeDomain).toFixed(3)}`,
				[`possibly bit`]: `${visualizer.isBeat()}`,
				[`cycle duration`]: `${duration.toFixed(3)}s`,
				[`fullscreen`]: `${document.fullscreenElement !== null}`,
				[`autoplay`]: `${settings.autoplay}`,
			});
		}
		//
		switch (settings.type) {
			//#region Spectrogram
			case Visualizations.spectrogram: {
				context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
				//
				const anchor = 0.8;
				const anchorTop = anchor * 2 / 3;
				const anchorBottom = anchorTop + 1 / 3;
				//
				const transform = context.getTransform();
				transform.a = 1 + 0.2 * visualizer.getAmplitude(Datalist.frequency);
				transform.d = 1 + 0.2 * visualizer.getAmplitude(Datalist.timeDomain);
				context.setTransform(transform);
				//#region Foreground
				context.globalCompositeOperation = `source-over`;
				const gradientPath = context.createLinearGradient(-canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2);
				const data = visualizer.getData(Datalist.frequency);
				context.beginPath();
				for (let counter = -canvas.width; counter < canvas.width; counter++) {
					let index = counter;
					if (counter < 0) {
						index = Math.abs(counter) - 1;
					}
					const coefficent = index / canvas.width;
					const datul = data[Math.floor(coefficent * visualizer.length * 0.7)] / 255;
					/** [0 - 1] */ const value = Math.pow(datul, 2) * Math.pow(datul, 1 / 2);
					const size = new Point2D(0, canvas.height * value);
					const position = new Point2D(index - canvas.width / 2, (canvas.height - size.y) * anchor - canvas.height / 2);
					if (counter < 0) {
						context.lineTo(position.x, position.y + size.y);
					} else {
						const highlight = Color.viaHSL(coefficent * 360, 100, 50)
							.rotate(-visualizer.impulse(duration * 1000) * 360 + visualizer.getAmplitude(Datalist.timeDomain) * (360 / duration))
							.illuminate(0.2 + 0.8 * visualizer.getVolume(Datalist.frequency));
						gradientPath.addColorStop(coefficent, highlight.toString());
						context.lineTo(position.x, position.y);
					}
				}
				context.closePath();
				context.fillStyle = gradientPath;
				context.fill();
				//#endregion
				//#region Shadow
				context.globalCompositeOperation = `multiply`;
				const gradientShadow = context.createLinearGradient(canvas.width / 2, -canvas.height / 2, canvas.width / 2, canvas.height / 2);
				const colorShadow = Color.viaRGB(0, 0, 0, 0);
				gradientShadow.addColorStop(anchorTop, colorShadow.toString(ColorFormats.HSL, true));
				colorShadow.alpha = 0.8;
				gradientShadow.addColorStop(anchor, colorShadow.toString(ColorFormats.HSL, true));
				colorShadow.alpha = 0.4;
				gradientShadow.addColorStop(anchorBottom, colorShadow.toString(ColorFormats.HSL, true));
				context.fillStyle = gradientShadow;
				context.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
				//#endregion
			} break;
			//#endregion
			//#region Waveform
			case Visualizations.waveform: {
				context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
				//
				const transform = context.getTransform();
				transform.a = 1 + 0.4 * visualizer.getAmplitude(Datalist.timeDomain);
				transform.d = 1 + 0.4 * visualizer.getAmplitude(Datalist.timeDomain);
				context.setTransform(transform);
				//
				const data = visualizer.getData(Datalist.timeDomain);
				const radius = Math.min(canvas.width, canvas.height) / 2;
				const line = radius / 256;
				context.lineWidth = line;
				//#region Background
				context.globalCompositeOperation = `source-over`;
				const colorBackground = Color.parse(getComputedStyle(document.body).backgroundColor, ColorFormats.RGB)
					.invert();
				context.strokeStyle = colorBackground.toString();
				context.beginPath();
				context.moveTo(-canvas.width / 2, 0);
				for (let index = 0; index < canvas.width; index++) {
					const coefficent = index / canvas.width;
					const datul = data[Math.floor(coefficent * visualizer.length)] / 128 - 1;
					/** [0 - 1] */ const value = datul * visualizer.getVolume(Datalist.frequency);
					const position = new Point2D(
						index - canvas.width / 2,
						(radius / 2) * value
					);
					context.lineTo(position.x, position.y);
				}
				context.lineTo(canvas.width / 2, 0);
				context.stroke();
				//
				const gradientBackgroundShadow = context.createRadialGradient(0, 0, 0, 0, 0, radius);
				gradientBackgroundShadow.addColorStop(0, colorBackground.pass(0).toString(ColorFormats.RGB, true));
				gradientBackgroundShadow.addColorStop(1, colorBackground.pass(0.5).toString(ColorFormats.RGB, true));
				context.fillStyle = gradientBackgroundShadow;
				context.fill();
				//#endregion
				//#region Foreground
				context.globalCompositeOperation = `xor`;
				const colorForeground = Color.BLACK;
				const gradientForegroundPath = context.createConicGradient(0, 0, 0);
				context.beginPath();
				for (let angle = 0; angle < 360; angle++) {
					const coefficent = angle / 360;
					const datul = data[Math.floor(coefficent * visualizer.length)] / 128 - 1;
					/** [0 - 1] */ const value = (0.75 + 0.25 * datul * visualizer.getVolume(Datalist.frequency));
					const distance = radius * value;
					const position = new Point2D(
						distance * Math.sin(coefficent * 2 * Math.PI),
						distance * Math.cos(coefficent * 2 * Math.PI)
					);
					const highlight = Color.viaHSL(coefficent * 360, 100, 50)
						.rotate(-visualizer.impulse(duration * 1000) * 360 + visualizer.getAmplitude(Datalist.timeDomain) * (360 / duration))
						.illuminate(0.2 + 0.8 * visualizer.getVolume(Datalist.frequency));
					gradientForegroundPath.addColorStop(coefficent, highlight.toString(ColorFormats.RGB, true));
					context.lineTo(position.x, position.y);
				}
				context.closePath();
				context.fillStyle = gradientForegroundPath;
				context.fill();
				//
				context.globalCompositeOperation = `destination-out`;
				const gradientForegroundShadow = context.createRadialGradient(0, 0, 0, 0, 0, radius);
				const parts = 2;
				for (let index = 0; index <= parts; index++) {
					const coefficent = index / parts;
					const patency = Math.sqrt(1 - coefficent);
					gradientForegroundShadow.addColorStop(coefficent, colorForeground.pass(patency).toString(ColorFormats.RGB, true));
				}
				context.fillStyle = gradientForegroundShadow;
				context.fill();
				//#endregion
			} break;
			//#endregion
			default: throw new TypeError(`Invalid visualization: '${settings.type}'.`);
		}
	});

	divInterface.addEventListener(`click`, (event) => {
		if (event.eventPhase !== Event.BUBBLING_PHASE && audioPlayer.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA && audioPlayer.paused) {
			audioPlayer.play();
		}
	});

	inputLoader.addEventListener(`input`, async (event) => {
		event.stopPropagation();
		if (!inputLoader.files) {
			throw new ReferenceError(`Files list is empty.`);
		}
		const file = inputLoader.files[0];
		audioPlayer.src = URL.createObjectURL(file);
		// await databasePlaylist.set(`history`, file);
	});

	aSettings.addEventListener(`click`, (event) => {
		event.stopPropagation();
	});

	buttonToggleFullscreen.addEventListener(`click`, async (event) => {
		if (document.fullscreenElement === null) {
			await document.documentElement.requestFullscreen({ navigationUI: `hide` });
		} else {
			await document.exitFullscreen();
		}
	});

	inputTimeTrack.style.setProperty(`--procent-fill`, `${Number(inputTimeTrack.value) * 100}%`);
	inputTimeTrack.addEventListener(`input`, (event) => {
		inputTimeTrack.style.setProperty(`--procent-fill`, `${Number(inputTimeTrack.value) * 100}%`);
	});
	inputTimeTrack.addEventListener(`change`, (event) => {
		audioPlayer.currentTime = Number(inputTimeTrack.value) * audioPlayer.duration;
		visualizer.dispatchEvent(new Event(`render`));
	});
	//#endregion
} catch (exception) {
	Manager.prevent(exception);
}