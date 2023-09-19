"use strict";

//#region Console
{
	const dialogConsole = document.body.appendChild(document.createElement(`dialog`));
	dialogConsole.classList.add(`console`, `layer`, `rounded`, `in-top`, `in-right`, `with-padding`, `with-vertical-gap`);
	{ }
}
//#endregion
//#region Pop-up
{
	const dialogPopUp = document.body.appendChild(document.createElement(`dialog`));
	dialogPopUp.classList.add(`pop-up`, `layer`, `rounded`, `with-padding`, `with-gap`, `flex`, `column`);
	{
		const divHeader = dialogPopUp.appendChild(document.createElement(`div`));
		divHeader.classList.add(`header`, `flex`, `centered`);
		{
			const h3Title = divHeader.appendChild(document.createElement(`h3`));
			h3Title.innerText = `Title`;
			{ }
		}
		const divCoontainer = dialogPopUp.appendChild(document.createElement(`div`));
		divCoontainer.classList.add(`container`);
		divCoontainer.innerText = `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis dolorum aliquid deserunt enim ab quas fugiat adipisci. Repellendus, sapiente hic perspiciatis atque quod iure, debitis eius in neque dolor exercitationem!`;
		{ }
		const divFooter = dialogPopUp.appendChild(document.createElement(`div`));
		divFooter.classList.add(`footer`, `flex`, `centered`, `with-gap`);
		{
			const buttonPrototype = divFooter.appendChild(document.createElement(`button`));
			buttonPrototype.classList.add(`layer`, `rounded`, `flex`, `with-padding`);
			buttonPrototype.innerText = `Button`;
			{ }
			const inputPrototype = divFooter.appendChild(document.createElement(`input`));
			inputPrototype.classList.add(`depth`, `rounded`, `flex`, `with-padding`);
			inputPrototype.type = `text`;
			inputPrototype.placeholder = `Enter text...`;
			{ }
		}
	}
}
//#endregion
//#region Loader
{
	const dialogLoader = document.body.appendChild(document.createElement(`dialog`));
	dialogLoader.classList.add(`loader`, `layer`, `rounded`, `with-padding`, `large-padding`, `flex`, `primary-centered`);
	{
		const divContainer = dialogLoader.appendChild(document.createElement(`div`));
		divContainer.classList.add(`flex`, `column`, `primary-centered`, `with-gap`, `with-padding`);
		{
			const imgLogo = divContainer.appendChild(document.createElement(`img`));
			imgLogo.src = `../resources/Circuit (Transparent).gif`;
			imgLogo.alt = `Logo`;
		}
	}
}
//#endregion