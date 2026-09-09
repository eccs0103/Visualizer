"use strict";

import "adaptive-extender/web";
import { BufferedCell, Controller } from "adaptive-extender/web";
import { PlaylistPlayer } from "../services/playlist-player.js";
import { LyricsFinder } from "../services/lyrics-finder.js";
import { Lyrics } from "../models/lyrics.js";
import { type Track } from "../models/playlist.js";
import { type Settings } from "../models/settings.js";

//#region Lyrics controller
export class LyricsController extends Controller<[BufferedCell<typeof Settings>, PlaylistPlayer, HTMLAudioElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement, HTMLInputElement, HTMLInputElement]> {
	#player: PlaylistPlayer;
	#audioPlayer: HTMLAudioElement;
	#settings: Settings;
	#divLyrics: HTMLElement;
	#bLyricsPrevious: HTMLElement;
	#bLyricsCurrent: HTMLElement;
	#bLyricsNext: HTMLElement;
	#enabled: boolean = true;
	#lyrics: Lyrics | null = null;
	#index: number = -1;
	#frame: number | null = null;
	#trackId: string | null = null;

	#renderLine(item: HTMLElement, text: string): void {
		item.innerText = text;
		item.hidden = String.isEmpty(text);
	}

	#render(): void {
		const lyrics = this.#lyrics;
		const index = this.#index;
		const previous = lyrics?.lines[index - 1]?.text ?? String.empty;
		const current = lyrics?.lines[index]?.text ?? String.empty;
		const next = lyrics?.lines[index + 1]?.text ?? String.empty;
		this.#renderLine(this.#bLyricsPrevious, previous);
		this.#renderLine(this.#bLyricsCurrent, current);
		this.#renderLine(this.#bLyricsNext, next);
	}

	#updateVisibility(): void {
		const lyrics = this.#lyrics;
		this.#divLyrics.hidden = !this.#enabled || lyrics === null || lyrics.isEmpty;
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

		const found = await LyricsFinder.find(track.signature, track.duration) ?? String.empty;
		if (this.#trackId !== track.id) return null;
		await player.setLyrics(track, found);
		return found;
	}

	async #onTrack(track: Track | null): Promise<void> {
		this.#trackId = track?.id ?? null;
		this.#lyrics = null;
		this.#index = -1;
		this.#stopLoop();
		this.#render();
		this.#updateVisibility();

		if (track === null) return;

		const text = await this.#resolveLyrics(track);
		if (this.#trackId !== track.id) return;

		this.#lyrics = Lyrics.parse(text ?? String.empty);
		this.#updateVisibility();
		if (!this.#audioPlayer.paused && !this.#lyrics.isEmpty) this.#startLoop();
	}

	async run(cell: BufferedCell<typeof Settings>, player: PlaylistPlayer, audioPlayer: HTMLAudioElement, divLyrics: HTMLElement, bLyricsPrevious: HTMLElement, bLyricsCurrent: HTMLElement, bLyricsNext: HTMLElement, inputLyricsToggle: HTMLInputElement, inputLyricsLookupToggle: HTMLInputElement): Promise<void> {
		this.#player = player;
		this.#audioPlayer = audioPlayer;
		this.#settings = cell.content;
		this.#divLyrics = divLyrics;
		this.#bLyricsPrevious = bLyricsPrevious;
		this.#bLyricsCurrent = bLyricsCurrent;
		this.#bLyricsNext = bLyricsNext;
		this.#enabled = this.#settings.lyrics;

		player.addEventListener("track", event => void this.#onTrack(event.detail));
		audioPlayer.addEventListener("play", event => { if (this.#lyrics !== null && !this.#lyrics.isEmpty) this.#startLoop(); });
		audioPlayer.addEventListener("pause", event => this.#stopLoop());
		audioPlayer.addEventListener("emptied", event => this.#stopLoop());
		audioPlayer.addEventListener("seeked", event => this.#sync());

		inputLyricsToggle.checked = this.#settings.lyrics;
		inputLyricsToggle.addEventListener("input", (event) => {
			this.#enabled = inputLyricsToggle.checked;
			this.#updateVisibility();
		});
		inputLyricsToggle.addEventListener("change", async (event) => {
			this.#settings.lyrics = inputLyricsToggle.checked;
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
