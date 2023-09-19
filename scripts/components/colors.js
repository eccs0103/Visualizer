"use strict";

/** @enum {String} */ const ColorFormats = {
	/** @readonly */ RGB: `RGB`,
	/** @readonly */ HSL: `HSL`,
	/** @readonly */ HEX: `HEX`,
};
Object.freeze(ColorFormats);

class Color {
	//#region Converters
	/**
	 * @param {Number} hue [0 - 360]
	 * @param {Number} saturation [0 - 100]
	 * @param {Number} lightness [0 - 100]
	 * @returns {[Number, Number, Number]} red [0 - 255], green [0 - 255], blue [0 - 255]
	 */
	static #HSLtoRGB(hue, saturation, lightness) {
		hue /= 30;
		saturation /= 100;
		lightness /= 100;
		function transform(/** @type {Number} */ level) {
			const sector = (level + hue) % 12;
			return lightness - (saturation * Math.min(lightness, 1 - lightness)) * Math.max(-1, Math.min(sector - 3, 9 - sector, 1));
		}
		return [
			Math.trunc(transform(0) * 255),
			Math.trunc(transform(8) * 255),
			Math.trunc(transform(4) * 255)
		];
	}
	/**
	 * @param {Number} red [0 - 255]
	 * @param {Number} green [0 - 255]
	 * @param {Number} blue [0 - 255]
	 * @returns {[Number, Number, Number]} hue [0 - 360], saturation [0 - 100], lightness [0 - 100]
	 */
	static #RGBtoHSL(red, green, blue) {
		red /= 255;
		green /= 255;
		blue /= 255;
		const value = Math.max(red, green, blue), level = value - Math.min(red, green, blue), f = (1 - Math.abs(value + value - level - 1));
		const hue = level && ((value === red) ? (green - blue) / level : ((value === green) ? 2 + (blue - red) / level : 4 + (red - green) / level));
		return [
			Math.trunc((hue < 0 ? hue + 6 : hue) * 60),
			Math.trunc((f ? level / f : 0) * 100),
			Math.trunc(((value + value - level) / 2) * 100)
		];
	}
	/**
	 * @param {Color} source 
	 * @param {ColorFormats} format 
	 * @param {Boolean} deep 
	 */
	static stringify(source, format = ColorFormats.RGB, deep = false) {
		switch (format) {
			case ColorFormats.RGB: return `rgb${deep ? `a` : ``}(${source.#red}, ${source.#green}, ${source.#blue}${deep ? `, ${source.#alpha}` : ``})`;
			case ColorFormats.HSL: return `hsl${deep ? `a` : ``}(${source.#hue}deg, ${source.#saturation}%, ${source.#lightness}%${deep ? `, ${source.#alpha}` : ``})`;
			case ColorFormats.HEX: return `#${source.#red.toString(16).replace(/^(?!.{2})/, `0`)}${source.#green.toString(16).replace(/^(?!.{2})/, `0`)}${source.#blue.toString(16).replace(/^(?!.{2})/, `0`)}${deep ? (source.#alpha * 255).toString(16).replace(/^(?!.{2})/, `0`) : ``}`;
			default: throw new TypeError(`Invalid color format: '${format}'.`);
		}
	}
	/**
	 * @param {String} source 
	 * @param {ColorFormats} format 
	 * @param {Boolean} deep 
	 */
	static parse(source, format = ColorFormats.RGB, deep = false) {
		switch (format) {
			case ColorFormats.RGB: {
				const regex = new RegExp(`rgb${deep ? `a` : ``}\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*${deep ? `,\\s*(0(\\.\\d+)?|1(\\.0+)?)\\s*` : ``}\\)`, `i`);
				const matches = regex.exec(source);
				if (!matches) {
					throw new SyntaxError(`Invalid ${format} format color syntax: '${source}'.`);
				}
				const [, red, green, blue, alpha] = matches.map((item) => Number.parseInt(item));
				return Color.viaRGB(red, green, blue, deep ? alpha : 1);
			};
			case ColorFormats.HSL: {
				const regex = new RegExp(`hsl${deep ? `a` : ``}\\(\\s*(\\d+)(?:deg)?\\s*,\\s*(\\d+)(?:%)?\\s*,\\s*(\\d+)(?:%)?\\s*${deep ? `,\\s*(0(\\.\\d+)?|1(\\.0+)?)\\s*` : ``}\\)`, `i`);
				const matches = regex.exec(source);
				if (!matches) {
					throw new SyntaxError(`Invalid ${format} format color syntax: '${source}'.`);
				}
				const [, hue, saturation, lightness, alpha] = matches.map((item) => Number.parseInt(item));
				return Color.viaHSL(hue, saturation, lightness, deep ? alpha : 1);
			};
			case ColorFormats.HEX: {
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
	/**
	 * @param {String} source 
	 */
	static tryParse(source) {
		let result = null;
		for (const [format, deep] of Object.values(ColorFormats).flatMap((format) => (/** @type {Array<[String, Boolean]>} */ ([[format, false], [format, true]])))) {
			try {
				result = Color.parse(source, format, deep);
				break;
			} catch {
				continue;
			}
		}
		return result;
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
		if (red < 0 || red > 255) throw new RangeError(`Property 'red' out of range: ${red}`);
		if (green < 0 || green > 255) throw new RangeError(`Property 'green' out of range: ${green}`);
		if (blue < 0 || blue > 255) throw new RangeError(`Property 'blue' out of range: ${blue}`);
		if (alpha < 0 || alpha > 1) throw new RangeError(`Property 'alpha' out of range: ${alpha}`);
		const result = new Color();
		result.#green = Math.trunc(green);
		result.#red = Math.trunc(red);
		result.#blue = Math.trunc(blue);
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
		if (hue < 0 || hue > 360) throw new RangeError(`Property 'hue' out of range: ${hue}`);
		if (saturation < 0 || saturation > 100) throw new RangeError(`Property 'saturation' out of range: ${saturation}`);
		if (lightness < 0 || lightness > 100) throw new RangeError(`Property 'lightness' out of range: ${lightness}`);
		if (alpha < 0 || alpha > 1) throw new RangeError(`Property 'alpha' out of range: ${alpha}`);
		const result = new Color();
		result.#hue = Math.trunc(hue);
		result.#saturation = Math.trunc(saturation);
		result.#lightness = Math.trunc(lightness);
		[result.#red, result.#green, result.#blue] = Color.#HSLtoRGB(result.#hue, result.#saturation, result.#lightness);
		result.#alpha = alpha;
		return result;
	}
	/**
	 * @param {Color} source
	 */
	static clone(source) {
		const result = new Color();
		result.#red = source.#red;
		result.#green = source.#green;
		result.#blue = source.#blue;
		result.#hue = source.#hue;
		result.#saturation = source.#saturation;
		result.#lightness = source.#lightness;
		result.#alpha = source.#alpha;
		return result;
	}
	//#endregion
	//#region Presets
	/** @readonly */ static get TRANSPARENT() { return Color.viaRGB(0, 0, 0, 0); };
	/** @readonly */ static get MAROON() { return Color.viaRGB(128, 0, 0); };
	/** @readonly */ static get RED() { return Color.viaRGB(255, 0, 0); };
	/** @readonly */ static get ORANGE() { return Color.viaRGB(255, 165, 0); };
	/** @readonly */ static get YELLOW() { return Color.viaRGB(255, 255, 0); };
	/** @readonly */ static get OLIVE() { return Color.viaRGB(128, 128, 0); };
	/** @readonly */ static get GREEN() { return Color.viaRGB(0, 128, 0); };
	/** @readonly */ static get PURPLE() { return Color.viaRGB(128, 0, 128); };
	/** @readonly */ static get FUCHSIA() { return Color.viaRGB(255, 0, 255); };
	/** @readonly */ static get LIME() { return Color.viaRGB(0, 255, 0); };
	/** @readonly */ static get TEAL() { return Color.viaRGB(0, 128, 128); };
	/** @readonly */ static get AQUA() { return Color.viaRGB(0, 255, 255); };
	/** @readonly */ static get BLUE() { return Color.viaRGB(0, 0, 255); };
	/** @readonly */ static get NAVY() { return Color.viaRGB(0, 0, 128); };
	/** @readonly */ static get BLACK() { return Color.viaRGB(0, 0, 0); };
	/** @readonly */ static get GRAY() { return Color.viaRGB(128, 128, 128); };
	/** @readonly */ static get SILVER() { return Color.viaRGB(192, 192, 192); };
	/** @readonly */ static get WHITE() { return Color.viaRGB(255, 255, 255); };
	//#endregion
	//#region Modifiers
	/**
	 * @param {Color} first 
	 * @param {Color} second 
	 * @param {Number} ratio [0 - 1]
	 */
	static mix(first, second, ratio = 0.5) {
		if (ratio < 0 || ratio > 1) throw new RangeError(`Property 'ratio' out of range: ${ratio}`);
		return Color.viaRGB(
			first.#red + (second.#red - first.#red) * ratio,
			first.#green + (second.#green - first.#green) * ratio,
			first.#blue + (second.#blue - first.#blue) * ratio
		);
	}
	/**
	 * @param {Color} source 
	 * @param {Number} scale [0 - 1]
	 */
	static grayscale(source, scale = 1) {
		if (scale < 0 || scale > 1) throw new RangeError(`Property 'scale' out of range: ${scale}`);
		const grayness = (source.#red + source.#green + source.#blue) / 3;
		return Color.viaRGB(
			source.#red + (grayness - source.#red) * scale,
			source.#green + (grayness - source.#green) * scale,
			source.#blue + (grayness - source.#blue) * scale
		);
	}
	/**
	 * @param {Color} source 
	 * @param {Number} scale [0 - 1]
	 */
	static invert(source, scale = 1) {
		if (scale < 0 || scale > 1) throw new RangeError(`Property 'scale' out of range: ${scale}`);
		const [red, green, blue] = [255 - source.#red, 255 - source.#green, 255 - source.#blue];
		return Color.viaRGB(
			source.#red + (red - source.#red) * scale,
			source.#green + (green - source.#green) * scale,
			source.#blue + (blue - source.#blue) * scale
		);
	}
	/**
	 * @param {Color} source 
	 * @param {Number} scale [0 - 1]
	 */
	static sepia(source, scale = 1) {
		if (scale < 0 || scale > 1) throw new RangeError(`Property 'scale' out of range: ${scale}`);
		const [red, green, blue] = [
			Math.max(0, Math.min(((source.#red * 0.393) + (source.#green * 0.769) + (source.#blue * 0.189)), 255)),
			Math.max(0, Math.min(((source.#red * 0.349) + (source.#green * 0.686) + (source.#blue * 0.168)), 255)),
			Math.max(0, Math.min(((source.#red * 0.272) + (source.#green * 0.534) + (source.#blue * 0.131)), 255)),
		];
		return Color.viaRGB(
			source.#red + (red - source.#red) * scale,
			source.#green + (green - source.#green) * scale,
			source.#blue + (blue - source.#blue) * scale
		);
	}
	/**
	 * @param {Color} source 
	 * @param {Number} angle 
	 */
	static rotate(source, angle) {
		const clone = source.clone();
		const temp = Math.trunc(clone.#hue + angle) % 361;
		clone.hue = (temp < 0) ? temp + 360 : temp;
		return clone;
	}
	/**
	 * @param {Color} source 
	 * @param {Number} scale [0 - 1]
	 */
	static saturate(source, scale) {
		if (scale < 0 || scale > 1) throw new RangeError(`Property 'scale' out of range: ${scale}`);
		const clone = source.clone();
		clone.saturation = 100 * scale;
		return clone;
	}
	/**
	 * @param {Color} source 
	 * @param {Number} scale [0 - 1]
	 */
	static illuminate(source, scale) {
		if (scale < 0 || scale > 1) throw new RangeError(`Property 'scale' out of range: ${scale}`);
		const clone = source.clone();
		clone.lightness = 100 * scale;
		return clone;
	}
	/**
	 * @param {Color} source 
	 * @param {Number} scale [0 - 1]
	 */
	static pass(source, scale) {
		if (scale < 0 || scale > 1) throw new RangeError(`Property 'scale' out of range: ${scale}`);
		const clone = source.clone();
		clone.alpha = scale;
		return clone;
	}
	//#endregion
	//#region Properties
	/** @type {Number} */ #red = 0;
	get red() {
		return this.#red;
	}
	set red(value) {
		if (value < 0 || value > 255) throw new RangeError(`Property 'red' out of range: ${value}`);
		this.#red = Math.trunc(value);
		[this.#hue, this.#saturation, this.#lightness] = Color.#RGBtoHSL(this.#red, this.#green, this.#blue);
	}
	/** @type {Number} */ #green = 0;
	get green() {
		return this.#green;
	}
	set green(value) {
		if (value < 0 || value > 255) throw new RangeError(`Property 'green' out of range: ${value}`);
		this.#green = Math.trunc(value);
		[this.#hue, this.#saturation, this.#lightness] = Color.#RGBtoHSL(this.#red, this.#green, this.#blue);
	}
	/** @type {Number} */ #blue = 0;
	get blue() {
		return this.#blue;
	}
	set blue(value) {
		if (value < 0 || value > 255) throw new RangeError(`Property 'blue' out of range: ${value}`);
		this.#blue = Math.trunc(value);
		[this.#hue, this.#saturation, this.#lightness] = Color.#RGBtoHSL(this.#red, this.#green, this.#blue);
	}
	/** @type {Number} */ #hue = 0;
	get hue() {
		return this.#hue;
	}
	set hue(value) {
		if (value < 0 || value > 360) throw new RangeError(`Property 'hue' out of range: ${value}`);
		this.#hue = Math.trunc(value);
		[this.#red, this.#green, this.#blue] = Color.#HSLtoRGB(this.#hue, this.#saturation, this.#lightness);
	}
	/** @type {Number} */ #saturation = 0;
	get saturation() {
		return this.#saturation;
	}
	set saturation(value) {
		if (value < 0 || value > 100) throw new RangeError(`Property 'saturation' out of range: ${value}`);
		this.#saturation = Math.trunc(value);
		[this.#red, this.#green, this.#blue] = Color.#HSLtoRGB(this.#hue, this.#saturation, this.#lightness);
	}
	/** @type {Number} */ #lightness = 0;
	get lightness() {
		return this.#lightness;
	}
	set lightness(value) {
		if (value < 0 || value > 100) throw new RangeError(`Property 'lightness' out of range: ${value}`);
		this.#lightness = Math.trunc(value);
		[this.#red, this.#green, this.#blue] = Color.#HSLtoRGB(this.#hue, this.#saturation, this.#lightness);
	}
	/** @type {Number} */ #alpha = 1;
	get alpha() {
		return this.#alpha;
	}
	set alpha(value) {
		if (value < 0 || value > 1) throw new RangeError(`Property 'alpha' out of range: ${value}`);
		this.#alpha = value;
	}
	//#endregion
	//#region Methods
	/**
	 * @param {ColorFormats} format 
	 * @param {Boolean} deep
	 */
	toString(format = ColorFormats.RGB, deep = false) {
		return Color.stringify(this, format, deep);
	}
	/**
	 * 
	 */
	clone() {
		return Color.clone(this);
	}
	/**
	 * @param {Color} other 
	 * @param {Number} ratio [0 - 1]
	 */
	mix(other, ratio = 0.5) {
		return Color.mix(this, other, ratio);
	}
	/**
	 * @param {Number} scale [0 - 1]
	 */
	grayscale(scale = 1) {
		return Color.grayscale(this, scale);
	}
	/**
	 * @param {Number} scale [0 - 1]
	 */
	invert(scale = 1) {
		return Color.invert(this, scale);
	}
	/**
	 * @param {Number} scale [0 - 1]
	 */
	sepia(scale = 1) {
		return Color.sepia(this, scale);
	}
	/**
	 * @param {Number} angle 
	 */
	rotate(angle) {
		return Color.rotate(this, angle);
	}
	/**
	 * @param {Number} scale [0 - 1]
	 */
	saturate(scale) {
		return Color.saturate(this, scale);
	}
	/**
	 * @param {Number} scale [0 - 1]
	 */
	illuminate(scale) {
		return Color.illuminate(this, scale);
	}
	/**
	 * @param {Number} scale [0 - 1]
	 */
	pass(scale) {
		return Color.pass(this, scale);
	}
	//#endregion
}
