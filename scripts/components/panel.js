"use strict";

class ACPanelElement extends HTMLElement {
	/** @type {Number} */ #duration = 250;
	get duration() {
		return this.#duration;
	}
	set duration(value) {
		this.#duration = value;
	}
	async open() {
		this.toggleAttribute(`open`, true);
		await this.animate([
			{ opacity: `0` },
			{ opacity: `1` },
		], { duration: this.duration, fill: `forwards` }).finished;
	}
	async close() {
		await this.animate([
			{ opacity: `1` },
			{ opacity: `0` },
		], { duration: this.duration, fill: `forwards` }).finished;
		this.toggleAttribute(`open`, false);
	}
}
customElements.define(`ac-panel`, ACPanelElement);