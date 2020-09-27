'use strict';
window.global.initDict = model => {

    let content = [], dict;

    const elApp = document.body.children[1];
    const elDict = elApp.shadowRoot.getElementById('dict');
    const elNavbar = elDict.shadowRoot.getElementById('navbar');
    const elList = elDict.shadowRoot.getElementById('list');

    const createTitle = () => {

        const num = model.dicts.getFinished(dict) + model.dicts.getSelected(dict);
        const text = 'Выбрано ' + num + window.global.utils.getWordText(num);
        window.zoox.utils.setSlotText(elNavbar, 'title', 'span', text);
    };

    const clickHandler = (dict, word, detail) => {

        // console.log('[liClick]', word, detail);
        model.dicts.setSelected(dict, word, detail);
        createTitle();
    };

    const createListItem = (word, ind, pos) => {

        const li = document.createElement('z-listitem');

        if (model.dicts.isFinished(dict, word.w))
            li.setAttribute('data-finished', '');

        if (model.dicts.isSelected(dict, word.w))
            li.setAttribute('data-selected', '');

        li.addEventListener('liClick', e => clickHandler(dict, word.w, e.detail));

        window.zoox.utils.setSlotText(li, 'number', 'span', ind + 1);
        window.zoox.utils.setSlotText(li, 'word', 'span', word.w);
        window.zoox.utils.setSlotText(li, 'translate', 'span', word.tl.join(', '));
        elList.insertBefore(li, elList.children[pos]);
    };

    const load = ({ crFr, crTo, up }) => {

        for (let i = crFr; i <= crTo; i++)
            createListItem(content[i], i, up ? i : null);

        if (up)
            elList.setAttribute('data-scroll', '');
    };

    const listInit = (name, size = 10) => {

        elList.innerHTML = '';
        content = model.dicts.get(name);
        dict = name;

        createTitle();

        elList.setAttribute('data-max', content.length - 1);
        elList.setAttribute('data-part', size);
        elList.setAttribute('data-init', '');
    };

    //Initialization
    elList.addEventListener('listScroll', e => load(e.detail));
    
    elList.addEventListener('speak', e => {

        const spk = document.body.children[1].shadowRoot.getElementById('speaker');
        spk.setAttribute('text', e.detail);
    });

    return Object.freeze({
        listInit
    })
}