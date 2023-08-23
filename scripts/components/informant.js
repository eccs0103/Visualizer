"use strict";

class Informant {
	//#region Console
	/** @type {HTMLDialogElement} */ static #dialogConsole;
	static {
		const dialogConsole = document.querySelector(`dialog.console`);
		if (!(dialogConsole instanceof HTMLDialogElement)) {
			throw new TypeError(`Invalid element: ${dialogConsole}`);
		}
		Informant.#dialogConsole = dialogConsole;
	}
	/**
	 * @param {Object} [object]
	 */
	static log(object) {
		if (object === undefined && Informant.#dialogConsole.open) {
			Informant.#dialogConsole.open = false;
		} else if (object !== undefined && !Informant.#dialogConsole.open) {
			Informant.#dialogConsole.open = true;
		}
		if (object !== undefined && Informant.#dialogConsole.open) {
			Informant.#dialogConsole.replaceChildren(...Object.entries(object).flat().map((item) => {
				const span = document.createElement(`span`);
				span.innerText = item;
				return span;
			}));
		}
	}
	//#endregion
	//#region Pop Up
	/** @type {HTMLDialogElement} */ static #dialogPopUp;
	/** @type {HTMLButtonElement} */ static #buttonPrototype;
	/** @type {HTMLInputElement} */ static #inputPrototype;
	static {
		const dialogPopUp = document.querySelector(`dialog.pop-up`);
		if (!(dialogPopUp instanceof HTMLDialogElement)) {
			throw new TypeError(`Invalid element: ${dialogPopUp}`);
		}
		const dialogPopUpClone = (/** @type {HTMLDialogElement} */ (dialogPopUp.cloneNode()));

		const elementHeader = dialogPopUp.querySelector(`*.header`);
		if (!(elementHeader instanceof HTMLElement)) {
			throw new TypeError(`Invalid element: ${elementHeader}`);
		}
		const elementHeaderClone = dialogPopUpClone.appendChild(/** @type {HTMLElement} */(elementHeader.cloneNode()));

		const h3Title = elementHeader.querySelector(`h3`);
		if (!(h3Title instanceof HTMLHeadingElement)) {
			throw new TypeError(`Invalid element: ${h3Title}`);
		}
		const h3TitleClone = elementHeaderClone.appendChild(/** @type {HTMLHeadingElement} */(h3Title.cloneNode()));

		const elementContainer = dialogPopUp.querySelector(`*.container`);
		if (!(elementContainer instanceof HTMLElement)) {
			throw new TypeError(`Invalid element: ${elementContainer}`);
		}
		const elementContainerClone = dialogPopUpClone.appendChild(/** @type {HTMLElement} */(elementContainer.cloneNode()));

		const elementFooter = dialogPopUp.querySelector(`*.footer`);
		if (!(elementFooter instanceof HTMLElement)) {
			throw new TypeError(`Invalid element: ${elementFooter}`);
		}
		const elementFooterClone = dialogPopUpClone.appendChild(/** @type {HTMLElement} */(elementFooter.cloneNode()));

		const buttonPrototype = elementFooter.querySelector(`button`);
		if (!(buttonPrototype instanceof HTMLButtonElement)) {
			throw new TypeError(`Invalid element: ${buttonPrototype}`);
		}
		const buttonPrototypeClone = (/** @type {HTMLButtonElement} */(buttonPrototype.cloneNode()));

		const inputPrototype = elementFooter.querySelector(`input`);
		if (!(inputPrototype instanceof HTMLInputElement)) {
			throw new TypeError(`Invalid element: ${inputPrototype}`);
		}
		const inputPrototypeClone = (/** @type {HTMLInputElement} */(inputPrototype.cloneNode()));

		Informant.#dialogPopUp = dialogPopUpClone;
		Informant.#buttonPrototype = buttonPrototypeClone;
		Informant.#inputPrototype = inputPrototypeClone;
		dialogPopUp.remove();
	}
	/**
	 * @param {String} message 
	 * @param {String} title 
	 */
	static async alert(message, title = `Message`) {
		const dialogPopUp = document.body.appendChild(/** @type {HTMLDialogElement} */(Informant.#dialogPopUp.cloneNode(true)));
		dialogPopUp.addEventListener(`click`, (event) => {
			if (event.target === dialogPopUp) {
				dialogPopUp.close();
			}
		});
		dialogPopUp.showModal();
		//#region Header
		const elementHeader = dialogPopUp.querySelector(`*.header`);
		if (!(elementHeader instanceof HTMLElement)) {
			throw new TypeError(`Invalid element: ${elementHeader}`);
		}
		//#region Title
		const h3Title = elementHeader.querySelector(`h3`);
		if (!(h3Title instanceof HTMLHeadingElement)) {
			throw new TypeError(`Invalid element: ${h3Title}`);
		}
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
		const elementContainer = dialogPopUp.querySelector(`*.container`);
		if (!(elementContainer instanceof HTMLElement)) {
			throw new TypeError(`Invalid element: ${elementContainer}`);
		}
		elementContainer.innerText = message;
		//#endregion
		const promise = await ( /** @type {Promise<void>} */(new Promise((resolve) => {
			dialogPopUp.addEventListener(`close`, (event) => {
				resolve();
			});
		})));
		dialogPopUp.remove();
		return promise;
	}
	/**
	 * @param {String} message 
	 * @param {String} title 
	 */
	static async confirm(message, title = `Message`) {
		const dialogPopUp = document.body.appendChild(/** @type {HTMLDialogElement} */(Informant.#dialogPopUp.cloneNode(true)));
		dialogPopUp.addEventListener(`click`, (event) => {
			if (event.target === dialogPopUp) {
				dialogPopUp.close();
			}
		});
		dialogPopUp.showModal();
		//#region Header
		const elementHeader = dialogPopUp.querySelector(`*.header`);
		if (!(elementHeader instanceof HTMLElement)) {
			throw new TypeError(`Invalid element: ${elementHeader}`);
		}
		//#region Title
		const h3Title = elementHeader.querySelector(`h3`);
		if (!(h3Title instanceof HTMLHeadingElement)) {
			throw new TypeError(`Invalid element: ${h3Title}`);
		}
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
		const elementContainer = dialogPopUp.querySelector(`*.container`);
		if (!(elementContainer instanceof HTMLElement)) {
			throw new TypeError(`Invalid element: ${elementContainer}`);
		}
		elementContainer.innerText = message;
		//#endregion
		//#region Footer
		const elementFooter = dialogPopUp.querySelector(`*.footer`);
		if (!(elementFooter instanceof HTMLElement)) {
			throw new TypeError(`Invalid element: ${elementFooter}`);
		}
		//#region Button Accept
		const buttonAccept = elementFooter.appendChild(/** @type {HTMLButtonElement} */(Informant.#buttonPrototype.cloneNode(true)));
		buttonAccept.classList.add(`highlight`);
		buttonAccept.innerText = `Accept`;
		//#endregion
		//#region Button Decline
		const buttonDecline = elementFooter.appendChild(/** @type {HTMLButtonElement} */(Informant.#buttonPrototype.cloneNode(true)));
		buttonDecline.classList.add(`invalid`);
		buttonDecline.innerText = `Decline`;
		//#endregion
		//#endregion
		const promise = await (/** @type {Promise<Boolean>} */(new Promise((resolve) => {
			dialogPopUp.addEventListener(`close`, (event) => {
				resolve(false);
			});
			buttonAccept.addEventListener(`click`, (event) => {
				resolve(true);
			});
			buttonDecline.addEventListener(`click`, (event) => {
				resolve(false);
			});
		})));
		dialogPopUp.remove();
		return promise;
	}
	/**
	 * @param {String} message 
	 * @param {String} title 
	 */
	static async prompt(message, title = `Message`) {
		const dialogPopUp = document.body.appendChild(/** @type {HTMLDialogElement} */(Informant.#dialogPopUp.cloneNode(true)));
		dialogPopUp.addEventListener(`click`, (event) => {
			if (event.target === dialogPopUp) {
				dialogPopUp.close();
			}
		});
		dialogPopUp.showModal();
		//#region Header
		const elementHeader = dialogPopUp.querySelector(`*.header`);
		if (!(elementHeader instanceof HTMLElement)) {
			throw new TypeError(`Invalid element: ${elementHeader}`);
		}
		//#region Title
		const h3Title = elementHeader.querySelector(`h3`);
		if (!(h3Title instanceof HTMLHeadingElement)) {
			throw new TypeError(`Invalid element: ${h3Title}`);
		}
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
		const elementContainer = dialogPopUp.querySelector(`*.container`);
		if (!(elementContainer instanceof HTMLElement)) {
			throw new TypeError(`Invalid element: ${elementContainer}`);
		}
		elementContainer.innerText = message;
		//#endregion
		//#region Footer
		const elementFooter = dialogPopUp.querySelector(`*.footer`);
		if (!(elementFooter instanceof HTMLElement)) {
			throw new TypeError(`Invalid element: ${elementFooter}`);
		}
		//#region Button Accept
		const buttonAccept = elementFooter.appendChild(/** @type {HTMLButtonElement} */(Informant.#buttonPrototype.cloneNode(true)));
		buttonAccept.classList.add(`highlight`);
		buttonAccept.innerText = `Accept`;
		//#endregion
		//#region Button Decline
		const inputPrompt = elementFooter.appendChild(/** @type {HTMLInputElement} */(Informant.#inputPrototype.cloneNode(true)));
		//#endregion
		//#endregion
		const promise = await (/** @type {Promise<String?>} */(new Promise((resolve) => {
			dialogPopUp.addEventListener(`close`, (event) => {
				resolve(null);
			});
			buttonAccept.addEventListener(`click`, (event) => {
				resolve(inputPrompt.value);
			});
		})));
		dialogPopUp.remove();
		return promise;
	}
	//#endregion
}
