// @ts-ignore
/** @typedef {import("./structure.js")} */
// @ts-ignore
/** @typedef {import("./components/colors.js")} */
// @ts-ignore
/** @typedef {import("./components/measures.js")} */
// @ts-ignore
/** @typedef {import("./components/timespan.js")} */

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

	const divInformation = document.querySelector(`div#information`);
	if (!(divInformation instanceof HTMLDivElement)) {
		throw new TypeError(`Invalid element: ${divInformation}`);
	}

	const h1MediaTitle = document.querySelector(`h1#media-title`);
	if (!(h1MediaTitle instanceof HTMLHeadingElement)) {
		throw new TypeError(`Invalid element: ${h1MediaTitle}`);
	}

	const h3MediaAuthor = document.querySelector(`h3#media-author`);
	if (!(h3MediaAuthor instanceof HTMLHeadingElement)) {
		throw new TypeError(`Invalid element: ${h3MediaAuthor}`);
	}
	//#endregion
	//#region Initialize
	audioPlayer.loop = settings.loop;
	audioPlayer.autoplay = settings.autoplay;
	audioPlayer.addEventListener(`play`, (event) => {
		audioPlayer.dataset[`playing`] = ``;
		visualizer.launched = true;
	});
	audioPlayer.addEventListener(`pause`, (event) => {
		delete audioPlayer.dataset[`playing`];
		visualizer.launched = false;
		visualizer.dispatchEvent(new Event(`render`));
	});
	audioPlayer.addEventListener(`canplay`, (event) => {
		audioPlayer.dataset[`ready`] = ``;
	});
	audioPlayer.addEventListener(`emptied`, (event) => {
		delete audioPlayer.dataset[`ready`];
	});
	audioPlayer.addEventListener(`loadstart`, async (event) => {
		await Manager.load(new Promise((resolve, reject) => {
			audioPlayer.addEventListener(`loadeddata`, (event) => {
				resolve(undefined);
			}, { once: true });
			audioPlayer.addEventListener(`error`, (event) => {
				reject(event.error);
			}, { once: true });
		}));
		visualizer.dispatchEvent(new Event(`render`));
	});

	canvas.addEventListener(`click`, (event) => {
		if (audioPlayer.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
			audioPlayer.pause();
		}
	});

	const visualizer = new Visualizer(context, audioPlayer);
	const timespanCurrent = Timespan.viaDuration(audioPlayer.currentTime * 1000);
	const timespanDuration = Timespan.viaDuration(audioPlayer.duration * 1000);
	context.translate(canvas.width / 2, canvas.height / 2);
	visualizer.addEventListener(`resize`, (event) => {
		context.translate(canvas.width / 2, canvas.height / 2);
	});
	visualizer.addEventListener(`render`, (event) => {
		timespanCurrent.duration = audioPlayer.currentTime * 1000;
		timespanDuration.duration = audioPlayer.duration * 1000;
		spanTime.innerText = `${(timespanCurrent.hours * 60 + timespanCurrent.minutes).toString().padStart(2, `0`)}:${(timespanCurrent.seconds).toString().padStart(2, `0`)}`;
		if (!Number.isNaN(timespanDuration.duration)) {
			spanTime.innerText += ` • ${(timespanCurrent.hours * 60 + timespanDuration.minutes).toString().padStart(2, `0`)}:${(timespanDuration.seconds).toString().padStart(2, `0`)}`;
		}
		inputTimeTrack.style.setProperty(`--procent-fill`, `${(audioPlayer.currentTime / audioPlayer.duration) * 100}%`);
		//
		divInformation.toggleAttribute(`data-intro`, (timespanCurrent.duration < information));
	});
	if (search.get(`debug`) === `on`) {
		visualizer.addEventListener(`render`, (event) => {
			Manager.log({
				[`loop`]: `${settings.loop}`,
				[`autoplay`]: `${settings.autoplay}`,
				[`visualization`]: `${settings.type}`,
				[`frequency length`]: `${visualizer.length} bit`,
				[`quality`]: `${visualizer.quality} level`,
				[`smoothing`]: `${visualizer.smoothing}`,
				[`min decibels`]: `${visualizer.minDecibels}`,
				[`max decibels`]: `${visualizer.maxDecibels}`,
				[`launched`]: `${visualizer.launched}`,
				[`FPS limit`]: `${visualizer.FPSLimit}`,
				[`FPS`]: `${visualizer.FPS.toFixed()}`,
				[`audio time`]: `${timespanCurrent.toString()}s`,
				[`audio duration`]: `${Number.isNaN(timespanDuration.duration) ? NaN : timespanDuration.toString()}s`,
				[`alternating volume`]: `${visualizer.toFactor(visualizer.getVolume(Datalist.frequency)).toFixed(3)}`,
				[`direct volume`]: `${visualizer.toSignedFactor(visualizer.getVolume(Datalist.timeDomain)).toFixed(3)}`,
				[`alternating amplitude`]: `${visualizer.toFactor(visualizer.getAmplitude(Datalist.frequency)).toFixed(3)}`,
				[`direct amplitude`]: `${visualizer.toSignedFactor(visualizer.getAmplitude(Datalist.timeDomain)).toFixed(3)}`,
				[`possibly bit`]: `${visualizer.isBeat()}`,
				[`cycle duration`]: `${duration.toFixed(3)}s`,
				[`fullscreen`]: `${document.fullscreenElement !== null}`,
			});
		});
	}

	visualizer.FPSLimit = Infinity;
	visualizer.quality = settings.visualization.quality;
	visualizer.smoothing = settings.visualization.smoothing;
	visualizer.minDecibels = settings.visualization.minDecibels;
	visualizer.maxDecibels = settings.visualization.maxDecibels;
	const duration = 5;
	const information = settings.information * 1000;
	switch (settings.type) {
		//#region Spectrogram
		case Visualizations.spectrogram: {
			const anchor = (() => {
				if (settings.visualization instanceof SpectrogramVisualizationSettings) {
					return settings.visualization.anchor;
				} else throw new TypeError(`Invalid settings type`);
			})();
			const anchorTop = anchor * 2 / 3;
			const anchorBottom = anchorTop + 1 / 3;
			//
			visualizer.addEventListener(`render`, (event) => {
				context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
				//
				const transform = context.getTransform();
				transform.a = 1 + 0.2 * visualizer.toFactor(visualizer.getAmplitude(Datalist.frequency));
				transform.d = 1 + 0.4 * visualizer.toFactor(visualizer.getAmplitude(Datalist.timeDomain));
				context.setTransform(transform);
				//#region Foreground
				context.globalCompositeOperation = `source-over`;
				const gradientPath = context.createLinearGradient(-canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2);
				const data = visualizer.getData(Datalist.frequency);
				context.beginPath();
				for (let counter = -visualizer.length; counter < visualizer.length; counter++) {
					let index = counter;
					if (counter < 0) {
						index = Math.abs(counter) - 1;
					}
					const coefficent = visualizer.toFactor(index, visualizer.length);
					const datul = visualizer.toFactor(data[Math.trunc(visualizer.length * coefficent * 0.7)]);
					/** [0 - 1] */ const value = Math.pow(Math.pow(datul, 2) * visualizer.toFactor(visualizer.getVolume(Datalist.frequency)), 1 / 2);
					const size = new Point2D(0, canvas.height * value);
					const position = new Point2D(
						canvas.width * (coefficent - 0.5),
						(canvas.height - size.y) * anchor - canvas.height / 2
					);
					if (counter < 0) {
						context.lineTo(position.x, position.y + size.y);
					} else {
						const highlight = Color.viaHSL(coefficent * 360, 100, 50)
							.rotate(-visualizer.impulse(duration * 1000) * 360 + visualizer.toSignedFactor(visualizer.getAmplitude(Datalist.timeDomain)) * (360 / duration))
							.illuminate(0.2 + 0.5 * visualizer.toFactor(visualizer.getVolume(Datalist.frequency)));
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

			});
		} break;
		//#endregion
		//#region Waveform
		case Visualizations.waveform: {
			let radius = Math.min(canvas.width, canvas.height) / 2;
			let line = radius / 256;
			//
			visualizer.addEventListener(`resize`, (event) => {
				radius = Math.min(canvas.width, canvas.height) / 2;
				line = radius / 256;
			});
			//
			visualizer.addEventListener(`render`, (event) => {
				context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
				//
				const transform = context.getTransform();
				transform.a = 1 + 0.5 * visualizer.toSignedFactor(visualizer.getAmplitude(Datalist.timeDomain));
				transform.d = 1 + 0.5 * visualizer.toSignedFactor(visualizer.getAmplitude(Datalist.timeDomain));
				context.setTransform(transform);
				//
				const data = visualizer.getData(Datalist.timeDomain);
				context.lineWidth = line;
				//#region Background
				context.globalCompositeOperation = `source-over`;
				const colorBackground = Color.parse(getComputedStyle(document.body).backgroundColor, ColorFormats.RGB)
					.invert();
				context.strokeStyle = colorBackground.toString();
				context.beginPath();
				context.moveTo(-canvas.width / 2, 0);
				for (let index = 0; index < visualizer.length; index++) {
					const coefficent = visualizer.toFactor(index, visualizer.length);
					const datul = visualizer.toSignedFactor(data[Math.trunc(coefficent * visualizer.length)]);
					/** [0 - 1] */ const value = (datul * visualizer.toFactor(visualizer.getVolume(Datalist.frequency)));
					const position = new Point2D(
						canvas.width * (coefficent - 0.5),
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
				const smoothing = visualizer.length / 2;
				for (let angle = 0; angle < visualizer.length; angle++) {
					const coefficent = visualizer.toFactor(angle, visualizer.length);
					const ratio = Math.pow(Math.abs(angle - smoothing) / smoothing, 16);
					const index = Math.trunc(coefficent * visualizer.length);
					const average = (data[index] + data[data.length - 1 - index]) / 2;
					const datul = visualizer.toSignedFactor((data[index] + + (average - data[index]) * ratio));
					/** [0 - 1] */ const value = (0.75 + 0.25 * datul * visualizer.toFactor(visualizer.getVolume(Datalist.frequency)));
					const distance = radius * value;
					const position = new Point2D(
						distance * Math.sin(coefficent * 2 * Math.PI),
						distance * Math.cos(coefficent * 2 * Math.PI)
					);
					const highlight = Color.viaHSL(coefficent * 360, 100, 50)
						.rotate(-visualizer.impulse(duration * 1000) * 360 + visualizer.toSignedFactor(visualizer.getAmplitude(Datalist.timeDomain)) * (360 / duration))
						.illuminate(0.2 + 0.5 * visualizer.toFactor(visualizer.getVolume(Datalist.frequency)));
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
				for (let index = 0; index < parts; index++) {
					const coefficent = index / (parts - 1);
					const patency = Math.sqrt(1 - coefficent);
					gradientForegroundShadow.addColorStop(coefficent, colorForeground.pass(patency).toString(ColorFormats.RGB, true));
				}
				context.fillStyle = gradientForegroundShadow;
				context.fill();
				//#endregion
			});
		} break;
		//#endregion
		default: throw new TypeError(`Invalid visualization: '${settings.type}'.`);
	}
	visualizer.dispatchEvent(new Event(`render`));

	divInterface.addEventListener(`click`, (event) => {
		if (event.eventPhase !== Event.BUBBLING_PHASE && audioPlayer.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA && audioPlayer.paused) {
			audioPlayer.play();
		}
	});

	inputLoader.addEventListener(`change`, async (event) => {
		try {
			event.stopPropagation();
			if (inputLoader.files === null) {
				throw new ReferenceError(`Files list is empty.`);
			}
			const file = inputLoader.files[0];
			if (file) {
				URL.revokeObjectURL(audioPlayer.src);
				audioPlayer.src = URL.createObjectURL(file);
				const [author, title] = file.name.replace(/\.\w+$/, ``).split(/\s+-\s+/, 2);
				if (author && title) {
					h1MediaTitle.innerText = title;
					h3MediaAuthor.innerText = author;
				}
			}
		} catch (error) {
			Manager.prevent(error);
		}
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