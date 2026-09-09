"use strict";

import "adaptive-extender/worker";
import { Controller } from "adaptive-extender/worker";
import { type VisualizationBundle, type LyricsView, LyricsWindow } from "../models/visualization.js";
import { Registry } from "../services/visualization-registry.js";
import { RenderCommand, InitializeRenderCommand, TickCommand, RebuildRenderCommand, LyricsRenderCommand, LyricsShakeRenderCommand } from "../models/render-commands.js";
import { WorkerAudioset, WorkerEnvironment } from "../services/worker-visualization.js";
import "../view/visualizations.js";

//#region Visualization worker
class VisualizationWorker extends Controller {
	#bundles: Map<string, VisualizationBundle> = new Map();
	#context: OffscreenCanvasRenderingContext2D;
	#audioset: WorkerAudioset;
	#environment: WorkerEnvironment;
	#lyrics: LyricsView | null = null;
	#lyricsShake: number = 0;
	#selection: string;
	#width: number = 0;
	#height: number = 0;
	#rebuilt: boolean = false;

	#rebuild(): void {
		const width = this.#width;
		const height = this.#height;
		if (width === 0 || height === 0) return;
		const context = this.#context;
		const audioset = this.#audioset;
		const environment = this.#environment;
		const lyrics = this.#lyrics;
		const lyricsShake = this.#lyricsShake;
		audioset.sync();
		environment.reset();
		const { canvas } = context;
		canvas.width = width;
		canvas.height = height;
		context.reset();
		context.resetTransform();
		const selection = this.#selection;
		const bundle = ReferenceError.suppress(this.#bundles.get(selection), `Visualization with name '${selection}' is not attached`);
		bundle.rebuild({ context, audioset, environment, lyrics, lyricsShake });
		bundle.update({ context, audioset, environment, lyrics, lyricsShake });
		this.#rebuilt = true;
	}

	#onMessage(event: MessageEvent): void {
		const command = RenderCommand.import(event.data, "command");
		const bundles = this.#bundles;

		if (command instanceof InitializeRenderCommand) {
			const { sabVideo, sabAudio, canvas } = command;

			this.#context = ReferenceError.suppress(canvas.getContext("2d"), "Failed to acquire 2D rendering context");
			const audioset = this.#audioset = new WorkerAudioset(sabVideo, sabAudio);
			this.#environment = new WorkerEnvironment(audioset);
			let selection: string | null = null;
			for (const [name, descriptor] of Registry.entries()) {
				bundles.set(name, Registry.createBundle(descriptor));
				if (selection === null) selection = name;
			}
			this.#selection = ReferenceError.suppress(selection, "Failed to find any visualization");
			canvas.addEventListener("contextlost", event => this.#rebuilt = false);
			canvas.addEventListener("contextrestored", event => this.#rebuild());
			return;
		}

		if (command instanceof TickCommand) {
			if (!this.#rebuilt) return;
			const context = this.#context;
			const audioset = this.#audioset;
			const environment = this.#environment;
			const lyrics = this.#lyrics;
			const lyricsShake = this.#lyricsShake;
			audioset.sync();
			environment.tick();
			const selection = this.#selection;
			const bundle = ReferenceError.suppress(bundles.get(selection), `Visualization with name '${selection}' is not attached`);
			bundle.update({ context, audioset, environment, lyrics, lyricsShake });
			return;
		}

		if (command instanceof RebuildRenderCommand) {
			const { width, height, visualization } = command;
			if (visualization !== this.#selection) this.#selection = visualization;
			this.#width = width;
			this.#height = height;
			this.#rebuild();
			return;
		}

		if (command instanceof LyricsRenderCommand) {
			const { previous, current, next } = command;
			if (previous === null && current === null && next === null) {
				this.#lyrics = null;
				return;
			}
			this.#lyrics = new LyricsWindow(previous, current, next);
			return;
		}

		if (command instanceof LyricsShakeRenderCommand) {
			this.#lyricsShake = command.value;
			return;
		}
	}

	async run(): Promise<void> {
		self.addEventListener("message", this.#onMessage.bind(this));
	}
}
//#endregion

await VisualizationWorker.launch();
