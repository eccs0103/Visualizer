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
/** @enum {String} */ const ColorFormat = {
	/** @readonly */ RGB: `RGB`,
	/** @readonly */ HSL: `HSL`,
	/** @readonly */ HEX: `HEX`,
};
class Color {
	//#region Converters
	/**
	 * @param {Number} hue [0 - 360]
	 * @param {Number} saturation [0 - 100]
	 * @param {Number} lightness [0 - 100]
	 * @returns {[Number, Number, Number]} red [0 - 255], green [0 - 255], blue [0 - 255]
	 */
	static #HSLtoRGB(hue, saturation, lightness) {
		hue = hue / 30;
		saturation = saturation / 100;
		lightness = lightness / 100;
		function transform(/** @type {Number} */ level) {
			const sector = (level + hue) % 12;
			return lightness - (saturation * Math.min(lightness, 1 - lightness)) * Math.max(-1, Math.min(sector - 3, 9 - sector, 1));
		}
		return [Math.floor(transform(0) * 255), Math.floor(transform(8) * 255), Math.floor(transform(4) * 255)];
	}
	/**
	 * @param {Number} red [0 - 255]
	 * @param {Number} green [0 - 255]
	 * @param {Number} blue [0 - 255]
	 * @returns {[Number, Number, Number]} hue [0 - 360], saturation [0 - 100], lightness [0 - 100]
	 */
	static #RGBtoHSL(red, green, blue) {
		red = red / 255;
		green = green / 255;
		blue = blue / 255;
		const value = Math.max(red, green, blue), level = value - Math.min(red, green, blue), f = (1 - Math.abs(value + value - level - 1));
		const hue = level && ((value == red) ? (green - blue) / level : ((value == green) ? 2 + (blue - red) / level : 4 + (red - green) / level));
		return [Math.floor(60 * (hue < 0 ? hue + 6 : hue)), Math.floor((f ? level / f : 0) * 100), Math.floor(((value + value - level) / 2) * 100)];
	}
	/**
	 * @param {Color} source 
	 * @param {ColorFormat} format 
	 * @param {Boolean} deep 
	 */
	static stringify(source, format, deep = false) {
		switch (format) {
			case ColorFormat.RGB: return `rgb${deep ? `a` : ``}(${source.#red}, ${source.#green}, ${source.#blue}${deep ? `, ${source.#alpha}` : ``})`;
			case ColorFormat.HSL: return `hsl${deep ? `a` : ``}(${source.#hue}, ${source.#saturation}, ${source.#lightness}${deep ? `, ${source.#alpha}` : ``})`;
			case ColorFormat.HEX: return `#${source.#red.toString(16).replace(/^(?!.{2})/, `0`)}${source.#green.toString(16).replace(/^(?!.{2})/, `0`)}${source.#blue.toString(16).replace(/^(?!.{2})/, `0`)}${deep ? (source.#alpha * 255).toString(16).replace(/^(?!.{2})/, `0`) : ``}`;
			default: throw new TypeError(`Invalid color format: '${format}'.`);
		}
	}
	/**
	 * @param {String} source 
	 * @param {ColorFormat} format 
	 * @param {Boolean} deep 
	 */
	static parse(source, format, deep = false) {
		switch (format) {
			case ColorFormat.RGB: {
				const regex = new RegExp(`rgb\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*${deep ? `,\\s*(\\d+)\\s*` : ``}\\)`, `i`);
				const matches = regex.exec(source);
				if (!matches) {
					throw new SyntaxError(`Invalid ${format} format color syntax: '${source}'.`);
				}
				const [, red, green, blue, alpha] = matches.map((item) => Number.parseInt(item));
				return Color.viaRGB(red, green, blue, deep ? alpha : 1);
			};
			case ColorFormat.HSL: {
				const regex = new RegExp(`hsl\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*${deep ? `,\\s*(\\d+)\\s*` : ``}\\)`, `i`);
				const matches = regex.exec(source);
				if (!matches) {
					throw new SyntaxError(`Invalid ${format} format color syntax: '${source}'.`);
				}
				const [, hue, saturation, lightness, alpha] = matches.map((item) => Number.parseInt(item));
				return Color.viaHSL(hue, saturation, lightness, deep ? alpha : 1);
			};
			case ColorFormat.HEX: {
				const regex = new RegExp(`#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})${deep ? `([0-9a-f]{2})` : ``}`, `i`);
				const matches = regex.exec(source);
				if (!matches) {
					throw new SyntaxError(`Invalid ${format} format color syntax: '${source}'.`);
				}
				const [, red, green, blue, alpha] = matches.map((item) => Number.parseInt(item, 16));
				return Color.viaRGB(red, green, blue, deep ? alpha : 1);
			};
			default: throw new TypeError(`Invalid color format: '${format}'.`);
		}
	}
	//#endregion
	//#region Constructors
	/**
	 * @param {Number} red [0 - 255]
	 * @param {Number} green [0 - 255]
	 * @param {Number} blue [0 - 255]
	 * @param {Number} alpha [0 - 1]
	 */
	static viaRGB(red, green, blue, alpha = 1) {
		const result = new Color();
		if (red < 0 || red > 255) {
			throw new RangeError(`Property 'red' out of range: ${red}`);
		}
		if (green < 0 || green > 255) {
			throw new RangeError(`Property 'green' out of range: ${green}`);
		}
		if (blue < 0 || blue > 255) {
			throw new RangeError(`Property 'blue' out of range: ${blue}`);
		}
		if (alpha < 0 || alpha > 1) {
			throw new RangeError(`Property 'alpha' out of range: ${alpha}`);
		}
		result.#green = Math.floor(green);
		result.#red = Math.floor(red);
		result.#blue = Math.floor(blue);
		[result.#hue, result.#saturation, result.#lightness] = Color.#RGBtoHSL(result.#red, result.#green, result.#blue);
		result.#alpha = alpha;
		return result;
	}
	/**
	 * @param {Number} hue [0 - 360]
	 * @param {Number} saturation [0 - 100]
	 * @param {Number} lightness [0 - 100]
	 * @param {Number} alpha [0 - 1]
	 */
	static viaHSL(hue, saturation, lightness, alpha = 1) {
		const result = new Color();
		if (hue < 0 || hue > 360) {
			throw new RangeError(`Property 'hue' out of range: ${hue}`);
		}
		if (saturation < 0 || saturation > 100) {
			throw new RangeError(`Property 'saturation' out of range: ${saturation}`);
		}
		if (lightness < 0 || lightness > 100) {
			throw new RangeError(`Property 'lightness' out of range: ${lightness}`);
		}
		if (alpha < 0 || alpha > 1) {
			throw new RangeError(`Property 'alpha' out of range: ${alpha}`);
		}
		result.#hue = Math.floor(hue);
		result.#saturation = Math.floor(saturation);
		result.#lightness = Math.floor(lightness);
		[result.#red, result.#green, result.#blue] = Color.#HSLtoRGB(result.#hue, result.#saturation, result.#lightness);
		result.#alpha = alpha;
		return result;
	}
	//#endregion
	//#region Properties
	/** @type {Number} */ #red = 0;
	get red() {
		return this.#red;
	}
	set red(value) {
		if (value < 0 || value > 255) {
			throw new RangeError(`Property 'red' out of range: ${value}`);
		}
		this.#red = Math.floor(value);
		[this.#hue, this.#saturation, this.#lightness] = Color.#RGBtoHSL(this.#red, this.#green, this.#blue);
	}
	/** @type {Number} */ #green = 0;
	get green() {
		return this.#green;
	}
	set green(value) {
		if (value < 0 || value > 255) {
			throw new RangeError(`Property 'green' out of range: ${value}`);
		}
		this.#green = Math.floor(value);
		[this.#hue, this.#saturation, this.#lightness] = Color.#RGBtoHSL(this.#red, this.#green, this.#blue);
	}
	/** @type {Number} */ #blue = 0;
	get blue() {
		return this.#blue;
	}
	set blue(value) {
		if (value < 0 || value > 255) {
			throw new RangeError(`Property 'blue' out of range: ${value}`);
		}
		this.#blue = Math.floor(value);
		[this.#hue, this.#saturation, this.#lightness] = Color.#RGBtoHSL(this.#red, this.#green, this.#blue);
	}
	/** @type {Number} */ #hue = 0;
	get hue() {
		return this.#hue;
	}
	set hue(value) {
		if (value < 0 || value > 360) {
			throw new RangeError(`Property 'hue' out of range: ${value}`);
		}
		this.#hue = Math.floor(value);
		[this.#red, this.#green, this.#blue] = Color.#HSLtoRGB(this.#hue, this.#saturation, this.#lightness);
	}
	/** @type {Number} */ #saturation = 0;
	get saturation() {
		return this.#saturation;
	}
	set saturation(value) {
		if (value < 0 || value > 100) {
			throw new RangeError(`Property 'saturation' out of range: ${value}`);
		}
		this.#saturation = Math.floor(value);
		[this.#red, this.#green, this.#blue] = Color.#HSLtoRGB(this.#hue, this.#saturation, this.#lightness);
	}
	/** @type {Number} */ #lightness = 0;
	get lightness() {
		return this.#lightness;
	}
	set lightness(value) {
		if (value < 0 || value > 100) {
			throw new RangeError(`Property 'lightness' out of range: ${value}`);
		}
		this.#lightness = Math.floor(value);
		[this.#red, this.#green, this.#blue] = Color.#HSLtoRGB(this.#hue, this.#saturation, this.#lightness);
	}
	/** @type {Number} */ #alpha = 1;
	get alpha() {
		return this.#alpha;
	}
	set alpha(value) {
		if (value < 0 || value > 1) {
			throw new RangeError(`Property 'alpha' out of range: ${value}`);
		}
		this.#alpha = value;
	}
	//#endregion
	//#region Modifiers
	/**
	 * @param {ColorFormat} format 
	 * @param {Boolean} deep
	 */
	toString(format, deep = false) {
		return Color.stringify(this, format, deep);
	}
	//#endregion
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
//#endregion
//#region Engine
class Engine {
	/**
	 * @param {() => void} handler 
	 */
	constructor(handler) {
		const instance = this;
		let previous = 0;
		requestAnimationFrame(function callback(time) {
			let current = time;
			const difference = current - previous;
			if (instance.#launched) {
				instance.#time += difference;
				handler();
			}
			previous = current;
			requestAnimationFrame(callback);
		});
	}
	/** @type {DOMHighResTimeStamp} */ #time = 0;
	/** @readonly */ get time() {
		return this.#time;
	}
	/** @type {Boolean} */ #launched = false;
	get launched() {
		return this.#launched;
	}
	set launched(value) {
		this.#launched = value;
	}
}
//#endregion