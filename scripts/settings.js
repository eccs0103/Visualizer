"use strict";

import {
	Settings,
	SpectrogramVisualizationSettings,
	VisualizationSettings,
	Visualizations,
	containerSettings,
	settings
} from "./structure.js";

void async function () {
	try {
		//#region Initializing
		const inputToggleLoop = document.getElement(HTMLInputElement, `input#toggle-loop`);
		const inputToggleAutoplay = document.getElement(HTMLInputElement, `input#toggle-autoplay`);
		const inputInformationDuration = document.getElement(HTMLInputElement, `input#information-duration`);
		const selectVisualization = document.getElement(HTMLSelectElement, `select#visualization`);
		const selectQuality = document.getElement(HTMLSelectElement, `select#quality`);
		const inputSmoothing = document.getElement(HTMLInputElement, `input#smoothing`);
		const inputMinDecibels = document.getElement(HTMLInputElement, `input#min-decibels`);
		const inputMaxDecibels = document.getElement(HTMLInputElement, `input#max-decibels`);
		const inputSpectrogramAnchor = document.getElement(HTMLInputElement, `input#spectrogram-anchor`);
		const sectionSpectrogramAnchor = inputSpectrogramAnchor.parentElement ?? (() => {
			throw new TypeError(`Parent element is missing or has invalid type`);
		})();
		const buttonResetSettings = document.getElement(HTMLButtonElement, `button#reset-settings`);
		const buttonShareSettings = document.getElement(HTMLButtonElement, `button#share-settings`);
		//#endregion
		//#region Settings
		inputToggleLoop.checked = settings.loop;
		inputToggleLoop.addEventListener(`change`, (event) => {
			settings.loop = inputToggleLoop.checked;
		});

		inputToggleAutoplay.checked = settings.autoplay;
		inputToggleAutoplay.addEventListener(`change`, (event) => {
			settings.autoplay = inputToggleAutoplay.checked;
		});

		inputInformationDuration.value = `${settings.information}`;
		inputInformationDuration.addEventListener(`change`, (event) => {
			settings.information = Number(inputInformationDuration.value);
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
		//#endregion
		//#region Reset settings
		buttonResetSettings.addEventListener(`click`, async (event) => {
			if (await window.confirmAsync(`The settings will be reset to factory defaults. Are you sure?`, `Warning`)) {
				containerSettings.reset();
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
		//#endregion
		//#region Share settings
		buttonShareSettings.addEventListener(`click`, (event) => {
			const addressee = `eccs0103@gmail.com`;
			const subject = `Visualizer preferred configuration`;
			const message = JSON.stringify(Settings.export(settings), undefined, `\t`);
			location.href = `mailto:${addressee}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
		});
		//#endregion
	} catch (error) {
		document.prevent(document.analysis(error));
	}
}();
