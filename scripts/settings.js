// @ts-ignore
/** @typedef {import("./structure.js")} */

"use strict";

try {
	//#region Definition
	const inputToggleLoop = document.querySelector(`input#toggle-loop`);
	if (!(inputToggleLoop instanceof HTMLInputElement)) {
		throw new TypeError(`Invalid element: ${inputToggleLoop}`);
	}

	const inputToggleAutoplay = document.querySelector(`input#toggle-autoplay`);
	if (!(inputToggleAutoplay instanceof HTMLInputElement)) {
		throw new TypeError(`Invalid element: ${inputToggleAutoplay}`);
	}

	const selectVisualization = document.querySelector(`select#visualization`);
	if (!(selectVisualization instanceof HTMLSelectElement)) {
		throw new TypeError(`Invalid element: ${selectVisualization}`);
	}

	const selectQuality = document.querySelector(`select#quality`);
	if (!(selectQuality instanceof HTMLSelectElement)) {
		throw new TypeError(`Invalid element: ${selectQuality}`);
	}

	const inputSmoothing = document.querySelector(`input#smoothing`);
	if (!(inputSmoothing instanceof HTMLInputElement)) {
		throw new TypeError(`Invalid element: ${inputSmoothing}`);
	}

	const inputMinDecibels = document.querySelector(`input#min-decibels`);
	if (!(inputMinDecibels instanceof HTMLInputElement)) {
		throw new TypeError(`Invalid element: ${inputMinDecibels}`);
	}

	const inputMaxDecibels = document.querySelector(`input#max-decibels`);
	if (!(inputMaxDecibels instanceof HTMLInputElement)) {
		throw new TypeError(`Invalid element: ${inputMaxDecibels}`);
	}

	const inputSpectrogramAnchor = document.querySelector(`input#spectrogram-anchor`);
	if (!(inputSpectrogramAnchor instanceof HTMLInputElement)) {
		throw new TypeError(`Invalid element: ${inputSpectrogramAnchor}`);
	}

	const sectionSpectrogramAnchor = inputSpectrogramAnchor.parentElement;
	if (!(sectionSpectrogramAnchor instanceof HTMLElement)) {
		throw new TypeError(`Invalid element: ${sectionSpectrogramAnchor}`);
	}

	const buttonResetSettings = document.querySelector(`button#reset-settings`);
	if (!(buttonResetSettings instanceof HTMLButtonElement)) {
		throw new TypeError(`Invalid element: ${buttonResetSettings}`);
	}

	const buttonShareSettings = document.querySelector(`button#share-settings`);
	if (!(buttonShareSettings instanceof HTMLButtonElement)) {
		throw new TypeError(`Invalid element: ${buttonShareSettings}`);
	}
	//#endregion
	//#region Initialize
	window.addEventListener(`beforeunload`, (event) => {
		archiveSettings.data = Settings.export(settings);
	});

	inputToggleLoop.checked = settings.loop;
	inputToggleLoop.addEventListener(`change`, (event) => {
		settings.loop = inputToggleLoop.checked;
	});

	inputToggleAutoplay.checked = settings.autoplay;
	inputToggleAutoplay.addEventListener(`change`, (event) => {
		settings.autoplay = inputToggleAutoplay.checked;
	});

	for (const type of Object.values(Visualizations)) {
		const optionVisualization = selectVisualization.appendChild(document.createElement(`option`));
		optionVisualization.value = `${type}`;
		optionVisualization.innerText = `${type[0].toUpperCase()}${type.substring(1)}`;
		optionVisualization.title = optionVisualization.innerText;
	}
	selectVisualization.value = `${settings.type}`;
	selectVisualization.addEventListener(`change`, (event) => {
		settings.type = selectVisualization.value;
	});

	for (let quality = VisualizationSettings.minQuality; quality <= VisualizationSettings.maxQuality; quality++) {
		const optionQuality = selectQuality.appendChild(document.createElement(`option`));
		optionQuality.value = `${quality}`;
		optionQuality.innerText = `${quality} level`;
		optionQuality.title = optionQuality.innerText;
	}
	selectQuality.value = `${settings.visualization.quality}`;
	selectVisualization.addEventListener(`change`, (event) => {
		selectQuality.value = `${settings.visualization.quality}`;
	});
	selectQuality.addEventListener(`change`, (event) => {
		settings.visualization.quality = Number(selectQuality.value);
	});

	inputSmoothing.value = `${settings.visualization.smoothing}`;
	selectVisualization.addEventListener(`change`, (event) => {
		inputSmoothing.value = `${settings.visualization.smoothing}`;
	});
	inputSmoothing.addEventListener(`change`, (event) => {
		settings.visualization.smoothing = Number(inputSmoothing.value);
	});

	inputMinDecibels.value = `${settings.visualization.minDecibels}`;
	selectVisualization.addEventListener(`change`, (event) => {
		inputMinDecibels.value = `${settings.visualization.minDecibels}`;
	});
	inputMinDecibels.addEventListener(`change`, (event) => {
		settings.visualization.minDecibels = Number(inputMinDecibels.value);
	});

	inputMaxDecibels.value = `${settings.visualization.maxDecibels}`;
	selectVisualization.addEventListener(`change`, (event) => {
		inputMaxDecibels.value = `${settings.visualization.maxDecibels}`;
	});
	inputMaxDecibels.addEventListener(`change`, (event) => {
		settings.visualization.maxDecibels = Number(inputMaxDecibels.value);
	});

	if (settings.visualization instanceof SpectrogramVisualizationSettings) {
		sectionSpectrogramAnchor.hidden = false;
		inputSpectrogramAnchor.value = `${settings.visualization.anchor}`;
	} else {
		sectionSpectrogramAnchor.hidden = true;
	}
	selectVisualization.addEventListener(`change`, (event) => {
		if (settings.visualization instanceof SpectrogramVisualizationSettings) {
			sectionSpectrogramAnchor.hidden = false;
			inputSpectrogramAnchor.value = `${settings.visualization.anchor}`;
		} else {
			sectionSpectrogramAnchor.hidden = true;
		}
	});
	inputSpectrogramAnchor.addEventListener(`change`, (event) => {
		if (settings.visualization instanceof SpectrogramVisualizationSettings) {
			settings.visualization.anchor = Number(inputSpectrogramAnchor.value);
		} else throw new TypeError(`Invalid settings type`);
	});

	buttonResetSettings.addEventListener(`click`, async (event) => {
		if (await Manager.confirm(`The settings will be reset to factory defaults. Are you sure?`, `Warning`)) {
			settings.reset();
			inputToggleLoop.checked = settings.loop;
			inputToggleAutoplay.checked = settings.autoplay;
			selectVisualization.value = `${settings.type}`;
			selectQuality.value = `${settings.visualization.quality}`;
			inputSmoothing.value = `${settings.visualization.smoothing}`;
			if (settings.visualization instanceof SpectrogramVisualizationSettings) {
				inputSpectrogramAnchor.value = `${settings.visualization.anchor}`;
			}
		}
	});

	buttonShareSettings.addEventListener(`click`, (event) => {
		const addressee = `eccs0103@gmail.com`;
		const subject = `Visualizer preferred configuration`;
		const message = JSON.stringify(Settings.export(settings), undefined, `\t`);
		location.href = `mailto:${addressee}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
	});
	//#endregion
} catch (error) {
	Manager.prevent(error);
}
