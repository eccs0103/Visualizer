"use strict";
//#region Random
class Random {
	/**
	 * @param {Number} min 
	 * @param {Number} max 
	 */
	static number(min, max) {
		return Math.random() * (max - min) + min;
	}
	/**
	 * @template Item 
	 * @param {Array<Item>} array 
	 */
	static element(array) {
		return array[Math.floor(Random.number(0, array.length))];
	}
	/**
	 * @template Item 
	 * @param {Map<Item, Number>} cases 
	 * @returns 
	 */
	static case(cases) {
		const summary = Array.from(cases).reduce((previous, [item, percentage]) => previous + percentage, 0);
		const random = Random.number(0, summary);
		let selection = undefined;
		let start = 0;
		for (const [item, percentage] of cases) {
			const end = start + percentage;
			if (start <= random && random < end) {
				selection = item;
				break;
			}
			start = end;
		}
		if (selection === undefined) {
			throw new ReferenceError(`Can't select value. Maybe stack is empty.`);
		}
		return selection;
	}
}
//#endregion
//#region Archive
/**
 * @template Notation 
 */
class Archive {
	/**
	 * @param {String} path 
	 * @param {Notation | undefined} initial 
	 */
	constructor(path, initial = undefined) {
		this.#path = path;
		if (localStorage.getItem(path) === null && initial !== undefined) {
			localStorage.setItem(path, JSON.stringify(initial, undefined, `\t`));
		}
	}
	/** @type {String} */ #path;
	get data() {
		const item = localStorage.getItem(this.#path);
		if (item === null) {
			throw new ReferenceError(`Key '${this.#path}' isn't defined.`);
		}
		return (/** @type {Notation} */ (JSON.parse(item)));
	}
	set data(value) {
		localStorage.setItem(this.#path, JSON.stringify(value, undefined, `\t`));
	}
	/**
	 * @param {(value: Notation) => Notation} action 
	 */
	change(action) {
		this.data = action(this.data);
	}
}
//#endregion
//#region Color
class Color {
	/**
	 * @param {Number} hue 
	 * @param {Number} saturation 
	 * @param {Number} value 
	 */
	static viaHSV(hue, saturation, value) {
		/**
		 * @param {Number} n 
		 * @param {Number} k 
		 * @returns 
		 */
		function f(n, k = (n + hue / 60) % 6) {
			return (value / 100) - (value / 100) * (saturation / 100) * Math.max(0, Math.min(k, 4 - k, 1));
		};
		return new Color(f(5) * 255, f(3) * 255, f(1) * 255);
	}
	/** @readonly */ static get white() {
		return new Color(255, 255, 255);
	}
	/** @readonly */ static get black() {
		return new Color(0, 0, 0);
	}
	/**
	 * @param {Number} red 
	 * @param {Number} green 
	 * @param {Number} blue 
	 * @param {Number} transparence 
	 */
	constructor(red, green, blue, transparence = 1) {
		this.#red = red;
		this.#green = green;
		this.#blue = blue;
		this.#transparence = transparence;
	}
	/** @type {Number} */ #red;
	/** @readonly */ get red() {
		return this.#red;
	}
	/** @type {Number} */ #green;
	/** @readonly */ get green() {
		return this.#green;
	}
	/** @type {Number} */ #blue;
	/** @readonly */ get blue() {
		return this.#blue;
	}
	/** @type {Number} */ #transparence;
	/** @readonly */ get transparence() {
		return this.#transparence;
	}
	toString() {
		return `rgba(${this.#red}, ${this.#green}, ${this.#blue}, ${this.#transparence})`;
	}
}
//#endregion
//#region Application
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
	/** @type {String} */ static #project = `Visualizer`;
	/** @readonly */ static get project() {
		return this.#project;
	}
	static #locked = true;
	/** @readonly */ static get search() {
		return new Map(window.decodeURI(location.search.replace(/^\??/, ``)).split(`&`).filter(item => item).map((item) => {
			const [key, value] = item.split(`=`);
			return [key, value];
		}));;
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
			await Application.alert(exception instanceof Error ? exception.stack ?? `${exception.name}: ${exception.message}` : `Invalid exception type.`);
			location.reload();
		} else console.error(exception);
	}
}
//#endregion