"use strict";
let settings = Settings.import(archiveSettings.data);
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
	//#region FFT size
	const selectFFTSize = (/** @type {HTMLSelectElement} */ (document.querySelector(`select#FFT-size`)));
	selectFFTSize.value = `${settings.FFTSize}`;
	selectFFTSize.addEventListener(`change`, (event) => {
		settings.FFTSize = Number(selectFFTSize.value);
	});
	//#endregion
	//#region Visualizer type
	const selectVisualizerType = (/** @type {HTMLSelectElement} */ (document.querySelector(`select#visualizer-type`)));
	selectVisualizerType.value = `${settings.type}`;
	selectVisualizerType.addEventListener(`change`, (event) => {
		settings.type = selectVisualizerType.value;
	});
	//#region Classic
	//#region Highlight cycle time
	const inputClassicHighlightCycleTime = (/** @type {HTMLInputElement} */ (document.querySelector(`input#classic-highlight-cycle-time`)));
	inputClassicHighlightCycleTime.min = `${Settings.classicMinHighlightCycleTime}`;
	inputClassicHighlightCycleTime.max = `${Settings.classicMaxHighlightCycleTime}`;
	inputClassicHighlightCycleTime.placeholder = `[${Settings.classicMinHighlightCycleTime} - ${Settings.classicMaxHighlightCycleTime}]`;
	inputClassicHighlightCycleTime.value = `${settings.classicHighlightCycleTime.toFixed(1)}`;
	inputClassicHighlightCycleTime.addEventListener(`change`, (event) => {
		settings.classicHighlightCycleTime = Number(inputClassicHighlightCycleTime.value);
	});
	//#endregion
	//#region Gap percentage
	const inputClassicGapPercentage = (/** @type {HTMLInputElement} */ (document.querySelector(`input#classic-gap-percentage`)));
	inputClassicGapPercentage.min = `${Settings.classicMinGapPercentage}`;
	inputClassicGapPercentage.max = `${Settings.classicMaxGapPercentage}`;
	inputClassicGapPercentage.step = `${(Settings.classicMaxGapPercentage - Settings.classicMinGapPercentage) / 100}`;
	inputClassicGapPercentage.placeholder = `[${Settings.classicMinGapPercentage} - ${Settings.classicMaxGapPercentage}]`;
	inputClassicGapPercentage.value = `${settings.classicGapPercentage}`;
	inputClassicGapPercentage.addEventListener(`change`, (event) => {
		settings.classicGapPercentage = Number(inputClassicGapPercentage.value);
	});
	//#endregion
	//#region Reflection
	const inputToggleClassicReflection = (/** @type {HTMLInputElement} */ (document.querySelector(`input#toggle-classic-reflection`)));
	inputToggleClassicReflection.checked = settings.classicReflection;
	inputToggleClassicReflection.addEventListener(`change`, (event) => {
		settings.classicReflection = inputToggleClassicReflection.checked;
	});
	//#endregion
	//#endregion
	//#endregion
	//#region Reset settings
	const buttonResetSettings = (/** @type {HTMLButtonElement} */ (document.querySelector(`button#reset-settings`)));
	buttonResetSettings.addEventListener(`click`, async (event) => {
		if (await Application.confirm(`The settings will be reset to factory defaults. Are you sure?`, MessageType.warn)) {
			settings = new Settings();
			inputToggleLoop.checked = settings.loop;
			selectFFTSize.value = `${settings.FFTSize}`;
			selectVisualizerType.value = `${settings.type}`;
			inputClassicHighlightCycleTime.value = `${settings.classicHighlightCycleTime.toFixed(1)}`;
			inputClassicGapPercentage.value = `${settings.classicGapPercentage}`;
			inputToggleClassicReflection.checked = settings.classicReflection;
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
