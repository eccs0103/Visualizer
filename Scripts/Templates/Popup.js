"use strict";

new class {
	/** @type {HTMLElement} */
	#body;
	/** @type {HTMLDialogElement} */
	#dialogAlert;
	/** @type {HTMLDivElement} */
	#divAlertHeader;
	/** @type {HTMLHeadingElement} */
	#h3AlertTitle;
	/** @type {HTMLDivElement} */
	#divAlertCoontainer;
	/** @type {HTMLDialogElement} */
	#dialogConfirm;
	/** @type {HTMLDivElement} */
	#divConfirmHeader;
	/** @type {HTMLHeadingElement} */
	#h3ConfirmTitle;
	/** @type {HTMLDivElement} */
	#divConfirmCoontainer;
	/** @type {HTMLDivElement} */
	#divConfirmFooter;
	/** @type {HTMLButtonElement} */
	#buttonConfirmAccept;
	/** @type {HTMLButtonElement} */
	#buttonConfirmDecline;
	/** @type {HTMLDialogElement} */
	#dialogPrompt;
	/** @type {HTMLDivElement} */
	#divPromptHeader;
	/** @type {HTMLHeadingElement} */
	#h3PromptTitle;
	/** @type {HTMLDivElement} */
	#divPromptCoontainer;
	/** @type {HTMLDivElement} */
	#divPromptFooter;
	/** @type {HTMLButtonElement} */
	#buttonPromptAccept;
	/** @type {HTMLInputElement} */
	#inputPrompt;
	constructor() {
		this.#body = document.body;

		//#region Dialog alert
		this.#dialogAlert = this.#body.appendChild(document.createElement(`dialog`));
		this.#dialogAlert.classList.add(`pop-up`, `alert`, `layer`, `rounded`, `with-padding`, `with-gap`, `flex`, `column`);

		this.#divAlertHeader = this.#dialogAlert.appendChild(document.createElement(`div`));
		this.#divAlertHeader.classList.add(`header`, `flex`, `centered`);

		this.#h3AlertTitle = this.#divAlertHeader.appendChild(document.createElement(`h3`));
		this.#h3AlertTitle.innerText = `Title`;

		this.#divAlertCoontainer = this.#dialogAlert.appendChild(document.createElement(`div`));
		this.#divAlertCoontainer.classList.add(`container`);
		this.#divAlertCoontainer.innerText = `Something went wrong. This text wasn't supposed to appear before you. There might be an internal core error.`;
		//#endregion
		//#region Dialog confirm
		this.#dialogConfirm = this.#body.appendChild(document.createElement(`dialog`));
		this.#dialogConfirm.classList.add(`pop-up`, `confirm`, `layer`, `rounded`, `with-padding`, `with-gap`, `flex`, `column`);

		this.#divConfirmHeader = this.#dialogConfirm.appendChild(document.createElement(`div`));
		this.#divConfirmHeader.classList.add(`header`, `flex`, `centered`);

		this.#h3ConfirmTitle = this.#divConfirmHeader.appendChild(document.createElement(`h3`));
		this.#h3ConfirmTitle.innerText = `Title`;

		this.#divConfirmCoontainer = this.#dialogConfirm.appendChild(document.createElement(`div`));
		this.#divConfirmCoontainer.classList.add(`container`);
		this.#divConfirmCoontainer.innerText = `Something went wrong. This text wasn't supposed to appear before you. There might be an internal core error.`;

		this.#divConfirmFooter = this.#dialogConfirm.appendChild(document.createElement(`div`));
		this.#divConfirmFooter.classList.add(`footer`, `flex`, `centered`, `with-gap`);

		this.#buttonConfirmAccept = this.#divConfirmFooter.appendChild(document.createElement(`button`));
		this.#buttonConfirmAccept.classList.add(`layer`, `rounded`, `flex`, `with-padding`, `highlight`);
		this.#buttonConfirmAccept.innerText = `Accept`;

		this.#buttonConfirmDecline = this.#divConfirmFooter.appendChild(document.createElement(`button`));
		this.#buttonConfirmDecline.classList.add(`layer`, `rounded`, `flex`, `with-padding`, `invalid`);
		this.#buttonConfirmDecline.innerText = `Decline`;
		//#endregion
		//#region Dialog prompt
		this.#dialogPrompt = this.#body.appendChild(document.createElement(`dialog`));
		this.#dialogPrompt.classList.add(`pop-up`, `prompt`, `layer`, `rounded`, `with-padding`, `with-gap`, `flex`, `column`);

		this.#divPromptHeader = this.#dialogPrompt.appendChild(document.createElement(`div`));
		this.#divPromptHeader.classList.add(`header`, `flex`, `centered`);

		this.#h3PromptTitle = this.#divPromptHeader.appendChild(document.createElement(`h3`));
		this.#h3PromptTitle.innerText = `Title`;

		this.#divPromptCoontainer = this.#dialogPrompt.appendChild(document.createElement(`div`));
		this.#divPromptCoontainer.classList.add(`container`);
		this.#divPromptCoontainer.innerText = `Something went wrong. This text wasn't supposed to appear before you. There might be an internal core error.`;

		this.#divPromptFooter = this.#dialogPrompt.appendChild(document.createElement(`div`));
		this.#divPromptFooter.classList.add(`footer`, `flex`, `centered`, `with-gap`);

		this.#buttonPromptAccept = this.#divPromptFooter.appendChild(document.createElement(`button`));
		this.#buttonPromptAccept.classList.add(`layer`, `rounded`, `flex`, `with-padding`, `highlight`);
		this.#buttonPromptAccept.innerText = `Accept`;

		this.#inputPrompt = this.#divPromptFooter.appendChild(document.createElement(`input`));
		this.#inputPrompt.classList.add(`depth`, `rounded`, `flex`, `with-padding`);
		this.#inputPrompt.type = `text`;
		this.#inputPrompt.placeholder = `Enter text...`;
		//#endregion

		Array.from(document.getElementsByTagName(`script`)).at(-1)?.remove();
	}
}();
