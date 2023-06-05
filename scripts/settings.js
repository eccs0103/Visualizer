// @ts-ignore
/** @typedef {import("./structure")} */

"use strict";

window.addEventListener(`beforeunload`, (event) => {
	archiveSettings.data = Settings.export(settings);
});

try {
	//#region Loop audio
	const inputToggleLoop = (/** @type {HTMLInputElement} */ (document.querySelector(`input#toggle-loop`)));
	inputToggleLoop.checked = settings.loop;
	inputToggleLoop.addEventListener(`change`, (event) => {
		settings.loop = inputToggleLoop.checked;
	});
	//#endregion
	//#region Quality
	const selectQuality = (/** @type {HTMLSelectElement} */ (document.querySelector(`select#quality`)));
	for (let quality = Settings.minQuality; quality <= Settings.maxQuality; quality++) {
		const optionQuality = selectQuality.appendChild(document.createElement(`option`));
		optionQuality.value = `${quality}`;
		optionQuality.innerText = `${quality} level`;
		optionQuality.title = optionQuality.innerText;
	}
	selectQuality.value = `${settings.quality}`;
	selectQuality.addEventListener(`change`, (event) => {
		settings.quality = Number(selectQuality.value);
	});
	//#endregion
	//#region Visualizer type
	const selectVisualizerType = (/** @type {HTMLSelectElement} */ (document.querySelector(`select#visualizer-type`)));
	selectVisualizerType.value = `${settings.type}`;
	selectVisualizerType.addEventListener(`change`, (event) => {
		settings.type = selectVisualizerType.value;
	});
	//#endregion
	//#region Reset settings
	const buttonResetSettings = (/** @type {HTMLButtonElement} */ (document.querySelector(`button#reset-settings`)));
	buttonResetSettings.addEventListener(`click`, async (event) => {
		if (await Application.confirm(`The settings will be reset to factory defaults. Are you sure?`, MessageType.warn)) {
			settings = new Settings();
			inputToggleLoop.checked = settings.loop;
			selectQuality.value = `${settings.quality}`;
			selectVisualizerType.value = `${settings.type}`;
		}
	});
	//#endregion
	//#region Share settings
	const buttonShareSettings = (/** @type {HTMLButtonElement} */ (document.querySelector(`button#share-settings`)));
	buttonShareSettings.addEventListener(`click`, async (event) => {
		const addressee = `eccs0103@gmail.com`;
		const subject = `Visualizer preferred configuration`;
		const message = `${Object.entries(Settings.export(settings)).map(([key, value]) => {
			return `${key}: ${value}`;
		}).join(`\n`)}`;
		// const link = location.href;
		location.assign(window.encodeURI(`mailto:${addressee}?subject=${subject}&body=${message}`));
		// if (location.href == link) {
		// 	if (await Application.confirm(`Your browser does not support mail sharing. Do you want to share it manualy?`, MessageType.warn)) {
		// 		navigator.share({
		// 			title: subject,
		// 			text: message,
		// 		}).catch((reason) => {
		// 			Application.prevent(reason);
		// 		})
		// 	}
		// }
	});
	//#endregion
} catch (exception) {
	Application.prevent(exception);
}
