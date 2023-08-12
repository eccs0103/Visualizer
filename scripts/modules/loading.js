"use strict";

const duration = 500;
const dialogLoading = document.body.querySelector(`dialog#loading`);
if (!(dialogLoading instanceof HTMLDialogElement)) {
	throw new TypeError(`Invalid element type: ${dialogLoading}`);
}
if (dialogLoading) {
	dialogLoading.style.opacity = `0`;
	
	dialogLoading.showModal();
	dialogLoading.animate([
		{ opacity: `1` }
	], { duration: duration * 0.2, iterations: 1, fill: `both` });

	window.addEventListener(`load`, async (event) => {
		await dialogLoading.animate([
			{ opacity: `0` }
		], { duration:  duration * 0.8, iterations: 1, fill: `both` }).finished;
		dialogLoading.close();
	});
}
