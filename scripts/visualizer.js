"use strict";

import {
	Color,
	ColorFormats
} from "./modules/colors.js";
import {
	Point2D
} from "./modules/measures.js";
import {
	Timespan
} from "./modules/time.js";
import {
	Datalist,
	SpectrogramVisualizationSettings,
	Visualizations,
	Visualizer,
	lockerPlaylist,
	search,
	settings,
} from "./structure.js";

void async function () {
	try {
		//#region Initializing
		const audioPlayer = document.getElement(HTMLAudioElement, `audio#player`);
		const canvas = document.getElement(HTMLCanvasElement, `canvas#visualizer`);
		const context = canvas.getContext(`2d`) ?? (() => {
			throw new ReferenceError(`Can't reach context`);
		})();
		const divInterface = document.getElement(HTMLDivElement, `div#interface`);
		const inputLoader = document.getElement(HTMLInputElement, `input#loader`);
		const buttonEjector = document.getElement(HTMLButtonElement, `button#ejector`);
		const aSettings = document.getElement(HTMLAnchorElement, `a[href="./settings.html"]`);
		const spanTime = document.getElement(HTMLSpanElement, `span#time`);
		const buttonToggleFullscreen = document.getElement(HTMLButtonElement, `button#toggle-fullscreen`);
		const inputTimeTrack = document.getElement(HTMLInputElement, `input#time-track`);
		const divInformation = document.getElement(HTMLDivElement, `div#information`);
		const h1MediaTitle = document.getElement(HTMLHeadingElement, `h1#media-title`);
		const h3MediaAuthor = document.getElement(HTMLHeadingElement, `h3#media-author`);

		const playlist = await lockerPlaylist.get() ?? [];
		window.addEventListener(`beforeunload`, async (event) => {
			await lockerPlaylist.set(playlist);
		});
		//#endregion
		//#region Audio player
		audioPlayer.loop = settings.loop;
		audioPlayer.autoplay = settings.autoplay;
		audioPlayer.addEventListener(`play`, (event) => {
			audioPlayer.dataset[`playing`] = ``;
			visualizer.launched = true;
		});
		audioPlayer.addEventListener(`pause`, (event) => {
			delete audioPlayer.dataset[`playing`];
			visualizer.launched = false;
			visualizer.dispatchEvent(new Event(`update`));
		});
		audioPlayer.addEventListener(`canplay`, (event) => {
			audioPlayer.dataset[`ready`] = ``;
		});
		audioPlayer.addEventListener(`emptied`, (event) => {
			delete audioPlayer.dataset[`ready`];
		});
		audioPlayer.addEventListener(`loadstart`, async (event) => {
			await window.load(new Promise((resolve, reject) => {
				audioPlayer.addEventListener(`loadeddata`, (event) => {
					resolve(undefined);
				}, { once: true });
				audioPlayer.addEventListener(`error`, (event) => {
					reject(event.error);
				}, { once: true });
			}));
			visualizer.dispatchEvent(new Event(`update`));
		});

		canvas.addEventListener(`click`, (event) => {
			if (audioPlayer.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
				audioPlayer.pause();
			}
		});
		//#endregion
		//#region Visualization
		const visualizer = new Visualizer(context, audioPlayer);
		const timespanCurrent = Timespan.viaDuration(audioPlayer.currentTime * 1000);
		const timespanDuration = Timespan.viaDuration(audioPlayer.duration * 1000);
		visualizer.addEventListener(`resize`, (event) => {
			context.translate(canvas.width / 2, canvas.height / 2);
		});
		visualizer.dispatchEvent(new Event(`resize`));
		visualizer.addEventListener(`update`, (event) => {
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

		/* if (search.get(`debug`) === `on`) {
			visualizer.addEventListener(`update`, (event) => {
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
					[`alternating volume`]: `${Math.toFactor(visualizer.getVolume(Datalist.frequency)).toFixed(3)}`,
					[`direct volume`]: `${Math.toSignedFactor(visualizer.getVolume(Datalist.timeDomain)).toFixed(3)}`,
					[`alternating amplitude`]: `${Math.toFactor(visualizer.getAmplitude(Datalist.frequency)).toFixed(3)}`,
					[`direct amplitude`]: `${Math.toSignedFactor(visualizer.getAmplitude(Datalist.timeDomain)).toFixed(3)}`,
					[`possibly bit`]: `${visualizer.isBeat()}`,
					[`cycle duration`]: `${duration.toFixed(3)}s`,
					[`fullscreen`]: `${document.fullscreenElement !== null}`,
				});
			});
		} */

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
				visualizer.addEventListener(`update`, (event) => {
					context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
					//
					const transform = context.getTransform();
					transform.a = 1 + 0.2 * Math.toFactor(visualizer.getAmplitude(Datalist.frequency), 255);
					transform.d = 1 + 0.4 * Math.toFactor(visualizer.getAmplitude(Datalist.timeDomain), 255);
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
						const coefficent = Math.toFactor(index, visualizer.length);
						const datul = Math.toFactor(data[Math.trunc(visualizer.length * coefficent * 0.7)], 255);
						/** [0 - 1] */ const value = Math.pow(Math.pow(datul, 2) * Math.toFactor(visualizer.getVolume(Datalist.frequency), 255), 1 / 2);
						const size = new Point2D(0, canvas.height * value);
						const position = new Point2D(
							canvas.width * (coefficent - 0.5),
							(canvas.height - size.y) * anchor - canvas.height / 2
						);
						if (counter < 0) {
							context.lineTo(position.x, position.y + size.y);
						} else {
							const highlight = Color.viaHSL(coefficent * 360, 100, 50)
								.rotate(-Math.toFactor(visualizer.time, duration * 1000) * 360 + Math.toSignedFactor(visualizer.getAmplitude(Datalist.timeDomain), 255) * (360 / duration))
								.illuminate(0.2 + 0.5 * Math.toFactor(visualizer.getVolume(Datalist.frequency), 255));
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
					gradientShadow.addColorStop(anchorTop, colorShadow.toString(true));
					colorShadow.alpha = 0.8;
					gradientShadow.addColorStop(anchor, colorShadow.toString(true));
					colorShadow.alpha = 0.4;
					gradientShadow.addColorStop(anchorBottom, colorShadow.toString(true));
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
				const colorBackground = Color.parse(getComputedStyle(document.body).backgroundColor, false, ColorFormats.RGB)
						.invert();
				visualizer.addEventListener(`update`, (event) => {
					context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
					//
					const transform = context.getTransform();
					transform.a = 1 + 0.25 * Math.toFactor(visualizer.getAmplitude(Datalist.timeDomain), 255);
					transform.d = 1 + 0.25 * Math.toFactor(visualizer.getAmplitude(Datalist.timeDomain), 255);
					context.setTransform(transform);
					//
					const data = visualizer.getData(Datalist.timeDomain);
					context.lineWidth = line;
					//#region Background
					context.globalCompositeOperation = `source-over`;
					context.strokeStyle = colorBackground.toString();
					context.beginPath();
					context.moveTo(-canvas.width / 2, 0);
					for (let index = 0; index < visualizer.length; index++) {
						const coefficent = Math.toFactor(index, visualizer.length);
						const datul = Math.toSignedFactor(data[Math.trunc(coefficent * visualizer.length)], 255);
						/** [0 - 1] */ const value = (datul * Math.toFactor(visualizer.getVolume(Datalist.frequency), 255));
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
					gradientBackgroundShadow.addColorStop(0, colorBackground.pass(0).toString(true));
					gradientBackgroundShadow.addColorStop(1, colorBackground.pass(0.5).toString(true));
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
						const coefficent = Math.toFactor(angle, visualizer.length);
						const ratio = Math.pow(Math.abs(angle - smoothing) / smoothing, 16);
						const index = Math.trunc(coefficent * visualizer.length);
						const average = (data[index] + data[data.length - 1 - index]) / 2;
						const datul = Math.toSignedFactor((data[index] + + (average - data[index]) * ratio), 255);
						/** [0 - 1] */ const value = (0.75 + 0.25 * datul * Math.toFactor(visualizer.getVolume(Datalist.frequency), 255));
						const distance = radius * value;
						const position = new Point2D(
							distance * Math.sin(coefficent * 2 * Math.PI),
							distance * Math.cos(coefficent * 2 * Math.PI)
						);
						const highlight = Color.viaHSL(coefficent * 360, 100, 50)
							.rotate(-Math.toFactor(visualizer.time, duration * 1000) * 360 + Math.toSignedFactor(visualizer.getAmplitude(Datalist.timeDomain), 255) * (360 / duration))
							.illuminate(0.2 + 0.5 * Math.toFactor(visualizer.getVolume(Datalist.frequency), 255));
						gradientForegroundPath.addColorStop(coefficent, highlight.toString(true));
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
						gradientForegroundShadow.addColorStop(coefficent, colorForeground.pass(patency).toString(true));
					}
					context.fillStyle = gradientForegroundShadow;
					context.fill();
					//#endregion
				});
			} break;
			//#endregion
			default: throw new TypeError(`Invalid visualization: '${settings.type}'.`);
		}
		visualizer.dispatchEvent(new Event(`update`));
		//#endregion
		//#region Interface
		divInterface.addEventListener(`click`, (event) => {
			if (event.eventPhase !== Event.BUBBLING_PHASE && audioPlayer.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA && audioPlayer.paused) {
				audioPlayer.play();
			}
		});

		/**
		 * @param {File?} file 
		 */
		const assign = function (file) {
			URL.revokeObjectURL(audioPlayer.src);
			if (file !== null) {
				audioPlayer.src = URL.createObjectURL(file);
				const [author, title] = file.name.replace(/\.\w+$/, ``).split(/\s+-\s+/, 2);
				if (author && title) {
					h1MediaTitle.innerText = title;
					h3MediaAuthor.innerText = author;
				}
				playlist[0] = file;
			} else {
				// audioPlayer.src = ``;
				h1MediaTitle.innerText = ``;
				h3MediaAuthor.innerText = ``;
				delete playlist[0];
				location.reload();
			}
		};


		if (playlist[0] !== undefined) {
			assign(playlist[0]);
		}
		inputLoader.addEventListener(`change`, (event) => {
			try {
				event.stopPropagation();
				if (inputLoader.files === null) {
					throw new ReferenceError(`Files list is empty.`);
				}
				const file = inputLoader.files[0];
				if (file) {
					assign(file);
				}
			} catch (error) {
				document.prevent(error);
			}
		});

		buttonEjector.addEventListener(`click`, (event) => {
			assign(null);
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
			visualizer.dispatchEvent(new Event(`update`));
		});
		//#endregion
	} catch (error) {
		document.prevent(document.analysis(error));
	}
}();