import htmx from 'htmx.org';

class HtmxWebComponent extends HTMLElement{
	constructor(){
		super();
		const shadow = this.attachShadow({ mode: "open" });
		const main = document.createElement('div');
		main.textContent = 'So lets build something better.';
		main.setAttribute('hx-post', '/click');
		main.setAttribute('hx-trigger', 'click');
		shadow.appendChild(main);
		htmx.process(main);
	}

	connectedCallback(){
		console.log('connected');
		// htmx.process(this.shadowRoot.firstChild);
	}
}

customElements.define('wc-htmx-base', HtmxWebComponent);

