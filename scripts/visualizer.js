const inputLoader = (/** @type {HTMLInputElement} */ (document.querySelector(`input#loader`)));
const audioPlayer = (/** @type {HTMLAudioElement} */ (document.querySelector(`audio#player`)));
const canvas = (/** @type {HTMLCanvasElement} */ (document.querySelector(`canvas#visualizer`)));

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener(`resize`, (event) => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});
const context = (() => {
	const contextTemp = canvas.getContext(`2d`);
	if (!contextTemp) {
		throw new ReferenceError(`Element 'contextTemp' isn't defined.`);
	}
	return contextTemp;
})();

canvas.addEventListener(`click`, (event) => {
	if (!inputLoader.files || inputLoader.files.length == 0) {
		inputLoader.click();
	} else {
		if (audioPlayer.paused) {
			audioPlayer.play();
		} else {
			audioPlayer.pause();
		}
	}
});

inputLoader.addEventListener(`change`, (event) => {
	if (!inputLoader.files) {
		throw new ReferenceError(`Files list is empty.`);
	}
	const file = inputLoader.files[0];
	const url = URL.createObjectURL(file);
	audioPlayer.src = url;
	inputLoader.disabled = true;
	//
	const pathGap = 2;
	const audioContext = new AudioContext();
	const analyser = audioContext.createAnalyser();
	const source = audioContext.createMediaElementSource(audioPlayer);
	analyser.fftSize = 512;
	console.log(analyser.fftSize, analyser.frequencyBinCount);
	source.connect(analyser);
	analyser.connect(audioContext.destination);
	const frequencyData = new Uint8Array(analyser.frequencyBinCount * 0.7);
	//
	requestAnimationFrame(function callback(time) {
		analyser.getByteFrequencyData(frequencyData);
		handler(time);
		requestAnimationFrame(callback);
	});

	let max = 0;
	const duration = 10;

	/**
	 * @param {DOMHighResTimeStamp} time 
	 */
	function handler(time) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		const pathWidth = (canvas.width + pathGap) / frequencyData.length - pathGap;
		frequencyData.forEach((data, index) => {
			const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
			const color = Color.viaHSV(index / frequencyData.length * 360 + (time % (duration * 1000)) / (duration * 1000) * 360, 100, 100).toString();
			gradient.addColorStop(0, color);
			gradient.addColorStop(0.5, color);
			gradient.addColorStop(1, Color.black.toString());
			context.fillStyle = gradient;
			const pathX = (pathWidth + pathGap) * index;
			const pathHeight = canvas.height * (data / 255);
			const pathY = canvas.height - pathHeight;
			context.fillRect(pathX, pathY, pathWidth, pathHeight);
		});
		const index = frequencyData.findLastIndex(value => value != 0);
		if (index > max) {
			max = index;
			console.log(max);
		}
	}
});
