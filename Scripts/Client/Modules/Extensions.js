/// <reference path="../Declarations/Extensions.d.ts" />

"use strict";

//#region HTML element
/**
 * @template {typeof HTMLElement} T
 * @param {T} type 
 * @param {string} selectors 
 */
HTMLElement.prototype.getElement = function (type, selectors) {
	const element = this.querySelector(selectors);
	if (!(element instanceof type)) {
		throw new TypeError(`Element ${selectors} is missing or has invalid type`);
	}
	return (/** @type {InstanceType<T>} */ (element));
};

/**
 * @template {typeof HTMLElement} T
 * @param {T} type 
 * @param {string} selectors 
 * @param {boolean} strict 
 */
HTMLElement.prototype.tryGetElement = function (type, selectors, strict = false) {
	return (/** @type {Promise<InstanceType<T>>} */ (new Promise((resolve, reject) => {
		const element = this.querySelector(selectors);
		if (element instanceof type) {
			resolve(/** @type {InstanceType<T>} */(element));
		} else if (strict) {
			reject(new TypeError(`Element ${selectors} is missing or has invalid type`));
		}
	})));
};
//#endregion
//#region Document
/**
 * @template {typeof HTMLElement} T
 * @param {T} type 
 * @param {string} selectors 
 */
Document.prototype.getElement = function (type, selectors) {
	return this.documentElement.getElement(type, selectors);
};

/**
 * @template {typeof HTMLElement} T
 * @param {T} type 
 * @param {string} selectors 
 * @param {boolean} strict
 */
Document.prototype.tryGetElement = function (type, selectors, strict) {
	return this.documentElement.tryGetElement(type, selectors, strict);
};

const dialogConsole = document.getElement(HTMLDialogElement, `dialog.console`);
/**
 * @param {any} value 
 * @returns {string}
 */
function logify(value) {
	switch (typeof (value)) {
		case `string`: return value;
		case `number`:
		case `bigint`:
		case `boolean`: return String(value);
		case `object`: return Object.entries(value).map(([key, value]) => `${key}: ${logify(value)}`).join(`,\n`);
		case `symbol`:
		case `function`:
		case `undefined`: throw new TypeError(`Value has invalid ${typeof (value)} type`);
	}
}
/**
 * @param  {any[]} data 
 */
Document.prototype.log = function (...data) {
	if (data.length > 0) {
		if (!dialogConsole.open) dialogConsole.open = true;
		dialogConsole.innerText = data.map(item => logify(item)).join(`\n`);
	} else {
		if (dialogConsole.open) dialogConsole.open = false;
	}

};

/**
 * @param {any} error 
 */
Document.prototype.analysis = function (error) {
	return error instanceof Error ? error : new Error(`Undefined error type`);
};
//#endregion
//#region Math
/**
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
Math.between = function (value, min, max) {
	return Math.min(Math.max(min, value), max);
};

const toDegreeFactor = 180 / Math.PI;
/**
 * @param {number} radians 
 */
Math.toDegrees = function (radians) {
	return radians * toDegreeFactor;
};

const toRadianFactor = Math.PI / 180;
/**
 * @param {number} degrees 
 */
Math.toRadians = function (degrees) {
	return degrees * toRadianFactor;
};

/**
* @param {number} value 
* @param {number} period 
* @returns [0 - 1]
*/
Math.toFactor = function (value, period) {
	return value % (period + 1) / period;
};

/**
 * @param {number} value 
 * @param {number} period 
 * @returns [-1 - 1]
 */
Math.toSignedFactor = function (value, period) {
	return value % (period + 1) / period * 2 - 1;
};
//#endregion
//#region Window
const dialogAlert = document.getElement(HTMLDialogElement, `dialog.pop-up.alert`);
dialogAlert.addEventListener(`click`, (event) => {
	if (event.target === dialogAlert) {
		dialogAlert.close();
	}
});

/**
 * @param {string} message 
 * @param {string} title
 */
Window.prototype.alertAsync = function (message, title = `Message`) {
	dialogAlert.showModal();
	//#region Header
	const htmlHeader = dialogAlert.getElement(HTMLElement, `*.header`);
	//#region Title
	const h3Title = htmlHeader.getElement(HTMLHeadingElement, `h3`);
	switch (title) {
		case `Error`: {
			h3Title.classList.add(`invalid`);
		} break;
		case `Warning`: {
			h3Title.classList.add(`warn`);
		} break;
		default: {
			h3Title.classList.add(`highlight`);
		} break;
	}
	h3Title.innerText = title;
	//#endregion
	//#endregion
	//#region Container
	const htmlContainer = dialogAlert.getElement(HTMLElement, `*.container`);
	htmlContainer.innerText = message;
	//#endregion
	const controller = new AbortController();
	const promise = ( /** @type {Promise<void>} */(new Promise((resolve) => {
		dialogAlert.addEventListener(`close`, (event) => {
			resolve();
		}, { signal: controller.signal });
	})));
	promise.finally(() => {
		controller.abort();
		dialogAlert.close();
	});
	return promise;
};

const dialogConfirm = document.getElement(HTMLDialogElement, `dialog.pop-up.confirm`);
dialogConfirm.addEventListener(`click`, (event) => {
	if (event.target === dialogConfirm) {
		dialogConfirm.close();
	}
});

/**
 * @param {string} message 
 * @param {string} title
 */
