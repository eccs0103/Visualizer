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
		this.hidden = false;
		await this.animate([
			{ opacity: `0` },
			{ opacity: `1` },
		], { duration: this.duration, fill: `both` }).finished;
	}
	async close() {
		await this.animate([
			{ opacity: `0` },
			{ opacity: `1` },
		], { duration: this.duration, fill: `both` }).finished;
		this.hidden = true;
	}
}
customElements.define(`ac-panel`, ACPanelElement);