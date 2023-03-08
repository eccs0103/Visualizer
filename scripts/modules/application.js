"use strict";
/** @enum {Number} */ const MessageType = {
	/** @readonly */ log: 0,
	/** @readonly */ warn: 1,
	/** @readonly */ error: 2,
};
class Application {
	/** @type {String} */ static #developer = `Adaptive Core`;
	/** @readonly */ static get developer() {
		return this.#developer;
	}
	/** @type {String} */ static #title = `Visualizer`;
	/** @readonly */ static get title() {
		return this.#title;
	}
	static #locked = true;
	static #search = new Map(window.decodeURI(location.search.replace(/^\??/, ``)).split(`&`).filter(item => item).map((item) => {
		const [key, value] = item.split(`=`);
		return [key, value];
	}));
	/** @readonly */ static get search() {
		return this.#search;
	}
	/**
	 * @param {MessageType} type 
	 */
	static #popup(type) {
		const dialog = document.body.appendChild(document.createElement(`dialog`));
		dialog.classList.add(`layer`, `pop-up`);
		dialog.showModal();
		{
			const divHeader = dialog.appendChild(document.createElement(`div`));
			divHeader.classList.add(`header`, `flex`);
			{
				const h3Title = divHeader.appendChild(document.createElement(`h3`));
				switch (type) {
					case MessageType.log: {
						h3Title.innerText = `Message`;
						h3Title.classList.add(`highlight`);
					} break;
					case MessageType.warn: {
						h3Title.innerText = `Warning`;
						h3Title.classList.add(`warn`);
					} break;
					case MessageType.error: {
						h3Title.innerText = `Error`;
						h3Title.classList.add(`alert`);
					} break;
					default: throw new TypeError(`Invalid message type.`);
				}
				{ }
			}
			const divMain = dialog.appendChild(document.createElement(`div`));
			divMain.classList.add(`main`);
			{ }
			const divFooter = dialog.appendChild(document.createElement(`div`));
			divFooter.classList.add(`footer`, `flex`);
			{ }
		}
		return dialog;
	}
	/**
	 * @param {String} message 
	 * @param {MessageType} type 
	 */
	static async alert(message, type = MessageType.log) {
		const dialog = this.#popup(type);
		{
			const divMain = (/** @type {HTMLDivElement} */ (dialog.querySelector(`div.main`)));
			{
				divMain.innerText = message;
			}
			return (/** @type {Promise<void>} */ (new Promise((resolve) => {
				dialog.addEventListener(`click`, (event) => {
					if (event.target == dialog) {
						resolve();
						dialog.remove();
					}
				});
			})));
		}
	}
	/**
	 * @param {String} message 
	 * @param {MessageType} type 
	 */
	static async confirm(message, type = MessageType.log) {
		const dialog = this.#popup(type);
		{
			const divMain = (/** @type {HTMLDivElement} */ (dialog.querySelector(`div.main`)));
			{
				divMain.innerText = message;
			}
			const divFooter = (/** @type {HTMLDivElement} */ (dialog.querySelector(`div.footer`)));
			{
				const buttonAccept = divFooter.appendChild(document.createElement(`button`));
				buttonAccept.innerText = `Accept`;
				buttonAccept.classList.add(`layer`, `transparent`, `highlight`);
				{ }
				const buttonDecline = divFooter.appendChild(document.createElement(`button`));
				buttonDecline.innerText = `Decline`;
				buttonDecline.classList.add(`layer`, `transparent`, `alert`);
				{ }
				return (/** @type {Promise<Boolean>} */ (new Promise((resolve) => {
					dialog.addEventListener(`click`, (event) => {
						if (event.target == dialog) {
							resolve(false);
							dialog.remove();
						}
					});
					buttonAccept.addEventListener(`click`, (event) => {
						resolve(true);
						dialog.remove();
					});
					buttonDecline.addEventListener(`click`, (event) => {
						resolve(false);
						dialog.remove();
					});
				})));
			}
		}
	}
	/**
	 * @param {String} message 
	 * @param {MessageType} type 
	 */
	static async prompt(message, type = MessageType.log) {
		const dialog = this.#popup(type);
		{
			const divMain = (/** @type {HTMLDivElement} */ (dialog.querySelector(`div.main`)));
			{
				divMain.innerText = message;
			}
			const divFooter = (/** @type {HTMLDivElement} */ (dialog.querySelector(`div.footer`)));
			{
				const inputPrompt = divFooter.appendChild(document.createElement(`input`));
				inputPrompt.type = `text`;
				inputPrompt.placeholder = `Enter text`;
				inputPrompt.classList.add(`depth`);
				{ }
				const buttonContinue = divFooter.appendChild(document.createElement(`button`));
				buttonContinue.innerText = `Continue`;
				buttonContinue.classList.add(`layer`, `transparent`, `highlight`);
				{ }
				return (/** @type {Promise<String?>} */ (new Promise((resolve) => {
					dialog.addEventListener(`click`, (event) => {
						if (event.target == dialog) {
							resolve(null);
							dialog.remove();
						}
					});
					buttonContinue.addEventListener(`click`, (event) => {
						resolve(inputPrompt.value);
						dialog.remove();
					});
				})));
			}
		}
	}
	/**
	 * @param {any} exception 
	 */
	static async prevent(exception) {
		if (this.#locked) {
			await Application.alert(exception instanceof Error ? exception.stack ?? `${exception.name}: ${exception.message}` : `Invalid exception type.`, MessageType.error);
			location.reload();
		} else console.error(exception);
	}
}
