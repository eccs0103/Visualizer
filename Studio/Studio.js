"use strict";

import { Color } from "../Scripts/Modules/Colors.js";
import { Display } from "../Scripts/Modules/Executors.js";
import { Point2D } from "../Scripts/Modules/Measures.js";
import { Timespan } from "../Scripts/Modules/Time.js";
import { DataTypes, Visualization, Visualizer, playlist, settings } from "../Scripts/Structure.js";

try {
	const { min, max, between, toFactor, toSignedFactor, trunc, ceil, round, abs, sin, cos, PI, pow, sqrt, random } = Math;

	//#region Definition
	const inputLoader = document.getElement(HTMLInputElement, `input#loader`);
	const audioPlayer = document.getElement(HTMLAudioElement, `audio#player`);
	const divInterface = document.getElement(HTMLDivElement, `div#interface`);
	const inputTogglePlaylist = document.getElement(HTMLInputElement, `input#toggle-playlist`);
	const spanTime = document.getElement(HTMLSpanElement, `span#time`);
	const buttonToggleFullscreen = document.getElement(HTMLButtonElement, `button#toggle-fullscreen`);
	const inputTimeTrack = document.getElement(HTMLInputElement, `input#time-track`);
	//#endregion
	//#region Loader
	inputLoader.addEventListener(`input`, async () => {
		try {
			const files = inputLoader.files ?? (() => {
				throw new ReferenceError(`Unable to get files`);
			})();
			const file = files[0];
			if (file) {
				playlist[0] = file;
				audioPlayer.src = URL.createObjectURL(playlist[0]);
			}
		} catch (error) {
			await window.prevent(document.analysis(error));
		}
	});
	//#endregion
	//#region Player
	audioPlayer.autoplay = false;

	audioPlayer.addEventListener(`loadstart`, async () => {
		const controller = new AbortController();
		try {
			await new Promise((resolve, reject) => {
				audioPlayer.addEventListener(`canplay`, resolve, { signal: controller.signal });
				audioPlayer.addEventListener(`error`, reject, { signal: controller.signal });
			});
			audioPlayer.dataset[`ready`] = ``;
			visualizer.dispatchEvent(new Event(`update`));
		} catch (error) {
			await window.prevent(document.analysis(error));
		} finally {
			controller.abort();
		}
		inputTogglePlaylist.checked = (audioPlayer.dataset[`ready`] !== undefined);
	});
	audioPlayer.addEventListener(`emptied`, async () => {
		delete audioPlayer.dataset[`ready`];
		visualizer.dispatchEvent(new Event(`update`));
		audioPlayer.pause();
		audioPlayer.dispatchEvent(new Event(`pause`));
		inputTogglePlaylist.checked = (audioPlayer.dataset[`ready`] !== undefined);
	});

	audioPlayer.addEventListener(`play`, async () => {
		audioPlayer.dataset[`play`] = ``;
		display.launched = true;
	});
	audioPlayer.addEventListener(`pause`, async () => {
		delete audioPlayer.dataset[`play`];
		display.launched = false;
	});

	if (playlist[0]) {
		const controller = new AbortController();
		try {
			await new Promise((resolve, reject) => {
				audioPlayer.addEventListener(`canplay`, resolve, { signal: controller.signal });
				audioPlayer.addEventListener(`error`, reject, { signal: controller.signal });
				audioPlayer.src = URL.createObjectURL(playlist[0]);
			});
		} finally {
			controller.abort();
		}
	}
	//#endregion
	//#region Canvas
	const canvas = document.getElement(HTMLCanvasElement, `canvas#display`);
	const context = canvas.getContext(`2d`) ?? (() => {
		throw new TypeError(`Unable to get context`);
	})();
	const display = new Display(context);

	const visualizer = new Visualizer(audioPlayer);
	display.addEventListener(`resize`, () => {
		const transform = context.getTransform();
		transform.e = canvas.width / 2;
		transform.f = canvas.height / 2;
		context.setTransform(transform);

		visualizer.dispatchEvent(new Event(`update`));
	});
	display.addEventListener(`update`, () => {
		visualizer.dispatchEvent(new Event(`update`));
	});

	visualizer.quality = 10;
	visualizer.minDecibels = -80;
	visualizer.maxDecibels = -20;

	switch (settings.visualization) {
		case Visualization.pulsar: {
			const duration = 6;

			let radius = min(canvas.width, canvas.height) / 2;
			let line = radius / 256;
			display.addEventListener(`resize`, () => {
				radius = min(canvas.width, canvas.height) / 2;
				line = radius / 256;
			});

			let hue = 0;
			const period = visualizer.length / 2;

			visualizer.addEventListener(`update`, () => {
				const transform = context.getTransform();
				context.clearRect(-transform.e, -transform.f, canvas.width, canvas.height);

				const dataFrequency = visualizer.getData(DataTypes.frequency);
				const dataTimeDomain = visualizer.getData(DataTypes.timeDomain);
				const volume = visualizer.getVolume(DataTypes.frequency);
				const amplitude = visualizer.getAmplitude(DataTypes.timeDomain);

				const toVolumeFactor = toFactor(volume, 255);
				const toAmplitudeFactor = toFactor(amplitude, 255);

				transform.a = 1 + 0.4 * toVolumeFactor * toAmplitudeFactor;
				transform.d = 1 + 0.4 * toVolumeFactor * toAmplitudeFactor;
				context.setTransform(transform);

				context.lineWidth = line;

				//#region Pulsar
				const graientPulsar = context.createConicGradient(PI / 2, 0, 0);
				context.beginPath();
				for (let angle = -period + 1; angle < period; angle++) {
					const factor = toFactor(angle + period, 2 * period - 1);
					const index = toFactor(abs(angle), period - 1);
					const datul = toFactor(dataFrequency[trunc(index * (period - 1) * 0.7)], 255);
					const distance = (0.6 + 0.4 * sqrt(datul * datul + toVolumeFactor * toVolumeFactor)) * radius;
					const position = new Point2D(distance * sin(factor * 2 * PI), distance * cos(factor * 2 * PI));
					const color = Color.viaHSL(hue * 360, 100, 50);
					graientPulsar.addColorStop(factor, color
						.rotate(180 * index)
						.illuminate(0.1 + 0.9 * sqrt(toVolumeFactor))
						.toString(true)
					);
					context.lineTo(position.x, position.y);
				}
				context.closePath();

				context.globalCompositeOperation = `source-over`;
				context.fillStyle = Color.BLACK.toString(true);
				context.fill();
				context.strokeStyle = graientPulsar;
				context.stroke();
				//#endregion
				//#region Wave
				context.beginPath();
				context.moveTo(-canvas.width / 2, 0);
				for (let index = 0; index < visualizer.length; index++) {
					const coefficent = toFactor(index, visualizer.length);
					const datul = toSignedFactor(dataTimeDomain[trunc(coefficent * visualizer.length)], 255);
					const value = datul * toFactor(visualizer.getVolume(DataTypes.frequency), 255);
					const position = new Point2D(canvas.width * (coefficent - 0.5), (radius) * value);
					context.lineTo(position.x, position.y);
				}
				context.lineTo(canvas.width / 2, 0);

				context.fillStyle = graientPulsar;
				context.strokeStyle = graientPulsar;
				context.globalCompositeOperation = `source-atop`;
				context.fill();
				context.stroke();
				//#endregion
				//#region Shadow
				const gradientForegroundShadow = context.createRadialGradient(0, 0, 0, 0, 0, radius);
				const parts = 2;
				for (let index = 0; index < parts; index++) {
					const factor = index / (parts - 1);
					const patency = sqrt(1 - factor);
					gradientForegroundShadow.addColorStop(factor, Color.viaHSL(0, 0, 0, patency)
						.toString(true)
					);
				}

				context.globalCompositeOperation = `source-over`;
				context.fillStyle = gradientForegroundShadow;
				context.fill();
				//#endregion

				if (Number.isFinite(display.delta)) {
					hue = (hue + ((6 / duration * toVolumeFactor) * display.delta)) % 1;
				}
			});
		} break;
		default: throw new TypeError(`Invalid ${settings.visualization} visualization`);
	}

	display.dispatchEvent(new Event(`resize`));

	window.addEventListener(`keydown`, async (event) => {
		try {
			if (event.ctrlKey && event.code == `Numpad1`) {
				event.preventDefault();
				visualizer.minDecibels -= 10;
			} else if (event.ctrlKey && event.code == `Numpad7`) {
				event.preventDefault();
				visualizer.minDecibels += 10;
			}

			if (event.ctrlKey && event.code == `Numpad3`) {
				event.preventDefault();
				visualizer.maxDecibels -= 10;
			} else if (event.ctrlKey && event.code == `Numpad9`) {
				event.preventDefault();
				visualizer.maxDecibels += 10;
			}

			if (event.ctrlKey && event.code == `Numpad4`) {
				event.preventDefault();
				visualizer.smoothing = (visualizer.smoothing * 10 - 1) / 10;
			} else if (event.ctrlKey && event.code == `Numpad6`) {
				event.preventDefault();
				visualizer.smoothing = (visualizer.smoothing * 10 + 1) / 10;
			}
		} catch (error) {
			await window.prevent(document.analysis(error));
		}
	});
	//#endregion
	//#region Interface
	divInterface.addEventListener(`click`, async (event) => {
		if (event.eventPhase == Event.AT_TARGET && audioPlayer.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
			if (audioPlayer.paused) {
				await audioPlayer.play();
			} else {
				audioPlayer.pause();
			}
		}
	});

	inputTogglePlaylist.addEventListener(`change`, async () => {
		inputTogglePlaylist.checked = !inputTogglePlaylist.checked;
		if (inputTogglePlaylist.checked) {
			audioPlayer.removeAttribute(`src`);
			audioPlayer.srcObject = null;
			delete playlist[0];
		} else {
			const controller = new AbortController();
			try {
				await new Promise((resolve, reject) => {
					audioPlayer.addEventListener(`canplay`, resolve, { signal: controller.signal });
					audioPlayer.addEventListener(`error`, reject, { signal: controller.signal });
					inputLoader.click();
				});
			} finally {
				controller.abort();
			}
		}
	});

	/**
	 * @param {Timespan} timespan 
	 */
	function setTime(timespan) {
		spanTime.innerText = `${(timespan.hours * 60 + timespan.minutes).toString().padStart(2, `0`)}:${(timespan.seconds).toString().padStart(2, `0`)}`;
		if (!Number.isNaN(audioPlayer.duration)) {
			const timespanDuration = Timespan.viaDuration(audioPlayer.duration * 1000);
			spanTime.innerText += ` • ${(timespanDuration.hours * 60 + timespanDuration.minutes).toString().padStart(2, `0`)}:${(timespanDuration.seconds).toString().padStart(2, `0`)}`;
		}
	}
	spanTime.addEventListener(`update`, () => {
		setTime(Timespan.viaDuration(audioPlayer.currentTime * 1000));
	});
	visualizer.addEventListener(`update`, () => {
		spanTime.dispatchEvent(new Event(`update`));
	});

	buttonToggleFullscreen.addEventListener(`click`, async () => {
		try {
			if (document.fullscreenElement) {
				await document.exitFullscreen();
			} else {
				await document.documentElement.requestFullscreen();
			}
		} catch (error) {
			await window.prevent(document.analysis(error));
		}
	});

	const getTrackFactor = () => toFactor(Number(inputTimeTrack.value), Number(inputTimeTrack.max) - Number(inputTimeTrack.min));
	inputTimeTrack.addEventListener(`input`, () => {
		inputTimeTrack.style.setProperty(`--track-value`, `${getTrackFactor() * 100}%`);
		const duration = (Number.isNaN(audioPlayer.duration) ? 0 : audioPlayer.duration);
		setTime(Timespan.viaDuration(getTrackFactor() * duration * 1000));
	});
	visualizer.addEventListener(`update`, () => {
		const factor = (Number.isNaN(audioPlayer.duration) ? 0 : audioPlayer.currentTime / audioPlayer.duration);
		inputTimeTrack.value = `${factor * 100}`;
		inputTimeTrack.dispatchEvent(new Event(`input`));
	});
	inputTimeTrack.addEventListener(`change`, () => {
		const duration = (Number.isNaN(audioPlayer.duration) ? 0 : audioPlayer.duration);
		audioPlayer.currentTime = getTrackFactor() * duration;
		spanTime.dispatchEvent(new Event(`update`));
	});
	//#endregion
} catch (error) {
	await window.prevent(document.analysis(error));
}