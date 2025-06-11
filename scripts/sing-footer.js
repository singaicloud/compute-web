class SingFooter extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const response = await fetch('/components/footer.html');
        const html = await response.text();
        this.innerHTML = html;
    }
}

customElements.define('sing-footer', SingFooter); 