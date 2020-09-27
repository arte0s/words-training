'use strict';
global.getDictsState = (init) => {

    const LS_NAME = 'wt-dicts';

    const save = (d = data) => global.locStorage.save(LS_NAME, d);

    const initData = () => {

        const obj = {};
        const old = global.locStorage.load('state'); //{"verbs":false,"pop":true}

        if (old)
            Object.keys(old).forEach((d, i) => obj[d] = Object.seal({ selected: old[d] }));
        else
            init.forEach((d, i) => obj[d] = Object.seal({ selected: i === 0 }));

        save(obj);
        return Object.freeze(obj);
    };

    const data = global.locStorage.load(LS_NAME) || initData();

    return Object.freeze({
        get: d => d ? data[d].selected : Object.assign({}, data),
        set: (d, s) => {
            data[d].selected = s;
            save();
        }
    });
};
