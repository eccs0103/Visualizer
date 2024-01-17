"use strict";

void async function () {
	const body = document.body;
	{
		const dialogLoader = body.appendChild(document.createElement(`dialog`));
		dialogLoader.classList.add(`loader`, `layer`, `rounded`, `with-padding`, `large-padding`, `flex`, `primary-centered`);
		{
			const divContainer = dialogLoader.appendChild(document.createElement(`div`));
			divContainer.classList.add(`flex`, `column`, `primary-centered`, `with-gap`, `with-padding`);
			{
				const imgLogo = divContainer.appendChild(document.createElement(`img`));
				imgLogo.src = `../Resources/Circuit (Transparent).gif`;
				imgLogo.alt = `Logo`;
				{ }
			}
		}
	}

	Array.from(document.getElementsByTagName(`script`)).at(-1)?.remove();
}();
