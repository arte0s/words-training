'use strict';
global.getDictionaries = (dictData, dState) => {

    let wordsPack,
        currentWord,
        newWord;

    ///////////////////////////////////////////////////////////////
    const getRandomIndex = max => Math.floor(Math.random() * max);

    const getRandomElem = ar => ar[getRandomIndex(ar.length)];

    const getRandomPropName = o => Object.keys(o)[getRandomIndex(Object.keys(o).length)];

    const getRandomWord = () => {

        //Get a random selected dictionary
        let dict;
        global.utils.safeWhile(() => {

            dict = getRandomPropName(dictData);
            return dState.get(dict) === false;

        }, Object.keys(dState.get()).length * 10);

        return Object.freeze({ dict, word: getRandomElem(dictData[dict].get()).w, count: 0 });
    };

    ///////////////////////////////////////////////////////////////
    const getWordByKey = k => dictData[k.dict].get().find(wrd => wrd.w === k.word);

    const getRandomTransl = () => {

        const key = getRandomElem(wordsSelected.get());
        const word = getWordByKey(key);

        return Object.seal({
            dict: key.dict,
            word,
            transl: getRandomElem(word.tl)
        });
    };

    const isTranslExist = (pack, tran) => !!pack.find(w => w.word.tl.find(t => t === tran));

    const getPack = () => {

        wordsPack = [];

        global.utils.safeWhile(() => {

            const data = getRandomTransl();

            if (!isTranslExist(wordsPack, data.transl))
                wordsPack.push(data);

            return wordsPack.length < 4;
        }, 999);

        currentWord = getRandomElem(wordsPack);

        return {
            pack: wordsPack,
            word: {
                w: currentWord.word.w,
                transl: currentWord.word.transl,
                count: wordsSelected.getCount(currentWord.dict, currentWord.word.w)
            }
        };
    };

    ///////////////////////////////////////////////////////////////
    const addCount = count => {

        if (global.utils.isFinished(count)) {

            wordsSelected.remove(currentWord.dict, currentWord.word.w);
            wordsFinished.add(currentWord.dict, currentWord.word.w);
            return true;

        } else
            wordsSelected.setCount(currentWord.dict, currentWord.word.w, count);
    };

    const getNewWord = () => {

        global.utils.safeWhile(() => {

            let key = getRandomWord();

            if (wordsSelected.isExist(key.dict, key.word)
                || wordsFinished.isExist(key.dict, key.word))
                return true;

            newWord = key;
            return false;

        }, wordsSelected.length * 10);

        return getWordByKey(newWord);
    };

    const setNewWord = () => {
        wordsSelected.add(newWord.dict, newWord.word);
        newWord = null;
    };

    const getWordSafe = w => Object.assign({}, w);

    const setSelected = (dict, word, sel) => {

        const wrd = dictData[dict].get().find(w => w.w === word);
        // wrd.count = 0;

        if (sel)
            wordsSelected.add(dict, word);
        else
            wordsSelected.remove(dict, word);

        return createExtWord(wrd, dict);
    };

    const createExtWord = (w, dict) => {

        const wrd = Object.assign({}, w);
        wrd.dict = dict;
        wrd.checked = wordsSelected.isExist(dict, w.w);
        wrd.finished = global.utils.isFinished(w.count);
        return Object.freeze(wrd);
    };

    const get = dName => dictData[dName].get().map(w => createExtWord(w, dName));

    //Initialization
    const wordsSelected = global.getWordsSelected(getRandomWord);
    const wordsFinished = global.getWordsFinished();

    return Object.freeze({
        get,
        getPack,
        getNewWord: () => getWordSafe(getNewWord()),
        getFinished: wordsFinished.getNumber,
        getSelected: wordsSelected.getNumber,
        isFinished: wordsFinished.isExist,
        isSelected: wordsSelected.isExist,
        isWordCorrect: wordsSelected.isCorrect,

        setSelected,
        setNewWord,

        currentWord: Object.freeze({
            get: () => getWordSafe(currentWord.word),
            getIndex: () => wordsPack.findIndex(w => w.word == currentWord.word),
            clearCount: () => wordsSelected.setCount(currentWord.dict, currentWord.word.w, 0),
            addCount,
        })
    });
};