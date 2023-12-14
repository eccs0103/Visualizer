// @ts-ignore
/** @typedef {import("./declarations/extensions.d.ts")} */

"use strict";

//#region HTML element
/**
 * @template {typeof HTMLElement} T
 * @param {T} type 
 * @param {String} selectors 
 */
HTMLElement.prototype.getElement = function (type, selectors) {
	const element = this.querySelector(selectors);
	if (!(element instanceof type)) {
		throw new TypeError(`Element ${selectors} is missing or has invalid type`);
	}
	return (/** @type {InstanceType<T>} */ (element));
};
//#endregion
//#region Document
/**
 * @template {typeof HTMLElement} T
 * @param {T} type 
 * @param {String} selectors 
 */
Document.prototype.getElement = function (type, selectors) {
	return this.documentElement.getElement(type, selectors);
};

// /**
//  * @param  {any[]} data 
//  */
// Document.prototype.log = function (...data) {
// 	const dialogConsole = this.getElement(HTMLDialogElement, `dialog.console`);
// 	dialogConsole.innerText = `${data.join(` `)}`;
// 	dialogConsole.open = true;
// };

/**
 * @param {any} error 
 */
Document.prototype.analysis = function (error) {
	return error instanceof Error ? error : new Error(`Undefined error type`);
};

/**
 * @param {Error} error 
 * @param {Boolean} locked
 */
Document.prototype.prevent = async function (error, locked = true) {
	const message = error.stack ?? `${error.name}: ${error.message}`;
	if (locked) {
		await window.alertAsync(message, `Error`);
		location.reload();
	} else {
		console.error(message);
	};
};
//#endregion
//#region Math
/**
* @param {Number} value 
* @param {Number} period 
* @returns [0 - 1)
*/
Math.toFactor = function (value, period) {
	return value % period / period;
};

/**
 * @param {Number} value 
 * @param {Number} period 
 * @returns [-1 - 1)
 */
Math.toSignedFactor = function (value, period) {
	return value % period / (period / 2) - 1;
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
 * @param {String} message 
 * @param {String} title
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
 * @param {String} message 
 * @param {String} title
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
	const promise = (/** @type {Promise<Boolean>} */(new Promise((resolve) => {
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
 * @param {String} message 
 * @param {String} title
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
	const promise = (/** @type {Promise<String?>} */(new Promise((resolve) => {
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
 * @param {Number} duration 
 * @param {Number} delay 
 */
Window.prototype.load = async function (promise, duration = 200, delay = 0) {
	const dialogLoader = document.getElement(HTMLDialogElement, `dialog.loader`);
	dialogLoader.showModal();
	await dialogLoader.animate([
		{ opacity: `0` },
		{ opacity: `1` },
	], { duration: duration, fill: `both` }).finished;
	const value = await promise;
	await dialogLoader.animate([
		{ opacity: `1` },
		{ opacity: `0` },
	], { duration: duration, fill: `both`, delay: delay }).finished;
	dialogLoader.close();
	return value;
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
