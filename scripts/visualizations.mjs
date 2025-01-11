"use strict";

import { } from "./dom/extensions.mjs";
import { Vector2D } from "./core/measures.mjs";
import { Color } from "./core/palette.mjs";
import { DataTypes, Visualizer } from "./structure.mjs";

const { min, max, split, sin, cos, PI, hypot, abs, trunc, sqrt, SQRT1_2, sqpw } = Math;

//#region Pulsar
Visualizer.attach(`Pulsar`, new class extends Visualizer.Visualization {
	//#region Rebuild preparation
	/** @type {number} */
	#radius;
	/**
	 * @returns {void}
	 */
	#runMetadataRebuild() {
		const { context } = this;
		const { width, height } = context.canvas;

		const radius = this.#radius = min(width, height) / 2;
	}
	/**
	 * @returns {void}
	 */
	#runContextRebuild() {
		const { context } = this;
		const { width, height } = context.canvas;
		const radius = this.#radius;

		const transform = context.getTransform();
		transform.e = width / 2;
		transform.f = height / 2;
		context.setTransform(transform);

		context.lineWidth = radius / 256;
	}
	//#endregion

	/**
	 * @returns {void}
	 */
	rebuild() {
		this.#runMetadataRebuild();
		this.#runContextRebuild();
	}

	//#region Update preparation
	/** @type {Uint8Array} */
	#dataFrequency;
	/** @type {Uint8Array} */
	#dataTimeDomain;
	/** @type {number} */
	#factorVolume;
	/** @type {number} */
	#factorAmplitude;
	/** @type {number} */
	#factorAudio;
	/**
	 * @returns {void}
	 */
	#runMetadataUpdate() {
		const { audio } = this;

		const dataFrequency = this.#dataFrequency = audio.getData(DataTypes.frequency);
		const dataTimeDomain = this.#dataTimeDomain = audio.getData(DataTypes.timeDomain);

		const factorVolume = this.#factorVolume = audio.getVolume(DataTypes.frequency).interpolate(0, 255);
		const factorAmplitude = this.#factorAmplitude = audio.getAmplitude(DataTypes.timeDomain).interpolate(0, 255);
		const factorAudio = this.#factorAudio = factorAmplitude * factorVolume;
	}
	/**
	 * @returns {void}
	 */
	#runContextUpdate() {
		const { context } = this;
		const { width, height } = context.canvas;
		const factorAudio = this.#factorAudio;

		const transform = context.getTransform();
		transform.a = 0.5 + 0.5 * factorAudio;
		transform.d = 0.5 + 0.5 * factorAudio;
		context.clearRect(-transform.e / transform.a, -transform.f / transform.d, width / transform.a, height / transform.d);
	}
	//#endregion
	//#region Halo
	/** @type {Color} */
	#colorHaloOuter = Color.viaHSL(0, 100, 50);
	/** @type {Color} */
	#colorHaloInner = Color.newBlack;
	/** @type {CanvasGradient} */
	#gradientHalo;
	/**
	 * @returns {void}
	 */
	#runHaloDrawing() {
		const radius = this.#radius;
		const colorHaloOuter = this.#colorHaloOuter;
		const colorHaloInner = this.#colorHaloInner;
		const { context, audio } = this;
		const { tapeLength } = audio;
		const tapeSemiLength = tapeLength / 2;
		const dataFrequency = this.#dataFrequency;
		const factorVolume = this.#factorVolume;
		const factorAudio = this.#factorAudio;

		const gradientHalo = this.#gradientHalo = context.createConicGradient(PI / 2, 0, 0);
		const position = Vector2D.newNaN;
		context.beginPath();
		for (let index = 0; index < tapeLength; index++) {
			const progress = index.interpolate(0, tapeLength);
			const offset = abs(index - tapeSemiLength).interpolate(0, tapeSemiLength + 1);
			gradientHalo.addColorStop(progress, new Color(colorHaloOuter)
				.rotate(180 * offset)
				.illuminate(0.1 + 0.9 * sqrt(factorVolume))
				.toString()
			);
			const datum = dataFrequency[trunc(offset * tapeSemiLength)].interpolate(0, 255);
			const distance = (0.6 + 0.4 * hypot(datum, factorAudio)) * radius;
			position.x = distance * sin(progress * 2 * PI);
			position.y = distance * cos(progress * 2 * PI);
			context.lineTo(position.x, position.y);
		}
		context.closePath();

		context.globalCompositeOperation = `source-over`;
		context.fillStyle = colorHaloInner.toString();
		context.fill();
		context.strokeStyle = gradientHalo;
		context.stroke();
	}
	/** @type {number} */
	#offsetHaloRotation = 0;
	/**
	 * @returns {void}
	 */
	#runHaloRotation() {
		const colorHalo = this.#colorHaloOuter;
		const duration = 6;
		const { delta } = this;
		const factorVolume = this.#factorVolume;

		if (!Number.isFinite(delta)) return;
		const [integer, fractional] = split(this.#offsetHaloRotation + (360 / duration) * delta * factorVolume);
		colorHalo.rotate(integer);
		this.#offsetHaloRotation = fractional;
	}
	//#endregion
	//#region Wave
	/**
	 * @returns {void}
	 */
	#runWaveDrawing() {
		const radius = this.#radius;
		const gradientHalo = this.#gradientHalo;
		const { context, audio } = this;
		const { width } = context.canvas;
		const tapeLength = audio.tapeLength;
		const dataTimeDomain = this.#dataTimeDomain;
		const factorAmplitude = this.#factorAmplitude;

		const position = Vector2D.newNaN;
		context.beginPath();
		context.moveTo(-width / 2, 0);
		for (let index = 0; index < tapeLength; index++) {
			const coefficent = index.interpolate(0, tapeLength);
			const datum = dataTimeDomain[trunc(coefficent * tapeLength)].interpolate(0, 255, -1, 1);
			const value = datum * factorAmplitude;
			position.x = width * (coefficent - 0.5);
			position.y = (radius) * value;
			context.lineTo(position.x, position.y);
		}
		context.lineTo(width / 2, 0);

		context.globalCompositeOperation = `source-atop`;
		context.fillStyle = gradientHalo;
		context.fill();
		context.strokeStyle = gradientHalo;
		context.stroke();
	}
	//#endregion
	//#region Shadow
	/** @type {Color} */
	#colorShadow = Color.newTransparent;
	/**
	 * @returns {void}
	 */
	#runShadowDrawing() {
		const radius = this.#radius;
		const colorShadow = this.#colorShadow;
		const { context } = this;

		const gradientShadow = context.createRadialGradient(0, 0, 0, 0, 0, radius);
		gradientShadow.addColorStop(0, colorShadow.pass(1).toString());
		gradientShadow.addColorStop(0.5, colorShadow.pass(SQRT1_2).toString());
		gradientShadow.addColorStop(1, colorShadow.pass(0).toString());

		context.globalCompositeOperation = `source-over`;
		context.fillStyle = gradientShadow;
		context.fill();
	}
	//#endregion
	//#region Background
	/** @type {Color} */
	#colorBackground = Color.viaRGB(25, 25, 25);
	/**
	 * @returns {void}
	 */
	#runBackgroundDrawing() {
		const colorBackground = this.#colorBackground;
		const { context } = this;
		const transform = context.getTransform();
		const { width, height } = context.canvas;

		context.globalCompositeOperation = `destination-atop`;
		context.fillStyle = colorBackground.toString();
		context.fillRect(-transform.e / transform.a, -transform.f / transform.d, width / transform.a, height / transform.d);
	}
	//#endregion

	/**
	 * @returns {void}
	 */
	update() {
		this.#runMetadataUpdate();
		this.#runContextUpdate();

		this.#runHaloDrawing();
		this.#runHaloRotation();

		this.#runWaveDrawing();

		this.#runShadowDrawing();

		this.#runBackgroundDrawing();
	}
});
//#endregion

