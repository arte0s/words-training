'use strict';
window.global.loadDictAsync = async name => {

    const loadOldData = () => {

        const LS_OLD = 'dict_' + name;
        const oldData = window.global.locStorage.load(LS_OLD);

        if (!oldData) return;

        const data = oldData.map(item => Object.seal({
            w: item.word,
            tl: item.transl
        }));

        return data;
    };

    const accumWords = (acc, [key, value]) => {

        acc.push(Object.seal({
            w: key,
            tl: value.tl.reduce((a, c) => Array.isArray(c)
                ? a.concat(c)
                : (() => {
                    a.push(c);
                    return a;
                })(), [])
        }));

        return acc;
    };

    const loadData = async () => {

        const response = await fetch('/data/' + name + '.json');

        if (!response.ok)
            throw new Error("Ошибка HTTP: " + response.status);

        words = Object.entries(await response.json()).reduce(accumWords, []);

        return words;
    };

    //Initialization
    let words = loadOldData();

    if (!words)
        words = await loadData();

    return Object.freeze({
        name,
        obj: Object.freeze({ get: () => words.slice(0) }),
    });
};