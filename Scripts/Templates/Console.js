"use strict";

void async function () {
	const body = document.body;
	{
		const dialogConsole = body.appendChild(document.createElement(`dialog`));
		dialogConsole.classList.add(`console`, `layer`, `rounded`, `in-top`, `in-right`, `with-padding`, `with-vertical-gap`);
		{ }
	}

	Array.from(document.getElementsByTagName(`script`)).at(-1)?.remove();
}();