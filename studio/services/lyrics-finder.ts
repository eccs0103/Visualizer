"use strict";

//#region Lyrics finder
interface LRCLIBResult {
	duration: number;
	instrumental: boolean;
	syncedLyrics: string | null;
}

// ponytail: matches on the bare filename and a duration window; add artist/title tag parsing if the hit rate is bad
export class LyricsFinder {
	static #tolerance = 5;

	static async find(signature: string, duration: number): Promise<string | null> {
		try {
			const url = new URL("https://lrclib.net/api/search");
			url.searchParams.set("q", signature);
			const response = await fetch(url);
			if (!response.ok) return null;

			const results: LRCLIBResult[] = await response.json();
			let best: string | null = null;
			let bestGap = Infinity;
			for (const result of results) {
				if (result.instrumental || result.syncedLyrics === null) continue;
				const gap = Math.abs(result.duration - duration);
				if (gap >= bestGap) continue;
				best = result.syncedLyrics;
				bestGap = gap;
			}

			if (best === null || bestGap > LyricsFinder.#tolerance) return null;
			return best;
		} catch {
			return null;
		}
	}
}
//#endregion
