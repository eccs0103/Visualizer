"use strict";
try {
	const inputLoader = (/** @type {HTMLInputElement} */ (document.querySelector(`input#loader`)));
	const audioPlayer = (/** @type {HTMLAudioElement} */ (document.querySelector(`audio#player`)));
	const canvas = (/** @type {HTMLCanvasElement} */ (document.querySelector(`canvas#visualizer`)));
	const divInterface = (/** @type {HTMLDivElement} */ (document.querySelector(`div#interface`)));

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
	//#region Player
	audioPlayer.addEventListener(`play`, (event) => {
		audioPlayer.classList.toggle(`-playing`, true);
		audioPlayer.classList.toggle(`-paused`, false);
	});
	audioPlayer.addEventListener(`pause`, (event) => {
		audioPlayer.classList.toggle(`-playing`, false);
		audioPlayer.classList.toggle(`-paused`, true);
	});

	divInterface.addEventListener(`click`, (event) => {
		if (audioPlayer.src) {
			if (audioPlayer.paused) {
				audioPlayer.play();
			} else {
				audioPlayer.pause();
			}
		} else {
			inputLoader.click();
		}
	});
	/* const timer = 1;
	divInterface.addEventListener(`pointerdown`, (event) => {
		event.stopImmediatePropagation();
		const interval = setInterval(() => {
			inputLoader.click();
			clear();
		}, timer * 1000);
		function clear() {
			clearInterval(interval);
			divInterface.removeEventListener(`pointerup`, clear);
			divInterface.removeEventListener(`pointerleave`, clear);
		}
		divInterface.addEventListener(`pointerup`, clear);
		divInterface.addEventListener(`pointerleave`, clear);
	}); */
	//#endregion
	//#region Analysys
	const audioContext = new AudioContext();
	const analyser = audioContext.createAnalyser();
	analyser.fftSize = 512;
	// console.log(analyser.fftSize, analyser.frequencyBinCount);
	audioContext.createMediaElementSource(audioPlayer).connect(analyser);;
	analyser.connect(audioContext.destination);
	const frequencyData = new Uint8Array(analyser.frequencyBinCount * 0.7);
	//#region File exists
	inputLoader.addEventListener(`change`, (event) => {
		if (!inputLoader.files) {
			throw new ReferenceError(`Files list is empty.`);
		}
		const file = inputLoader.files[0];
		const url = URL.createObjectURL(file);
		audioPlayer.src = url;
		audioContext.resume();
		//
		requestAnimationFrame(function callback(time) {
			analyser.getByteFrequencyData(frequencyData);
			handler(time);
			requestAnimationFrame(callback);
		});

		// let max = 0;
		const duration = 10;

		/**
		 * @param {DOMHighResTimeStamp} time 
		 */
		function handler(time) {
			context.clearRect(0, 0, canvas.width, canvas.height);
			const [pathWidth, pathGap] = (() => {
				const gapTemp = canvas.width / (frequencyData.length * 5 - 1);
				const widthTemp = gapTemp * 4;
				return [widthTemp, gapTemp];
			})();
			frequencyData.forEach((data, index) => {
				const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
				const perentage = index / frequencyData.length;
				const color = Color.viaHSV(perentage * 360 + (time % (duration * 1000)) / (duration * 1000) * 360, 100, 100).toString();
				gradient.addColorStop(0, color);
				gradient.addColorStop(audioPlayer.currentTime / audioPlayer.duration > perentage ? 2 / 3 : 1 / 3, color);
				gradient.addColorStop(1, Color.black.toString());
				context.fillStyle = gradient;
				const pathX = (pathWidth + pathGap) * index;
				const pathHeight = canvas.height * (data / 255);
				const pathY = canvas.height - pathHeight;
				context.fillRect(pathX, pathY, pathWidth, pathHeight);
			});
			// const index = frequencyData.findLastIndex(value => value != 0);
			// if (index > max) {
			// 	max = index;
			// 	console.log(max);
			// }
		}
	});
	//#endregion
	//#endregion
	console.log(`https://github.com/eccs0103/Visualizer/blob/main/resources/Pandocrator%20-%20Ethernal%20(Demo).mp3?raw=true`);
} catch (exception) {
	Application.prevent(exception);
}
