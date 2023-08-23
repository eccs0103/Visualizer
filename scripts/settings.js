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
		// const addressee = `eccs0103@gmail.com`;
		const subject = `Visualizer preferred configuration`;
		const message = `${Object.entries(Settings.export(settings)).map(([key, value]) => {
			return `${key}: ${value}`;
		}).join(`\n`)}`;
		// const link = window.encodeURI(`mailto:${addressee}?subject=${subject}&body=${message}`);
		// const href = String(location.href);
		// location.assign(link);
		// if (location.href === href) {
		try {
				/** @type {ShareData} */ const data = { title: subject, text: message };
			// if (navigator.canShare(data)) {
			await navigator.share({ title: subject, text: message });
			// }
		} catch (error) {
			await Manager.prevent(error);
		}
		// }
	});
	//#endregion
} catch (error) {
	Manager.prevent(error);
}
