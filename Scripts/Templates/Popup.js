"use strict";

void async function () {
	const body = document.body;
	{
		const dialogPopUp = body.appendChild(document.createElement(`dialog`));
		dialogPopUp.classList.add(`pop-up`, `alert`, `layer`, `rounded`, `with-padding`, `with-gap`, `flex`, `column`);
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
			divCoontainer.innerText = `Something went wrong. This text wasn't supposed to appear before you. There might be an internal core error.`;
			{ }
		}
	}
	{
		const dialogPopUp = body.appendChild(document.createElement(`dialog`));
		dialogPopUp.classList.add(`pop-up`, `confirm`, `layer`, `rounded`, `with-padding`, `with-gap`, `flex`, `column`);
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
			divCoontainer.innerText = `Something went wrong. This text wasn't supposed to appear before you. There might be an internal core error.`;
			{ }
			const divFooter = dialogPopUp.appendChild(document.createElement(`div`));
			divFooter.classList.add(`footer`, `flex`, `centered`, `with-gap`);
			{
				const buttonAccept = divFooter.appendChild(document.createElement(`button`));
				buttonAccept.classList.add(`layer`, `rounded`, `flex`, `with-padding`, `highlight`);
				buttonAccept.innerText = `Accept`;
				{ }
				const buttonDecline = divFooter.appendChild(document.createElement(`button`));
				buttonDecline.classList.add(`layer`, `rounded`, `flex`, `with-padding`, `invalid`);
				buttonDecline.innerText = `Decline`;
				{ }
			}
		}
	}
	{
		const dialogPopUp = body.appendChild(document.createElement(`dialog`));
		dialogPopUp.classList.add(`pop-up`, `prompt`, `layer`, `rounded`, `with-padding`, `with-gap`, `flex`, `column`);
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
			divCoontainer.innerText = `Something went wrong. This text wasn't supposed to appear before you. There might be an internal core error.`;
			{ }
			const divFooter = dialogPopUp.appendChild(document.createElement(`div`));
			divFooter.classList.add(`footer`, `flex`, `centered`, `with-gap`);
			{
				const buttonAccept = divFooter.appendChild(document.createElement(`button`));
				buttonAccept.classList.add(`layer`, `rounded`, `flex`, `with-padding`, `highlight`);
				buttonAccept.innerText = `Accept`;
				{ }
				const inputPrompt = divFooter.appendChild(document.createElement(`input`));
				inputPrompt.classList.add(`depth`, `rounded`, `flex`, `with-padding`);
				inputPrompt.type = `text`;
				inputPrompt.placeholder = `Enter text...`;
				{ }
			}
		}
	}
	Array.from(document.getElementsByTagName(`script`)).at(-1)?.remove();
}();