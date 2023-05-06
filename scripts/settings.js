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
	//#region Waveform
	//#region Highlight cycle time
	const inputClassicHighlightCycleTime = (/** @type {HTMLInputElement} */ (document.querySelector(`input#waveform-highlight-cycle-time`)));
	inputClassicHighlightCycleTime.min = `${Settings.waveformMinHighlightCycleTime}`;
	inputClassicHighlightCycleTime.max = `${Settings.waveformMaxHighlightCycleTime}`;
	inputClassicHighlightCycleTime.placeholder = `[${Settings.waveformMinHighlightCycleTime} - ${Settings.waveformMaxHighlightCycleTime}]`;
	inputClassicHighlightCycleTime.value = `${settings.waveformHighlightCycleTime.toFixed(1)}`;
	inputClassicHighlightCycleTime.addEventListener(`change`, (event) => {
		settings.waveformHighlightCycleTime = Number(inputClassicHighlightCycleTime.value);
	});
	//#endregion
	//#region Gap percentage
	const inputClassicGapPercentage = (/** @type {HTMLInputElement} */ (document.querySelector(`input#waveform-gap-percentage`)));
	inputClassicGapPercentage.min = `${Settings.waveformMinGapPercentage}`;
	inputClassicGapPercentage.max = `${Settings.waveformMaxGapPercentage}`;
	inputClassicGapPercentage.step = `${(Settings.waveformMaxGapPercentage - Settings.waveformMinGapPercentage) / 100}`;
	inputClassicGapPercentage.placeholder = `[${Settings.waveformMinGapPercentage} - ${Settings.waveformMaxGapPercentage}]`;
	inputClassicGapPercentage.value = `${settings.waveformGapPercentage}`;
	inputClassicGapPercentage.addEventListener(`change`, (event) => {
		settings.waveformGapPercentage = Number(inputClassicGapPercentage.value);
	});
	//#endregion
	//#region Reflection
	const inputToggleClassicReflection = (/** @type {HTMLInputElement} */ (document.querySelector(`input#toggle-waveform-reflection`)));
	inputToggleClassicReflection.checked = settings.waveformReflection;
	inputToggleClassicReflection.addEventListener(`change`, (event) => {
		settings.waveformReflection = inputToggleClassicReflection.checked;
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
			inputClassicHighlightCycleTime.value = `${settings.waveformHighlightCycleTime.toFixed(1)}`;
			inputClassicGapPercentage.value = `${settings.waveformGapPercentage}`;
			inputToggleClassicReflection.checked = settings.waveformReflection;
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
