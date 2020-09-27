'use strict';
global.getSettings = () => {

    const LS_NAME = 'wt-settings';

    const data = (() => {

        let s = global.locStorage.load(LS_NAME);

        return s || Object.seal({
            sound: true,
            lang: 'ru',
            colLight: true
        });
    })();

    const save = () => global.locStorage.save(LS_NAME, data);

    return Object.freeze({
        get: () => Object.assign({}, data),
        setSound: s => { data.sound = s; save(); },
        setLang: s => { data.lang = s; save(); },
        setColors: s => { data.colLight = s; save(); }
    });
};
