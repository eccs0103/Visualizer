"use strict";

import "adaptive-extender/core";
import { Color } from "adaptive-extender/core";
import { type LyricsView } from "../models/visualization.js";

const { split, PI, exp, sqrt, asin, min } = Math;

//#region Shaper
export class Shaper {
	static #arcsinSaturate: Shaper = new Shaper(x => asin(sqrt(x)) * 2 / PI);
	static #smoothstep: Shaper = new Shaper(x => x * x * (3 - 2 * x));
	static #identity: Shaper = new Shaper(x => x);

	#callback: (x: number) => number;

	constructor(callback: (x: number) => number) {
		this.#callback = callback;
	}

	static get arcsinSaturate(): Shaper { return this.#arcsinSaturate; }
	static get smoothstep(): Shaper { return this.#smoothstep; }
	static get identity(): Shaper { return this.#identity; }

	static sigmoid(steepness: number = 12, center: number = 0.5): Shaper {
		return new Shaper(x => 1 / (1 + exp(-(steepness * (x - center)))));
	}

	static power(n: number): Shaper {
		return new Shaper(x => x ** n);
	}

	apply(value: number): number {
		return this.#callback(value);
	}

	then(next: Shaper): Shaper {
		const callback = this.#callback;
		return new Shaper(x => next.apply(callback(x)));
	}

	blend(other: Shaper, alpha: number = 0.5): Shaper {
		const callback = this.#callback;
		return new Shaper(x => callback(x) * (1 - alpha) + other.apply(x) * alpha);
	}

	mirror(): Shaper {
		const callback = this.#callback;
		return new Shaper(x => callback(1 - x));
	}

	invert(): Shaper {
		const callback = this.#callback;
		return new Shaper(x => 1 - callback(x));
	}

	remap(value: number, min2: number, max2: number): number {
		return this.#callback(value).lerp(0, 1, min2, max2);
	}
}
//#endregion
//#region Color driver
export class ColorDriver {
	static #rotation: ColorDriver = new ColorDriver((color, steps) => color.rotate(steps));
	#offset: number = 0;
	#callback: (color: Color, steps: number) => void;

	constructor(callback: (color: Color, steps: number) => void) {
		this.#callback = callback;
	}

	static get rotation(): ColorDriver { return this.#rotation; }

	tick(color: Color, ratePerMs: number, delta: number, factor: number = 1): void {
		if (!Number.isFinite(delta)) return;
		const [integer, fractional] = split(this.#offset + ratePerMs * delta * factor);
		this.#callback(color, integer);
		this.#offset = fractional;
	}
}
//#endregion
//#region Lyrics renderer
export class LyricsRenderer {
	static draw(context: OffscreenCanvasRenderingContext2D, lyrics: LyricsView | null, width: number, height: number): void {
		if (lyrics === null) return;
		const { previous, current, next, shake } = lyrics;

		const side = min(width, height);
		const sizeCurrent = side * 0.045;
		const sizeSide = side * 0.03;
		const y = height * 0.3;
		const maxWidth = width * 0.9;

		context.save();
		const live = context.getTransform();
		const semiWidth = width / 2;
		const semiHeight = height / 2;
		const a = 1 + (live.a - 1) * shake;
		const b = live.b * shake;
		const c = live.c * shake;
		const d = 1 + (live.d - 1) * shake;
		const e = semiWidth + (live.e - semiWidth) * shake;
		const f = semiHeight + (live.f - semiHeight) * shake;
		context.setTransform(a, b, c, d, e, f);
		context.globalCompositeOperation = "source-over";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.shadowColor = "black";
		context.shadowBlur = sizeCurrent * 0.3;

		context.font = `${sizeSide}px sans-serif`;
		context.fillStyle = "rgba(255, 255, 255, 0.6)";
		if (previous !== null) context.fillText(previous, 0, y - sizeCurrent, maxWidth);
		if (next !== null) context.fillText(next, 0, y + sizeCurrent, maxWidth);

		context.font = `bold ${sizeCurrent}px sans-serif`;
		context.fillStyle = "white";
		if (current !== null) context.fillText(current, 0, y, maxWidth);

		context.restore();
	}
}
//#endregion
