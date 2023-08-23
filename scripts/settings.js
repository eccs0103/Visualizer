// @ts-ignore
/** @typedef {import("./structure.js")} */

"use strict";

try {
	//#region Definition
	const inputToggleLoop = document.querySelector(`input#toggle-loop`);
	if (!(inputToggleLoop instanceof HTMLInputElement)) {
		throw new TypeError(`Invalid element: ${inputToggleLoop}`);
	}

	const selectQuality = document.querySelector(`select#quality`);
	if (!(selectQuality instanceof HTMLSelectElement)) {
		throw new TypeError(`Invalid element: ${selectQuality}`);
	}

	const selectVisualization = document.querySelector(`select#visualization`);
	if (!(selectVisualization instanceof HTMLSelectElement)) {
		throw new TypeError(`Invalid element: ${selectVisualization}`);
	}

	const inputToggleAutoplay = document.querySelector(`input#toggle-autoplay`);
	if (!(inputToggleAutoplay instanceof HTMLInputElement)) {
		throw new TypeError(`Invalid element: ${inputToggleAutoplay}`);
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

	selectVisualization.value = `${settings.type}`;
	selectVisualization.addEventListener(`change`, (event) => {
		settings.type = selectVisualization.value;
	});

	inputToggleAutoplay.checked = settings.autoplay;
	inputToggleAutoplay.addEventListener(`change`, (event) => {
		settings.autoplay = inputToggleAutoplay.checked;
	});

	buttonResetSettings.addEventListener(`click`, async (event) => {
		if (await Manager.confirm(`The settings will be reset to factory defaults. Are you sure?`, `Warning`)) {
			settings.reset();
			inputToggleLoop.checked = settings.loop;
			selectQuality.value = `${settings.quality}`;
			selectVisualization.value = `${settings.type}`;
			inputToggleAutoplay.checked = settings.autoplay;
		}
	});

	buttonShareSettings.addEventListener(`click`, async (event) => {
		try {
			const addressee = `eccs0103@gmail.com`;
			const subject = `Visualizer preferred configuration`;
			const message = `${Object.entries(Settings.export(settings)).map(([key, value]) => `${key}: ${value}`).join(`\n`)}`;
			if (buttonShareSettings.dataset[`manual`] === undefined) {
				await Manager.alert(`Now the browser will try to create an automatic email for you. If there are problems, it will cancel the operation and return you to the page. By clicking on the button for the second time, manual sending will be opened and the address will be copied to the clipboard. You will have to send the email manually.\nThis feature is related to the browser and we can not influence it in any way.`, `Warning`);
				location.href = `mailto:${addressee}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
				buttonShareSettings.dataset[`manual`] = ``;
			} else {
				await navigator.clipboard.writeText(addressee);
				await navigator.share({ title: subject, text: message });
			}
		} catch (error) {
			Manager.prevent(error);
		}
	});
	//#endregion
} catch (error) {
	Manager.prevent(error);
}
