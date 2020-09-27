'use strict';
global.initMain = (() => {

    const setTitle = (model, navbar) => {

        //TODO: Сделать перевод zoox.getText(id)...
        const fin = model.dicts.getFinished();
        const nbTitle = 'Изучено ' + fin + ' ' + global.utils.getWordText(fin);

        // navbar.innerHTML = '';
        window.zoox.utils.setSlotText(navbar, 'title', 'span', nbTitle);
    };

    let studyFinish;

    const btnHandler = (model, mark, navbar, btns, n) => {

        // if (!zxMark.stop()) return;

        console.log('[EVENT] answer');

        const c = model.dicts.currentWord.getIndex();
        if (c === n) {

            mark.setAttribute('ok', '');
            btns[c].setAttribute('correct', '');

            studyFinish = model.dicts.currentWord.addCount(parseInt(mark.getAttribute('count-to')));

            if (studyFinish) {

                //TODO: Add new word...
                setTitle(model, navbar);
            }

        } else {

            mark.setAttribute('error', '');
            model.dicts.currentWord.clearCount();
            btns[c].setAttribute('error', '');
        }

        // zxMark.setResult(model.getWord().count);
    };

    //--------------------------------------------------------
    // Fill add modal
    //--------------------------------------------------------
    const fillModal = (word, modal) => {

        // modal.innerHTML = '';
        window.zoox.utils.setSlotText(modal, 'word', 'span', word.w);
        window.zoox.utils.setSlotText(modal, 'transl', 'span', word.tl.join(', '));
        modal.style.display = '';
    }

    //--------------------------------------------------------
    // Count end handler
    //--------------------------------------------------------
    const counterEndHandler = (model, mark, transl, add) => {

        if (mark.hasAttribute('ok'))

            if (studyFinish) {

                studyFinish = false;
                fillModal(model.dicts.getNewWord(), add);

            } else
                mark.setAttribute('finish', '');
        else
            fillModal(model.dicts.currentWord.get(), transl);
    };

    //--------------------------------------------------------
    // Init answer buttons
    //--------------------------------------------------------
    const initButtons = (model, pgMain, navbar, mark) => {

        const btns = [];
        for (let i = 0; i < 4; i++)
            btns.push(pgMain.getElementById('btn' + i));

        btns.forEach((b, i) => b.addEventListener('click',
            () => btnHandler(model, mark, navbar, btns, i)));

        return btns;
    };

    //--------------------------------------------------------
    // Start learn new word
    //--------------------------------------------------------
    const start = (model, mark, btns, spk) => {

        const pack = model.dicts.getPack();

        if (spk && model.settings.get().sound)
            spk.setAttribute('text', pack.word.w);

        for (let i = 0; i < 4; i++) {

            btns[i].removeAttribute('correct');
            btns[i].removeAttribute('error');
            btns[i].textContent = pack.pack[i].transl;
        }

        console.log('[mark]', mark);
        mark.textContent = pack.word.w;
        mark.setAttribute('count', pack.word.count);
    };

    //--------------------------------------------------------
    // Init menu
    //--------------------------------------------------------
    const initMenu = (model, pgMain, pgAbout, menu, mark, btns, spk) => {

        const sett = model.settings.get();

        if (sett.sound)
            menu.shadowRoot.getElementById('tglSound').setAttribute('checked', 'checked');

        if (sett.colLight) {

            // btnColors.children[0].setAttribute('type', 'sun');
            document.body.classList.add('colors-light');

        } else {

            // btnColors.children[0].setAttribute('type', 'moon');
            document.body.classList.add('colors-dark');
        }

        const langs = {
            ru: () => { },
            en: () => { }
        }

        langs[sett.lang]();

        let init = false;
        menu.addEventListener('modalClose', e => {

            if (!init) {

                init = true;
                start(model, mark, btns, spk);
                mark.setAttribute('start', '');
            }

            mark.removeAttribute('pause');

            e.stopPropagation();
            menu.style.display = 'none';
        });

        menu.shadowRoot.getElementById('btnAbout').addEventListener('click', e => {

            e.stopPropagation();
            pgMain.style.display = 'none';
            pgAbout.style.display = '';
        });

        menu.addEventListener('soundBtnClick', e => {

            e.stopPropagation();

            model.settings.setSound(!model.settings.get().sound);
            console.log('[SOUND]', model.settings.get().sound);
        });
    };

    //--------------------------------------------------------
    //      Init mark
    //--------------------------------------------------------
    const initMark = (model, mark, btns, transl, add, spk) => {

        mark.addEventListener('counterEnd', () => counterEndHandler(model, mark, transl, add));

        mark.addEventListener('falldownEnd', () => {

            const c = model.dicts.currentWord.getIndex();
            btns[c].setAttribute('error', '');
        });

        mark.addEventListener('finish', () => {

            start(model, mark, btns, spk);
            mark.setAttribute('start', '');
        });
    };

    //--------------------------------------------------------
    //      Init add
    //--------------------------------------------------------
    const initAdd = (model, mark, add) => {

        add.shadowRoot.getElementById('learn').addEventListener('click', e => {

            e.stopPropagation();
            model.dicts.setNewWord();
            add.style.display = 'none';
            mark.setAttribute('finish', '');
        });

        add.shadowRoot.getElementById('skip').addEventListener('click', e => {

            e.stopPropagation();
            fillModal(model.dicts.getNewWord(), add);
        });
    };

    //--------------------------------------------------------
    //      Init
    //--------------------------------------------------------
    const init = model => {

        const srApp = document.body.children[1].shadowRoot;
        const pgMain = srApp.getElementById('main');
        const spk = srApp.getElementById('speaker');
        const srMain = pgMain.shadowRoot;

        const menu = srMain.children[1];
        const add = srMain.children[2];
        const transl = srMain.children[3];
        const error = srMain.children[4];

        const navbar = srMain.getElementById('navbar');
        const mark = srMain.getElementById('mark');
        const btns = initButtons(model, pgMain.shadowRoot, navbar, mark);

        initMenu(model, pgMain, srApp.getElementById('about'), menu, mark, btns, spk);
        initMark(model, mark, btns, transl, add, spk);
        initAdd(model, mark, add);

        transl.addEventListener('modalClose', e => {

            e.stopPropagation();
            transl.style.display = 'none';
            mark.setAttribute('finish', '');
        });

        error.addEventListener('modalClose', e => {

            e.stopPropagation();
            error.style.display = 'none';
        });

        window.addEventListener('resize', e => {

            if (mark.hasAttribute('pause')) return;
            mark.setAttribute('pause', '');
            menu.style.display = '';
        });

        document.getElementById('loader').style.display = 'none';
        document.getElementById('app').style.display = '';
        setTitle(model, navbar);
        start(model, mark, btns);
    };

    return init;
})();