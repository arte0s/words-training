'use strict';
window.global.initSett = (model, cDict) => {

    const elApp = document.body.children[1].shadowRoot;
    const settPage = elApp.getElementById('sett');
    const srPage = settPage.shadowRoot;
    const dictPage = elApp.getElementById('dict');

    const btnColors = srPage.getElementById('btnColors');
    const cbVerbs = srPage.getElementById('verbsChk');
    const cbPop = srPage.getElementById('popChk');

    const state = model.dictsState.get();

    if (state.verbs.selected)
        cbVerbs.setAttribute('checked', 'checked');

    if (state.pop.selected)
        cbPop.setAttribute('checked', 'checked');

    // window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {

    //     //TODO: Save to local storage!
    //     if (!srPage.getElementById('cbAuto').hasAttribute('checked', 'checked')) return;

    //     e.stopPropagation();
    //     const cl = document.body.classList;

    //     if (e.matches) {

    //         cl.remove('colors-light');
    //         cl.add('colors-dark');

    //     } else {

    //         cl.remove('colors-dark');
    //         cl.add('colors-light');
    //     }

    //     console.log(`Dark mode is ${e.matches ? '🌙 on' : '☀️ off'}.`);
    // });

    btnColors.addEventListener('click', e => {

        console.log('[COLORS]');

        e.stopPropagation();
        const cl = document.body.classList;

        if (cl.contains('colors-light')) {

            cl.remove('colors-light');
            cl.add('colors-dark');
            btnColors.children[0].setAttribute('type', 'moon');
            model.settings.setColors(false);

        } else {

            cl.remove('colors-dark');
            cl.add('colors-light');
            btnColors.children[0].setAttribute('type', 'sun');
            model.settings.setColors(true);
        }
    });

    srPage.getElementById('verbBtn').addEventListener('click', e => {

        e.stopPropagation();
        cDict.listInit('verbs', 10);

        settPage.style.display = 'none';
        dictPage.style.display = '';
    });

    srPage.getElementById('popBtn').addEventListener('click', e => {

        e.stopPropagation();
        cDict.listInit('pop', 25);

        settPage.style.display = 'none';
        dictPage.style.display = '';
    });

    cbVerbs.addEventListener('cbClick', e => {

        e.stopPropagation();
        model.dictsState.set('verbs', !model.dictsState.get().verbs.selected);
    });

    cbPop.addEventListener('cbClick', e => {

        e.stopPropagation();
        model.dictsState.set('pop', !model.dictsState.get().pop.selected);
    });
}
