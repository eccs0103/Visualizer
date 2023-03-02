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
	//#region Highlight Motion
	const inputToggleClassicHighlightMotion = (/** @type {HTMLInputElement} */ (document.querySelector(`input#toggle-classic-hightlight-motion`)));
	inputToggleClassicHighlightMotion.checked = settings.classicHightlightMotion;
	inputToggleClassicHighlightMotion.addEventListener(`change`, (event) => {
		settings.classicHightlightMotion = inputToggleClassicHighlightMotion.checked;
	});
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
		if (await Application.confirm(`The settings will be reset to factory defaults. Are you sure?`)) {
			settings = new Settings();
			inputToggleLoop.checked = settings.loop;
			selectFFTSize.value = `${settings.FFTSize}`;
			selectVisualizerType.value = `${settings.type}`;
			inputToggleClassicHighlightMotion.checked = settings.classicHightlightMotion;
			inputClassicHighlightCycleTime.value = `${settings.classicHighlightCycleTime.toFixed(1)}`;
			inputClassicGapPercentage.value = `${settings.classicGapPercentage}`;
			inputToggleClassicReflection.checked = settings.classicReflection;
		}
	});
	//#endregion
	//#region Share settings
	const buttonShareSettings = (/** @type {HTMLButtonElement} */ (document.querySelector(`button#share-settings`)));
	buttonShareSettings.addEventListener(`click`, (event) => {
		const to = `eccs0103@gmail.com`;
		const subject = `Visualizer preferred configuration`;
		const body = `${Object.entries(Settings.export(settings)).map(([key, value]) => {
			return `${key}: ${value}`;
		}).join(`\n`)}`;
		location.assign(window.encodeURI(`https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`));
	});
	//#endregion
} catch (exception) {
	Application.prevent(exception);
}
