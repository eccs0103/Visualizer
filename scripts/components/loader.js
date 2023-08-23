// @ts-ignore
/** @typedef {import("./manager.js")} */

"use strict";

Manager.load(new Promise((resolve) => {
	window.addEventListener(`load`, (event) => {
		resolve(undefined);
	});
}));