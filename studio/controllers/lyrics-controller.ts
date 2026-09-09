"use strict";

import "adaptive-extender/web";
import { BufferedCell, Controller } from "adaptive-extender/web";
import { PlaylistPlayer } from "../services/playlist-player.js";
import { LyricsFinder } from "../services/lyrics-finder.js";
import { Visualizer } from "../services/visualizer.js";
import { Lyrics } from "../models/lyrics.js";
import { LyricsWindow } from "../models/visualization.js";
import { type Track } from "../models/playlist.js";
import { type Settings } from "../models/settings.js";

//#region Lyrics controller
export class LyricsController extends Controller<[BufferedCell<typeof Settings>, PlaylistPlayer, HTMLAudioElement, Visualizer, HTMLInputElement, HTMLInputElement, HTMLInputElement]> {
	#player: PlaylistPlayer;
	#audioPlayer: HTMLAudioElement;
	#settings: Settings;
	#visualizer: Visualizer;
	#enabled: boolean = true;
	#lyrics: Lyrics | null = null;
	#index: number = -1;
	#frame: number | null = null;
	#trackId: string | null = null;

	#lineAt(lyrics: Lyrics, index: number): string | null {
		const line = lyrics.lines[index];
		if (line === undefined) return null;
		return line.text;
	}

	#render(): void {
		if (!this.#enabled) { this.#visualizer.updateLyrics(null); return; }
		const lyrics = this.#lyrics;
		if (lyrics === null || lyrics.isEmpty) { this.#visualizer.updateLyrics(null); return; }
		const index = this.#index;
		const previous = this.#lineAt(lyrics, index - 1);
		const current = this.#lineAt(lyrics, index);
		const next = this.#lineAt(lyrics, index + 1);
		this.#visualizer.updateLyrics(new LyricsWindow(previous, current, next));
	}

	#sync(): void {
		const lyrics = this.#lyrics;
		if (lyrics === null) return;
		const index = lyrics.at(this.#audioPlayer.currentTime);
		if (index === this.#index) return;
		this.#index = index;
		this.#render();
	}

	#tick(): void {
		this.#sync();
		this.#frame = requestAnimationFrame(() => this.#tick());
	}

	#startLoop(): void {
		if (this.#frame !== null) return;
		this.#frame = requestAnimationFrame(() => this.#tick());
	}

	#stopLoop(): void {
		if (this.#frame === null) return;
		cancelAnimationFrame(this.#frame);
		this.#frame = null;
	}

	async #resolveLyrics(track: Track): Promise<string | null> {
		const player = this.#player;
		const stored = await player.readLyrics(track);
		if (stored !== null) return stored;
		if (!this.#settings.lookup) return null;

		const found = await LyricsFinder.find(track.signature, track.duration);
		let text = found;
		if (text === null) text = String.empty;
		if (this.#trackId !== track.id) return null;
		await player.setLyrics(track, text);
		return text;
	}

	async #onTrack(track: Track | null): Promise<void> {
		let trackId: string | null = null;
		if (track !== null) trackId = track.id;
		this.#trackId = trackId;
		this.#lyrics = null;
		this.#index = -1;
		this.#stopLoop();
		this.#render();

		if (track === null) return;

		const resolved = await this.#resolveLyrics(track);
		if (this.#trackId !== track.id) return;

		let content = resolved;
		if (content === null) content = String.empty;
		this.#lyrics = Lyrics.parse(content);
		this.#render();
		if (!this.#audioPlayer.paused && !this.#lyrics.isEmpty) this.#startLoop();
	}

	async run(cell: BufferedCell<typeof Settings>, player: PlaylistPlayer, audioPlayer: HTMLAudioElement, visualizer: Visualizer, inputLyricsToggle: HTMLInputElement, inputLyricsShake: HTMLInputElement, inputLyricsLookupToggle: HTMLInputElement): Promise<void> {
		this.#player = player;
		this.#audioPlayer = audioPlayer;
		this.#settings = cell.content;
		this.#visualizer = visualizer;
		this.#enabled = this.#settings.lyrics;

		player.addEventListener("track", event => void this.#onTrack(event.detail));
		audioPlayer.addEventListener("play", event => { if (this.#lyrics !== null && !this.#lyrics.isEmpty) this.#startLoop(); });
		audioPlayer.addEventListener("pause", event => this.#stopLoop());
		audioPlayer.addEventListener("emptied", event => this.#stopLoop());
		audioPlayer.addEventListener("seeked", event => this.#sync());

		inputLyricsToggle.checked = this.#settings.lyrics;
		inputLyricsToggle.addEventListener("input", (event) => {
			this.#enabled = inputLyricsToggle.checked;
			this.#render();
		});
		inputLyricsToggle.addEventListener("change", async (event) => {
			this.#settings.lyrics = inputLyricsToggle.checked;
			await cell.save(500);
		});

		inputLyricsShake.min = String(0);
		inputLyricsShake.max = String(1);
		inputLyricsShake.step = String(0.1);
		inputLyricsShake.value = String(this.#settings.lyricsShake);
		visualizer.lyricsShake = this.#settings.lyricsShake;
		inputLyricsShake.addEventListener("input", (event) => {
			visualizer.lyricsShake = Number(inputLyricsShake.value);
		});
		inputLyricsShake.addEventListener("change", async (event) => {
			this.#settings.lyricsShake = visualizer.lyricsShake;
			await cell.save(500);
		});

		inputLyricsLookupToggle.checked = this.#settings.lookup;
		inputLyricsLookupToggle.addEventListener("change", async (event) => {
			this.#settings.lookup = inputLyricsLookupToggle.checked;
			await cell.save(500);
		});

		await this.#onTrack(player.current);
	}
}
//#endregion
