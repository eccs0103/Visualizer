"use strict";

import { } from "./dom/extensions.mjs";
import { Vector2D } from "./core/measures.mjs";
import { Color } from "./core/palette.mjs";
import { DataTypes, Visualizer } from "./structure.mjs";

const { min, split, sin, cos, PI, hypot, abs, trunc, sqrt, SQRT1_2 } = Math;

//#region Pulsar
Visualizer.attach(`Pulsar`, new class extends Visualizer.Visualiztion {
	/** @type {number} */
	#radius;
	/**
	 * @returns {void}
	 */
	resize() {
		const { context } = this;
		const { width, height } = context.canvas;
		this.#radius = min(width, height) / 2;
		context.lineWidth = this.#radius / 256;
	}
	/** @type {number} */
	#duration = 6;
	/** @type {Vector2D} */
	#position = Vector2D.newNaN;
	/** @type {number} */
	#offsetPulsarOuterColor = 0;
	/** @type {Color} */
	#colorPulsarOuter = Color.viaRGB(25, 25, 25);
	/** @type {Color} */
	#colorPulsarHighlighting = Color.viaHSL(0, 100, 50);
	/** @type {Color} */
	#colorPulsarInner = Color.newBlack;
	/** @type {Color} */
	#colorShadow = Color.newTransparent;
	/**
	 * @returns {void}
	 */
	update() {
		const { context, audio, delta } = this;
		const radius = this.#radius;
		const { width, height } = context.canvas;
		const dataFrequency = audio.getData(DataTypes.frequency);
		const dataTimeDomain = audio.getData(DataTypes.timeDomain);
		const factorVolume = audio.getVolume(DataTypes.frequency).interpolate(0, 255);
		const factorAmplitude = audio.getAmplitude(DataTypes.timeDomain).interpolate(0, 255);
		const factorAudio = factorAmplitude * factorVolume;

		const transform = context.getTransform();
		transform.a = 0.5 + 0.5 * factorAudio;
		transform.d = 0.5 + 0.5 * factorAudio;
		context.clearRect(-transform.e / transform.a, -transform.f / transform.d, width / transform.a, height / transform.d);

		const position = this.#position;
		const fullLength = audio.tapeLength;
		const semiLength = fullLength / 2;

		//#region Pulsar
		const gradientPulsar = context.createConicGradient(PI / 2, 0, 0);
		const colorPulsarHighlighting = this.#colorPulsarHighlighting;

		context.beginPath();
		for (let index = 0; index < fullLength; index++) {
			const progress = index.interpolate(0, fullLength);
			const offset = abs(index - semiLength).interpolate(0, semiLength + 1);
			const datum = dataFrequency[trunc(offset * semiLength)].interpolate(0, 255);
			const distance = (0.6 + 0.4 * hypot(datum, factorAudio)) * radius;
			position.x = distance * sin(progress * 2 * PI);
			position.y = distance * cos(progress * 2 * PI);
			gradientPulsar.addColorStop(progress, new Color(colorPulsarHighlighting)
				.rotate(180 * offset)
				.illuminate(0.1 + 0.9 * sqrt(factorVolume))
				.toString(true)
			);
			context.lineTo(position.x, position.y);
		}
		context.closePath();

		context.globalCompositeOperation = `source-over`;
		context.fillStyle = this.#colorPulsarInner.toString(true);
		context.fill();
		context.strokeStyle = gradientPulsar;
		context.stroke();

		if (Number.isFinite(delta)) {
			const [integer, fractional] = split(this.#offsetPulsarOuterColor + (360 / this.#duration) * delta * factorVolume);
			colorPulsarHighlighting.rotate(integer);
			this.#offsetPulsarOuterColor = fractional;
		}
		//#endregion
		//#region Wave
		context.beginPath();
		context.moveTo(-width / 2, 0);
		for (let index = 0; index < fullLength; index++) {
			const coefficent = index.interpolate(0, fullLength);
			const datum = dataTimeDomain[trunc(coefficent * fullLength)].interpolate(0, 255, -1, 1);
			const value = datum * factorAmplitude;
			position.x = width * (coefficent - 0.5);
			position.y = (radius) * value;
			context.lineTo(position.x, position.y);
		}
		context.lineTo(width / 2, 0);

		context.globalCompositeOperation = `source-atop`;
		context.fillStyle = gradientPulsar;
		context.fill();
		context.strokeStyle = gradientPulsar;
		context.stroke();
		//#endregion
		//#region Shadow
		const gradientForegroundShadow = context.createRadialGradient(0, 0, 0, 0, 0, radius);
		const colorShadow = this.#colorShadow;

		gradientForegroundShadow.addColorStop(0, colorShadow.pass(1).toString(true));
		gradientForegroundShadow.addColorStop(0.5, colorShadow.pass(SQRT1_2).toString(true));
		gradientForegroundShadow.addColorStop(1, colorShadow.pass(0).toString(true));

		context.globalCompositeOperation = `source-over`;
		context.fillStyle = gradientForegroundShadow;
		context.fill();
		//#endregion
		//#region Background
		context.globalCompositeOperation = `destination-atop`;
		context.fillStyle = this.#colorPulsarOuter.toString();
		context.fillRect(-transform.e / transform.a, -transform.f / transform.d, width / transform.a, height / transform.d);
		//#endregion
	}
});
//#endregion