//#region Spectrogram
Visualizer.attach(`Spectrogram`, new class extends Visualizer.Visualization {
	//#region Rebuild preparation
	/** @type {number} */
	#anchor = 0.8;
	/** @type {number} */
	#angular;
	/** @type {Color} */
	#colorGrid;
	/**
	 * @param {number} value 
	 * @returns {number}
	 */
	#interpolate(value) {
		const alpha = 0.2;
		return value * (1 - alpha) + 0.5 * alpha;
	}
	/**
	 * @returns {void}
	 */
	#runMetadataRebuild() {
		this.#angular = 360 / 6;

		const colorGrid = this.#colorGrid = Color.parse(getComputedStyle(document.documentElement).getPropertyValue(`--color-background`));
		colorGrid.lightness = this.#interpolate(colorGrid.lightness / 100) * 100;
	}
	/**
	 * @returns {void}
	 */
	#runContextRebuild() {
		const { context } = this;
		const { width, height } = context.canvas;

		const transform = context.getTransform();
		transform.e = width / 2;
		transform.f = height / 2;
		context.setTransform(transform);

		context.lineWidth = min(width, height) >> 8;
	}
	//#endregion

	/**
	 * @returns {void}
	 */
	rebuild() {
		this.#runMetadataRebuild();
		this.#runContextRebuild();
	}

	//#region Update preparation
	/** @type {Uint8Array} */
	#dataFrequency;
	/** @type {number} */
	#factorVolumeFrequency;
	/** @type {number} */
	#factorFrequencyAmplitude;
	/** @type {number} */
	#factorTimeDomainAmplitude;
	/**
	 * @returns {void}
	 */
	#runMetadataUpdate() {
		const { audio } = this;

		const dataFrequency = this.#dataFrequency = audio.getData(DataTypes.frequency);
		const factorVolumeFrequency = this.#factorVolumeFrequency = audio.getVolume(DataTypes.frequency).interpolate(0, 255);
		const factorFrequencyAmplitude = this.#factorFrequencyAmplitude = audio.getAmplitude(DataTypes.frequency).interpolate(0, 255);
		const factorTimeDomainAmplitude = this.#factorTimeDomainAmplitude = audio.getAmplitude(DataTypes.timeDomain).interpolate(0, 255);
	}
	/**
	 * @returns {void}
	 */
	#runContextUpdate() {
		const factorFrequencyAmplitude = this.#factorFrequencyAmplitude;
		const factorTimeDomainAmplitude = this.#factorTimeDomainAmplitude;
		const { context } = this;
		const { width, height } = context.canvas;

		const transform = context.getTransform();
		transform.a = 1 + 0.2 * factorFrequencyAmplitude;
		transform.d = 1 + 0.4 * factorTimeDomainAmplitude;
		context.clearRect(-transform.e / transform.a, -transform.f / transform.d, width / transform.a, height / transform.d);
		context.setTransform(transform);
	}
	//#endregion
	//#region Grid
	/**
	 * @returns {void}
	 */
	#runGridDrawing() {
		const colorGrid = this.#colorGrid;
		const { context } = this;
		const { width, height } = context.canvas;

		const step = 4 * context.lineWidth;
		const position = Vector2D.newNaN;
		position.y = -height / 2;
		context.beginPath();
		for (position.x = -trunc(width / step) * step / 2; position.x < width; position.x += step) {
			context.moveTo(position.x, position.y);
			context.lineTo(position.x, position.y + height);
		}
		position.x = -width / 2;
		for (position.y = -trunc(height / step) * step / 2; position.y < height; position.y += step) {
			context.moveTo(position.x, position.y);
			context.lineTo(position.x + width, position.y);
		}

		context.globalCompositeOperation = `source-over`;
		context.strokeStyle = colorGrid.toString();
		context.stroke();
	}
	//#endregion
	//#region Spectrum
	/** @type {Color} */
	#colorSpectrumSeed = Color.viaHSL(0, 100, 50);
	/**
	 * @returns {void}
	 */
	#runSpectrumDrawing() {
		const dataFrequency = this.#dataFrequency;
		const anchor = this.#anchor;
		const colorSpectrumSeed = this.#colorSpectrumSeed;
		const angular = this.#angular;
		const factorVolumeFrequency = this.#factorVolumeFrequency;
		const factorTimeDomainAmplitude = this.#factorTimeDomainAmplitude;
		const { context, audio } = this;
		const { width, height } = context.canvas;

		const position = Vector2D.newNaN;
		const tapeLength = trunc(width / max(width, height) * audio.tapeLength);
		const gradientSpectrum = context.createLinearGradient(-width / 2, height / 2, width / 2, height / 2);
		context.beginPath();
		for (let index = 0.5 - tapeLength; index < tapeLength; index++) {
			const progress = trunc(abs(index));
			const factor = progress.interpolate(0, tapeLength);
			const datum = dataFrequency[trunc(progress * 0.7)].interpolate(0, 255);
			const value = sqrt(sqpw(datum) * factorVolumeFrequency);
			position.x = width * (factor - 0.5);
			position.y = height * ((1 - value) * anchor - 0.5 + Number(index < 0) * value);
			gradientSpectrum.addColorStop(factor, new Color(colorSpectrumSeed)
				.rotate(120 * factor + angular * (factorTimeDomainAmplitude * 2 - 1))
				.illuminate(0.2 + 0.5 * factorVolumeFrequency)
				.toString()
			);
			context.lineTo(position.x, position.y);
		}
		context.closePath();

		context.globalCompositeOperation = `source-in`;
		context.fillStyle = gradientSpectrum;
		context.fill();
	}
	/** @type {number} */
	#offsetSpectrumRotation = 0;
	/**
	 * @returns {void}
	 */
	#runSpectrumRotation() {
		const colorSpectrumSeed = this.#colorSpectrumSeed;
		const angular = this.#angular;
		const factorTimeDomainAmplitude = this.#factorTimeDomainAmplitude;
		const { delta } = this;

		if (!Number.isFinite(delta)) return;
		const [integer, fractional] = split(this.#offsetSpectrumRotation + angular * delta * factorTimeDomainAmplitude);
		colorSpectrumSeed.rotate(-integer);
		this.#offsetSpectrumRotation = fractional;
	}
	//#endregion
	//#region Shadow
	/** @type {Color} */
	#colorShadow = Color.newBlack;
	/**
	 * @returns {void}
	 */
	#runShadowDrawing() {
		const anchor = this.#anchor;
		const anchorTop = anchor * 2 / 3;
		const anchorBottom = anchorTop + 1 / 3;
		const colorShadow = this.#colorShadow;
		const { context } = this;
		const { width, height } = context.canvas;

		const transform = context.getTransform();
		const gradientShadow = context.createLinearGradient(transform.e, -transform.f, transform.e, transform.f);
		gradientShadow.addColorStop(0, colorShadow.pass(0).toString());
		gradientShadow.addColorStop(anchorTop, colorShadow.pass(0.2).toString());
		gradientShadow.addColorStop(anchor, colorShadow.pass(0.8).toString());
		gradientShadow.addColorStop(anchorBottom, colorShadow.pass(0.4).toString());
		gradientShadow.addColorStop(1, colorShadow.pass(0).toString());

		context.globalCompositeOperation = "multiply";
		context.fillStyle = gradientShadow;
		context.fillRect(-transform.e / transform.a, -transform.f / transform.d, width / transform.a, height / transform.d);
	}
	//#endregion

	/**
	 * @returns {void}
	 */
	update() {
		this.#runMetadataUpdate();
		this.#runContextUpdate();

		this.#runGridDrawing();

		this.#runSpectrumDrawing();
		this.#runSpectrumRotation();

		this.#runShadowDrawing();
	}
});
//#endregion
