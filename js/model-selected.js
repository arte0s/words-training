'use strict';
global.getWordsSelected = initFn => {

    const LS_WORDS = 'wt-words';
    const WORDS_MIN = 5;
    const WORDS_LIMIT = 10;

    //Private methods
    const save = (d = data) => global.locStorage.save(LS_WORDS, d);
    const get = (d, w) => data.find(k => k.dict === d && k.word === w);
    const create = (d, w) => data.push({ dict: d, word: w, count: 0 });

    const initData = () => {

        Array.prototype.push.apply(data, global.locStorage.load(LS_WORDS));

        if (data.length >= WORDS_LIMIT) return;

        global.utils.safeWhile(() => {

            const key = initFn();

            if (!data.find(w => w.dict === key.dict && w.word === key.word))
                create(key.dict, key.word);

            return data.length < WORDS_LIMIT;
        }, 999);

        save();
    };

    //Public methods
    const setCount = (d, w, c) => {

        const word = get(d, w);
        word.count = c;
        save();
    };

    const add = (d, w) => {

        if (get(d, w)) throw new Error('Word "' + w + '" in dict "' + d + '" is already exist!');
        create(d, w);
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
    const data = [];
    initData();

    return Object.freeze({
        get: () => data.slice(0),
        getNumber: dict => dict ? data.filter(d => d.dict === dict).length : data.length,
        getCount: (d, w) => get(d, w).count,
        isExist: (d, w) => !!get(d, w),
        isCorrect: () => data.length >= WORDS_MIN,
        setCount,
        add,
        remove
    });
};