Window.prototype.confirmAsync = function (message, title = `Message`) {
	dialogConfirm.showModal();
	//#region Header
	const htmlHeader = dialogConfirm.getElement(HTMLElement, `*.header`);
	//#region Title
	const h3Title = htmlHeader.getElement(HTMLHeadingElement, `h3`);
	switch (title) {
		case `Error`: {
			h3Title.classList.add(`invalid`);
		} break;
		case `Warning`: {
			h3Title.classList.add(`warn`);
		} break;
		default: {
			h3Title.classList.add(`highlight`);
		} break;
	}
	h3Title.innerText = title;
	//#endregion
	//#endregion
	//#region Container
	const htmlContainer = dialogConfirm.getElement(HTMLElement, `*.container`);
	htmlContainer.innerText = message;
	//#endregion
	//#region Footer
	const htmlFooter = dialogConfirm.getElement(HTMLElement, `*.footer`);
	//#region Button Accept
	const buttonAccept = htmlFooter.getElement(HTMLButtonElement, `button.highlight`);
	//#endregion
	//#region Button Decline
	const buttonDecline = htmlFooter.getElement(HTMLButtonElement, `button.invalid`);
	//#endregion
	//#endregion
	const controller = new AbortController();
	const promise = (/** @type {Promise<boolean>} */(new Promise((resolve) => {
		dialogConfirm.addEventListener(`close`, (event) => {
			resolve(false);
		}, { signal: controller.signal });
		buttonAccept.addEventListener(`click`, (event) => {
			resolve(true);
		}, { signal: controller.signal });
		buttonDecline.addEventListener(`click`, (event) => {
			resolve(false);
		}, { signal: controller.signal });
	})));
	promise.finally(() => {
		controller.abort();
		dialogConfirm.close();
	});
	return promise;
};

const dialogPrompt = document.getElement(HTMLDialogElement, `dialog.pop-up.prompt`);
dialogPrompt.addEventListener(`click`, (event) => {
	if (event.target === dialogPrompt) {
		dialogPrompt.close();
	}
});

/**
 * @param {string} message 
 * @param {string} title
 */
Window.prototype.promptAsync = function (message, title = `Message`) {
	dialogPrompt.showModal();
	//#region Header
	const htmlHeader = dialogPrompt.getElement(HTMLElement, `*.header`);
	//#region Title
	const h3Title = htmlHeader.getElement(HTMLHeadingElement, `h3`);
	switch (title) {
		case `Error`: {
			h3Title.classList.add(`invalid`);
		} break;
		case `Warning`: {
			h3Title.classList.add(`warn`);
		} break;
		default: {
			h3Title.classList.add(`highlight`);
		} break;
	}
	h3Title.innerText = title;
	//#endregion
	//#endregion
	//#region Container
	const htmlContainer = dialogPrompt.getElement(HTMLElement, `*.container`);
	htmlContainer.innerText = message;
	//#endregion
	//#region Footer
	const htmlFooter = dialogPrompt.getElement(HTMLElement, `*.footer`);
	//#region Button Accept
	const buttonAccept = htmlFooter.getElement(HTMLButtonElement, `button.highlight`);
	//#endregion
	//#region Input Prompt
	const inputPrompt = htmlFooter.getElement(HTMLInputElement, `input[type="text"]`);
	//#endregion
	//#endregion
	const controller = new AbortController();
	const promise = (/** @type {Promise<string?>} */(new Promise((resolve) => {
		dialogPrompt.addEventListener(`close`, (event) => {
			resolve(null);
		}, { signal: controller.signal });
		buttonAccept.addEventListener(`click`, (event) => {
			resolve(inputPrompt.value);
		}, { signal: controller.signal });
	})));
	promise.finally(() => {
		controller.abort();
		dialogPrompt.close();
	});
	return promise;
};

/**
 * @template T
 * @param {Promise<T>} promise 
 * @param {number} duration 
 * @param {number} delay 
 */
Window.prototype.load = async function (promise, duration = 200, delay = 0) {
	const dialogLoader = document.getElement(HTMLDialogElement, `dialog.loader`);
	try {
		dialogLoader.showModal();
		await dialogLoader.animate([
			{ opacity: `0` },
			{ opacity: `1` },
		], { duration: duration, fill: `both` }).finished;
		return await promise;
	} finally {
		await dialogLoader.animate([
			{ opacity: `1` },
			{ opacity: `0` },
		], { duration: duration, fill: `both`, delay: delay }).finished;
		dialogLoader.close();
	}
};

/**
 * @param {Error} error 
 * @param {boolean} locked
 */
Window.prototype.prevent = async function (error, locked = true) {
	const message = error.stack ?? `${error.name}: ${error.message}`;
	if (locked) {
		await window.alertAsync(message, `Error`);
		location.reload();
	} else {
		console.error(message);
	};
};
//#endregion
//#region Navigator
/**
 * @param {File} file 
 */
Navigator.prototype.download = function (file) {
	const aLink = document.createElement(`a`);
	aLink.download = file.name;
	aLink.href = URL.createObjectURL(file);
	aLink.click();
	URL.revokeObjectURL(aLink.href);
	aLink.remove();
};
//#endregion
//#region Location
Location.prototype.getSearchMap = function () {
	return new Map(window.decodeURI(location.search.replace(/^\??/, ``)).split(`&`).filter(item => item).map((item) => {
		const [key, value] = item.split(`=`, 2);
		return [key, value];
	}));
};
//#endregion

export { };