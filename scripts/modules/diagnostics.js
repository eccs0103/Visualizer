"use strict";

import { } from "../structure.js";
import { Stopwatch, Timespan } from "./measures.js";

//#region Analyser
/**
 * Provides methods for analysing the code.
 */
class Analyser {
	/**
	 * Measures the duration of an action.
	 * @param {(...args: any) => unknown} action The action to measure.
	 * @returns {Promise<Timespan>} The duration of the action.
	 */
	static async measureDurationOf(action) {
		const stopwatch = new Stopwatch();
		stopwatch.launched = true;
		await action();
		stopwatch.launched = false;
		return stopwatch.elapsed;
	}
}
//#endregion

export { Analyser };