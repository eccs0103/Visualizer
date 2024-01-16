"use strict";

import { Point2D } from "./Measures.js";
import { Color } from "./Colors.js";

//#region Texture
class Texture {
	//#region Converters
	/**
	 * @param {Texture} texture 
	 */
	static toImageData(texture) {
		const imageData = new ImageData(texture.size.x, texture.size.y);
		const data = imageData.data;
		for (let index = 0; index < texture.size.x * texture.size.y; index++) {
			const position = new Point2D(index % texture.size.x, index / texture.size.x);
			const color = texture.getCell(position);
			data[index * 4 + 0] = color.red;
			data[index * 4 + 1] = color.green;
			data[index * 4 + 2] = color.blue;
			data[index * 4 + 3] = color.alpha;
		}
		return imageData;
	}
	/**
	 * @param {ImageData} imageData 
	 */
	static fromImageData(imageData) {
		const texture = new Texture(new Point2D(imageData.width, imageData.height));
		const data = imageData.data;
		for (let index = 0; index < texture.size.x * texture.size.y; index++) {
			const position = new Point2D(index % texture.size.x, index / texture.size.x);
			const color = Color.viaRGB(
				data[index * 4 + 0],
				data[index * 4 + 1],
				data[index * 4 + 2],
				data[index * 4 + 3],
			);
			texture.setCell(position, color);
		}
		return texture;
	}
	//#endregion
	//#region Contructors
	/**
	 * @param {Texture} texture 
	 */
	static clone(texture) {
		const result = new Texture(texture.size);
		for (let index = 0; index < texture.size.x * texture.size.y; index++) {
			const position = new Point2D(index % texture.size.x, index / texture.size.x);
			result.setCell(position, texture.getCell(position).clone());
		}
		return texture;
	}
	/**
	 * @param {Point2D} size 
	 */
	constructor(size) {
		this.#size = size;
		/** @type {Color[][]} */ const data = (this.#data = new Array(this.#size.y));
		for (let y = 0; y < data.length; y++) {
			/** @type {Color[]} */ const row = (data[y] = new Array(this.#size.x));
			for (let x = 0; x < row.length; x++) {
				/** @type {Color} */ (row[x] = Color.TRANSPARENT);
			}
		}
	}
	//#endregion
	//#region Modifiers
	/**
	 * @param {Texture} first 
	 * @param {Texture} second 
	 * @param {number} ratio [0 - 1]
	 */
	static mix(first, second, ratio = 0.5) {
		if (ratio < 0 || ratio > 1) throw new RangeError(`Ratio ${ratio} out of range [0 - 1]`);
		const result = first.clone();
		for (let index = 0; index < result.size.x * result.size.y; index++) {
			const position = new Point2D(index % result.size.x, index / result.size.x);
			result.setCell(position, first.getCell(position).mix(second.getCell(position), ratio));
		}
		return result;
	}
	/**
	 * @param {Texture} source 
	 * @param {number} scale [0 - 1]
	 */
	static grayscale(source, scale = 1) {
		if (scale < 0 || scale > 1) throw new RangeError(`Scale ${scale} out of range [0 - 1]`);
		const result = source.clone();
		for (let index = 0; index < result.size.x * result.size.y; index++) {
			const position = new Point2D(index % result.size.x, index / result.size.x);
			result.setCell(position, source.getCell(position).grayscale(scale));
		}
		return result;
	}
	/**
	 * @param {Texture} source 
	 * @param {number} scale [0 - 1]
	 */
	static invert(source, scale = 1) {
		if (scale < 0 || scale > 1) throw new RangeError(`Scale ${scale} out of range [0 - 1]`);
		const result = source.clone();
		for (let index = 0; index < result.size.x * result.size.y; index++) {
			const position = new Point2D(index % result.size.x, index / result.size.x);
			result.setCell(position, source.getCell(position).invert(scale));
		}
		return result;
	}
	/**
	 * @param {Texture} source 
	 * @param {number} scale [0 - 1]
	 */
	static sepia(source, scale = 1) {
		if (scale < 0 || scale > 1) throw new RangeError(`Scale ${scale} out of range [0 - 1]`);
		const result = source.clone();
		for (let index = 0; index < result.size.x * result.size.y; index++) {
			const position = new Point2D(index % result.size.x, index / result.size.x);
			result.setCell(position, source.getCell(position).sepia(scale));
		}
		return result;
	}
	/**
	 * @param {Texture} source 
	 * @param {number} angle (-∞ - ∞)
	 */
	static rotate(source, angle) {
		const result = source.clone();
		for (let index = 0; index < result.size.x * result.size.y; index++) {
			const position = new Point2D(index % result.size.x, index / result.size.x);
			result.setCell(position, source.getCell(position).rotate(angle));
		}
		return result;
	}
	/**
	 * @param {Texture} source 
	 * @param {number} scale [0 - 1]
	 */
	static saturate(source, scale) {
		if (scale < 0 || scale > 1) throw new RangeError(`Scale ${scale} out of range [0 - 1]`);
		const result = source.clone();
		for (let index = 0; index < result.size.x * result.size.y; index++) {
			const position = new Point2D(index % result.size.x, index / result.size.x);
			result.setCell(position, source.getCell(position).saturate(scale));
		}
		return result;
	}
	/**
	 * @param {Texture} source 
	 * @param {number} scale [0 - 1]
	 */
	static illuminate(source, scale) {
		if (scale < 0 || scale > 1) throw new RangeError(`Scale ${scale} out of range [0 - 1]`);
		const result = source.clone();
		for (let index = 0; index < result.size.x * result.size.y; index++) {
			const position = new Point2D(index % result.size.x, index / result.size.x);
			result.setCell(position, source.getCell(position).illuminate(scale));
		}
		return result;
	}
	/**
	 * @param {Texture} source 
	 * @param {number} scale [0 - 1]
	 */
	static pass(source, scale) {
		if (scale < 0 || scale > 1) throw new RangeError(`Scale ${scale} out of range [0 - 1]`);
		const result = source.clone();
		for (let index = 0; index < result.size.x * result.size.y; index++) {
			const position = new Point2D(index % result.size.x, index / result.size.x);
			result.setCell(position, source.getCell(position).pass(scale));
		}
		return result;
	}
	//#endregion
	//#region Properties
	/** @type {Point2D} */ #size;
	/** @readonly */ get size() {
		return this.#size;
	}
	/** @type {Color[][]} */ #data;
	//#endregion
	//#region Methods
	/**
	 * @param {Point2D} position 
	 */
	getCell(position) {
		if (0 <= position.x && position.x < this.size.x && 0 <= position.y && position.y < this.size.y) {
			return this.#data[position.y][position.x];
		} else throw new RangeError(`Position ${position} out of range [${Point2D.CONSTANT_ZERO} - ${this.size})`);
	}
	/**
	 * @param {Point2D} position 
	 * @param {Color} value 
	 */
	setCell(position, value) {
		if (0 <= position.x && position.x < this.size.x && 0 <= position.y && position.y < this.size.y) {
			this.#data[position.y][position.x] = value;
		} else throw new RangeError(`Position ${position} out of range [${Point2D.CONSTANT_ZERO} - ${this.size})`);
	}
	clone() {
		return Texture.clone(this);
	}
	/**
	 * @param {Texture} other 
	 * @param {number} ratio [0 - 1]
	 */
	mix(other, ratio = 0.5) {
		return Texture.mix(this, other, ratio);
	}
	/**
	 * @param {number} scale [0 - 1]
	 */
	grayscale(scale = 1) {
		return Texture.grayscale(this, scale);
	}
	/**
	 * @param {number} scale [0 - 1]
	 */
	invert(scale = 1) {
		return Texture.invert(this, scale);
	}
	/**
	 * @param {number} scale [0 - 1]
	 */
	sepia(scale = 1) {
		return Texture.sepia(this, scale);
	}
	/**
	 * @param {number} angle (-∞ - ∞)
	 */
	rotate(angle) {
		return Texture.rotate(this, angle);
	}
	/**
	 * @param {number} scale [0 - 1]
	 */
	saturate(scale) {
		return Texture.saturate(this, scale);
	}
	/**
	 * @param {number} scale [0 - 1]
	 */
	illuminate(scale) {
		return Texture.illuminate(this, scale);
	}
	/**
	 * @param {number} scale [0 - 1]
	 */
	pass(scale) {
		return Texture.pass(this, scale);
	}
	//#endregion
};
//#endregion

export { Texture };
