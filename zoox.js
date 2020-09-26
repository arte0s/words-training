/*
MIT License

Copyright (c) 2020 Artem Shmidt
https://arte0s.github.io/zoox/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
'use strict';
const zoox = {
    framework: (() => {

        const createTextProcessor = (html, texts) => {

            const renewInner = (val, id, txt) => {

                let pos;
                while (true) {

                    pos = val.search(id);

                    if (pos >= 0)
                        val = val.substr(0, pos) + txt + val.substr(pos + id.length);
                    else
                        break;
                }

                return val;
            }

            const renewText = (node, initial, tId, text) => { //}, i) => {

                if (text === tId)
                    throw new Error('Template value "' + text + '" and tamplate "' + tId
                        + '"can\'text be the same!');

                const newValue = renewInner(initial, tId, text);

                if (newValue !== initial)
                    node.nodeValue = newValue;

                // console.log('[TEXTS] node: ', node, ' initial: ', initial, ' tId: ', tId, ' text: ', text);
                return newValue;
            };

            const getNodes = (node, arr) => {

                arr.push(node);
                Array.from(node.childNodes).forEach(n => getNodes(n, arr));
                return arr;
            };

            const getTempl = id => '{{' + id + '}}';

            const getLang = () => document.documentElement.getAttribute('lang');

            const renew = (nodes, texts, lang) => nodes.forEach(n => {

                let value = n.initial;
                Object.entries(texts).forEach(t =>
                    value = renewText(n.node, value, getTempl(t[0]), t[1][lang]));
            });

            const getTextNodes = (html, tId) => getNodes(html, [])
                .filter(n => n.nodeType === Node.TEXT_NODE)
                .filter(n => n.textContent.search(tId) !== -1)
                .map(n => ({ node: n, initial: n.nodeValue }));


            //Initialisation
            const nodes = Object.entries(texts)
                .reduce((nodes, text) => nodes.concat(getTextNodes(html, getTempl(text[0]))
                    .filter(nd => !nodes.find(n => n.node === nd.node))), []);

            //console.log('[TEXTS-INIT] nodes: ', nodes, ' texts: ', texts);
            //nodes: [{node, initial}], texts: {id: {en: '...'}}

            renew(nodes, texts, getLang());

            //If lang change
            new MutationObserver(function (mutations) {

                mutations.forEach(function (mutation) {
                    if (mutation.type == "attributes")
                        renew(nodes, texts, getLang());
                });
            }).observe(document.documentElement, { attributes: true });
        };

        //////////////////////////////////////////////////////////////////////
        const parse = html => {

            const parser = new DOMParser();
            const document = parser.parseFromString(html, 'text/html');
            const head = document.head;
            const template = head.querySelector('template');
            const style = head.querySelector('style');
            const script = head.querySelector('script');

            return {
                template,
                style,
                script
            };
        };

        const getSettings = name => ({ template, style, script }) => {

            const res = {
                module: null,
                template,
                style
            };

            if (script) {

                const jsBlob = new Blob(
                    ['\t//This is code of tag "' + name + '"\n' + script.textContent],
                    { type: 'application/javascript' });

                const jsURL = URL.createObjectURL(jsBlob);

                return import(jsURL).then(module => {
                    res.module = module.default;
                    return res;
                });

            } else
                return res;
        };

        const createElement = ({ template, style, module }, name) => {

            class UnityComponent extends HTMLElement {

                constructor() {
                    super();
                    this.logic = module && module.create ? module.create(this) : {};
                    this.nodes = null;
                }

                connectedCallback() {

                    const shadow = this.attachShadow({ mode: 'open' });

                    if (style)
                        shadow.appendChild(style.cloneNode(true));

                    if (template) {

                        const copy = document.importNode(template.content, true);

                        if (module && module.texts)
                            createTextProcessor(copy, module.texts);

                        shadow.appendChild(copy);
                    }

                    if (this.logic.listeners)
                        Object.entries(this.logic.listeners).forEach(([event, listener]) => {
                            this.addEventListener(event, listener);
                        });

                    if (this.logic.connectedCallback)
                        this.logic.connectedCallback();
                }

                static get observedAttributes() {
                    return module && module.observedAttributes
                        ? module.observedAttributes() : [];
                }

                attributeChangedCallback(name, oldValue, newValue) {

                    if (this.logic.attributeChangedCallback)
                        this.logic.attributeChangedCallback(name, oldValue, newValue);
                }
            }

            customElements.define(name, UnityComponent);

            return template ? template.content : null;
        };

        let path;

        const convert = name => name.split('-').slice(1).join('/');

        const loadElement = tag => fetch(path + convert(tag) + '.html')
            .then(resp => resp.text())
            .then(parse)
            .then(getSettings(tag))
            .then(obj => createElement(obj, tag))
            .then(content => content ? loadAll(content) : null);

        //For lazy load must be global (customElements.get() doesn't fit because it's async)
        const customTags = [];

        const isElemExist = tag => {

            if (customTags.indexOf(tag) === -1) {
                customTags.push(tag);
                return true;
            }
        };

        const loadContent = rootEl => Array.from(rootEl.querySelectorAll('*'))
            .map(e => e.tagName.toLowerCase())
            .filter((tag, ind, src) => src.indexOf(tag) === ind)
            .filter(tag => tag.slice(0, 2) === 'z-')
            .filter(tag => isElemExist(tag))
            .map(tag => loadElement(tag));

        const loadAll = rootEl => Promise.all(loadContent(rootEl));

        return Object.freeze({
            init: (p, onInitFn) => {

                path = p;
                return window.addEventListener('load', () => loadAll(document.body, []).then(onInitFn))
            },
            load: tag => {

                if (isElemExist(tag))
                    return loadElement(tag);
            }
        });
    })(),
    //Static methods
    utils: Object.freeze({
        setSlotText: (parent, name, tag, text) => {

            let tagEl = parent.querySelector(tag + '[slot="' + name + '"]');

            if (tagEl)
                tagEl.innerHTML = '';
            else
                tagEl = document.createElement(tag);

            tagEl.textContent = text;
            tagEl.setAttribute('slot', name);
            parent.appendChild(tagEl);
        }
    })
};