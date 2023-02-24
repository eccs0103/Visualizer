"use strict";
let settings = Settings.import(archiveSettings.data);
window.addEventListener(`beforeunload`, (event) => {
	archiveSettings.data = Settings.export(settings);
});

try {
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
	//#endregion
	//#region Highlight cycle time
	const inputHighlightCycleTime = (/** @type {HTMLInputElement} */ (document.querySelector(`input#highlight-cycle-time`)));
	inputHighlightCycleTime.min = `${Settings.minHighlightCycleTime}`;
	inputHighlightCycleTime.max = `${Settings.maxHighlightCycleTime}`;
	inputHighlightCycleTime.placeholder = `[${Settings.minHighlightCycleTime} - ${Settings.maxHighlightCycleTime}]`;
	inputHighlightCycleTime.value = `${settings.highlightCycleTime.toFixed(1)}`;
	inputHighlightCycleTime.addEventListener(`change`, (event) => {
		settings.highlightCycleTime = Number(inputHighlightCycleTime.value);
	});
	//#endregion
	//#region Gap percentage
	const inputGapPercentage = (/** @type {HTMLInputElement} */ (document.querySelector(`input#gap-percentage`)));
	inputGapPercentage.min = `${Settings.minGapPercentage}`;
	inputGapPercentage.max = `${Settings.maxGapPercentage}`;
	inputGapPercentage.step = `${(Settings.maxGapPercentage - Settings.minGapPercentage) / 100}`;
	inputGapPercentage.placeholder = `[${Settings.minGapPercentage} - ${Settings.maxGapPercentage}]`;
	inputGapPercentage.value = `${settings.gapPercentage}`;
	inputGapPercentage.addEventListener(`change`, (event) => {
		settings.gapPercentage = Number(inputGapPercentage.value);
	});
	//#endregion
	//#region Reset settings
	const buttonResetSettings = (/** @type {HTMLButtonElement} */ (document.querySelector(`button#reset-settings`)));
	buttonResetSettings.addEventListener(`click`, (event) => {
		if (window.confirm(`The settings will be reset to factory defaults. Are you sure?`)) {
			settings = new Settings();
			selectFFTSize.value = `${settings.FFTSize}`;
			selectVisualizerType.value = `${settings.type}`;
			inputHighlightCycleTime.value = `${settings.highlightCycleTime.toFixed(1)}`;
			inputGapPercentage.value = `${settings.gapPercentage}`;
		}
	});
	//#endregion
} catch (exception) {
	Application.prevent(exception);
}
