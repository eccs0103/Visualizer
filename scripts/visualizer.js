"use strict";
try {
	const settings = Settings.import(archiveSettings.data);

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
	analyser.fftSize = settings.FFTSize;
	const source = audioContext.createMediaElementSource(audioPlayer);
	source.connect(analyser);
	analyser.connect(audioContext.destination);
	const frequencyData = new Uint8Array(analyser.frequencyBinCount);
	//#region File exists
	inputLoader.addEventListener(`change`, (event) => {
		//#region Uploading
		if (!inputLoader.files) {
			throw new ReferenceError(`Files list is empty.`);
		}
		const file = inputLoader.files[0];
		const url = URL.createObjectURL(file);
		audioPlayer.src = url;
		audioContext.resume();
		//#endregion
		//#region Rendering
		// let max = 0;
		// console.log(frequencyData.length);
		const duration = settings.highlightCycleTime;
		const engine = new Engine(() => {
			analyser.getByteFrequencyData(frequencyData);
			context.clearRect(0, 0, canvas.width, canvas.height);
			const gapPercentage = settings.gapPercentage;
			const pathWidth = canvas.width / (frequencyData.length * (1 + gapPercentage) - gapPercentage);
			const pathGap = pathWidth * gapPercentage;
			const timeCoefficent = (engine.time % (duration * 1000)) / (duration * 1000);
			const bottomColor = Color.black.toString();
			frequencyData.forEach((data, index) => {
				const pathX = (pathWidth + pathGap) * index;
				const pathHeight = canvas.height * (data / 256);
				const pathY = canvas.height - pathHeight;
				const pathCoefficent = index / frequencyData.length;
				const gradient = context.createLinearGradient(pathX, 0, pathX + pathWidth, canvas.height);
				const topColor = Color.viaHSV((pathCoefficent + timeCoefficent) * 360, 100, audioPlayer.currentTime / audioPlayer.duration > pathCoefficent ? 100 : 50).toString();
				gradient.addColorStop(2 / 3, topColor);
				gradient.addColorStop(1, bottomColor);
				context.fillStyle = gradient;
				context.fillRect(pathX, pathY, pathWidth, pathHeight);
			});
			// const index = frequencyData.findLastIndex(value => value != 0);
			// if (index > max) {
			// 	max = index;
			// 	console.log(max);
			// }
		});
		audioPlayer.addEventListener(`play`, (event) => {
			engine.launched = true;
		});
		audioPlayer.addEventListener(`pause`, (event) => {
			engine.launched = false;
		});
		//#endregion
	});
	//#endregion
	//#endregion

	console.log(`https://github.com/eccs0103/Visualizer/blob/main/resources/Pandocrator%20-%20Ethernal%20(Demo).mp3?raw=true`);
} catch (exception) {
	Application.prevent(exception);
}
