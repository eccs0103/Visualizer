"use strict";

new class {
	/** @type {HTMLElement} */
	#body;
	/** @type {HTMLDialogElement} */
	#dialogLoader;
	/** @type {HTMLImageElement} */
	#imgLogo;
	/** @type {HTMLHeadingElement} */
	#h2Heading;
	/** @type {number} */
	#counter = 0;
	/** @type {number} */
	#count = 4;
	/**
	 * @returns {void}
	 */
	#tickHeading() {
		this.#h2Heading.textContent = `Loading${`.`.repeat(this.#counter)}`;
		this.#counter = (this.#counter + 1) % this.#count;
	}
	/** @type {number} */
	#indexAnimationInterval;
	/**
	 * @returns {void}
	 */
	#beginHeadingAnimation() {
		this.#tickHeading();
		this.#indexAnimationInterval = setInterval(() => {
			this.#tickHeading();
		}, 1000 / this.#count);
	}
	/**
	 * @returns {void}
	 */
	#endHeadingAnimation() {
		clearInterval(this.#indexAnimationInterval);
	}
	/**
	 * @param {boolean} status 
	 * @returns {void}
	 */
	#toggleHeadingAnimation(status) {
		if (status) this.#beginHeadingAnimation();
		else this.#endHeadingAnimation();
	}
	/** @type {HTMLElement} */
	#bHint;
	constructor() {
		this.#body = document.body;

		this.#dialogLoader = this.#body.appendChild(document.createElement(`dialog`));
		this.#dialogLoader.classList.add(`loader`, `layer`, `rounded`, `with-padding`, `large-padding`);
		this.#dialogLoader.style.maxWidth = `60vmin`;
		this.#dialogLoader.style.display = `grid`;
		this.#dialogLoader.style.gridTemplateRows = `1fr auto auto`;
		this.#dialogLoader.style.placeItems = `center`;

		this.#imgLogo = this.#dialogLoader.appendChild(document.createElement(`img`));
		this.#imgLogo.alt = `Logo`;

		this.#h2Heading = this.#dialogLoader.appendChild(document.createElement(`h2`));
		new MutationObserver((mutations) => {
			if (!mutations.some(mutation => mutation.type === `attributes` && mutation.attributeName === `open`)) return;
			this.#toggleHeadingAnimation(this.#dialogLoader.hasAttribute(`open`));
		}).observe(this.#dialogLoader, { attributes: true });

		this.#bHint = this.#dialogLoader.appendChild(document.createElement(`b`));
		this.#bHint.innerText = `Please wait`;

		Array.from(document.getElementsByTagName(`script`)).at(-1)?.remove();
	}
}();
