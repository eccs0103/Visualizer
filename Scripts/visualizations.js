import { Point2D } from "./modules/measures.js";
import { Color } from "./modules/palette.js";
import { DataTypes, Visualizer } from "./structure.js";

const { min, split, sin, cos, PI, hypot, abs, trunc, sqpw, sqrt, SQRT1_2 } = Math;

//#region Pulsar
Visualizer.attach(`Pulsar`, class extends Visualizer.Visualization {
	/** @type {number} */
	#radius;
	/**
	 * @returns {Promise<void>}
	 */
	async resize() {
		const { context } = this;
		const { width, height } = context.canvas;
		this.#radius = min(width, height) / 2;
		context.lineWidth = this.#radius / 256;
	}
	/** @type {number} */
	#duration = 6;
	/** @type {Point2D} */
	#position = Point2D.NAN;
	/** @type {number} */
	#offsetPulsarOuterColor = 0;
	/** @type {Color} */
	#colorPulsarOuter = Color.viaHSL(0, 100, 50);
	/** @type {Color} */
	#colorPulsarInner = Color.BLACK;
	/** @type {Color} */
	#colorShadow = Color.TRANSPARENT;
	/**
	 * @returns {Promise<void>}
	 */
	async update() {
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

		//#region Pulsar
		const period = audio.tapeLength / 2;
		const gradientPulsar = context.createConicGradient(PI / 2, 0, 0);
		const colorPulsarOuter = this.#colorPulsarOuter;

		context.beginPath();
		for (let angle = -period + 1; angle < period; angle++) {
			const factorProgress = (angle + period).interpolate(1, 2 * period - 1);
			const index = abs(angle).interpolate(0, period - 1);
			const datul = dataFrequency[trunc(index * (period - 1) * 0.7)].interpolate(0, 255);
			const distance = (0.6 + 0.4 * hypot(datul, factorAudio)) * radius;
			position.x = distance * sin(factorProgress * 2 * PI);
			position.y = distance * cos(factorProgress * 2 * PI);
			gradientPulsar.addColorStop(factorProgress, Color.clone(colorPulsarOuter)
				.rotate(180 * index)
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
			colorPulsarOuter.rotate(integer);
			this.#offsetPulsarOuterColor = fractional;
		}
		//#endregion
		//#region Wave
		context.beginPath();
		context.moveTo(-width / 2, 0);
		for (let index = 0; index < audio.tapeLength; index++) {
			const coefficent = index.interpolate(0, audio.tapeLength);
			const datul = dataTimeDomain[trunc(coefficent * audio.tapeLength)].interpolate(0, 255, -1, 1);
			const value = datul * factorAmplitude;
			position.x = width * (coefficent - 0.5);
			position.y = (radius) * value;
			context.lineTo(position.x, position.y);
		}
		context.lineTo(width / 2, 0);

		context.fillStyle = gradientPulsar;
		context.strokeStyle = gradientPulsar;
		context.globalCompositeOperation = `source-atop`;
		context.fill();
		context.stroke();
		//#endregion
		//#region Shadow
		const gradientForegroundShadow = context.createRadialGradient(0, 0, 0, 0, 0, radius);
		gradientForegroundShadow.addColorStop(0, this.#colorShadow.pass(1).toString(true));
		gradientForegroundShadow.addColorStop(0.5, this.#colorShadow.pass(SQRT1_2).toString(true));
		gradientForegroundShadow.addColorStop(1, this.#colorShadow.pass(0).toString(true));
		context.globalCompositeOperation = `source-over`;
		context.fillStyle = gradientForegroundShadow;
		context.fill();
		//#endregion
	}
});
//#endregion
