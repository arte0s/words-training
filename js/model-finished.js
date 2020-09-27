'use strict';
global.getWordsFinished = () => {

    const LS_WORDS = 'wt-finish';
    const save = (d = data) => global.locStorage.save(LS_WORDS, d);
    const get = (d, w) => data.find(k => k.dict === d && k.word === w);

    //Public methods
    const add = (d, w) => {

        if (get(d, w)) throw new Error('Word ' + d + ' ' + w + ' is already exist!');
        data.push(Object.freeze({ dict: d, word: w }));
        save();
    };

    const remove = (d, w) => {

        const i = data.findIndex(dt => dt.dict === d && dt.word === w);

        if (i > -1)
            data.splice(i, 1);
        else
            throw new Error('Word ' + d + ' ' + w + ' is not  exist!');

        save();
    };

    //Initialization
    const data = global.locStorage.load(LS_WORDS) || [];

    return Object.freeze({
        get: () => data.slice(0),
        getNumber: dict => dict ? data.filter(d => d.dict === dict).length : data.length,
        isExist: (d, w) => !!get(d, w),
        add,
        remove
    });
};
