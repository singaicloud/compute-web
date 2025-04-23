import {LitElement, html, css} from '/assets/lit-core.min.js';

export class Navigation extends LitElement {
    static styles = css`
        .menubar {
            display: flex;
            align-items: center;
            justify-content: center;
            color: black;
            z-index: 100;
            position: sticky;
            top: 0;
            backdrop-filter: saturate(180%) blur(20px);
            background-color: rgba(255, 255, 255, 0.95);
            /* border-bottom: 1px solid rgb(243, 244, 246); */
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 8px 10px rgba(0, 0, 0, 0.03);
            padding: 4px 0;
        }
        .menubar .container {
            justify-content: space-between;
        }
        .menubar .logo {
            flex-shrink: 0;
            justify-content: flex-start;
            height: 52px;
        }
        .menubar .logo a {
            border: none;
            display: flex;
            line-height: 1.9;
        }
        .menubar .logo img {
            height: 36px;
        }
        .menubar .items {
            gap: 2rem;
        }
        .menubar .item {
            font-size: 0.95rem;
            font-weight: 400;
        }
        .menubar .item :hover {
            color: var(--brand-color);
            border-bottom: none;
            font-weight: 500;
            text-decoration: underline 0.8px;
            text-underline-offset: 3.5px;
        }
        @media screen and (max-width: 767px){
            .menubar .logo {
                justify-content: center;
                height: 60px;
            }
            .menubar {
                padding-bottom: 1rem;
            }
        }
    `;
    render() {
        const isMainDomain = window.location.hostname === 'my.singaicloud.com';
        return html`
            <link href="scripts/sing-theme.css" rel="stylesheet">
            <div class="menubar">
                <div class="container flex-no-mobile">
                    <div class="logo flex">
                        <a href="/">
                            <img src="https://singaicloud.com/assets/sing-logo.png">
                            ${!isMainDomain ? html`<span style="margin-left: 8px; font-weight: 500;">nova</span>` : ''}
                        </a>
                    </div>
                    <div class="items flex">
                        <div class="item"><a href="/">Jobs</a></div>
                        <div class="item"><a href="storage.html">Storage</a></div>
                        <div class="item"><a href="images.html">Images</a></div>
                        <div class="item"><a href="launch-multi.html">Space</a></div>
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('sing-navigation', Navigation);
