'use strict';

//Utils
window.global.utils = Object.freeze({
    safeWhile: (fn, count) => {

        let i = count;
        while (fn() === true)
            if (i-- <= 0) throw new Error('Dead loop!');
    },
    isFinished: count => {

        // if (count >= 150) debugger;
        return count >= 150;
    },
    getWordText: n => n === 1 ? ' слово' : n > 0 && n < 5 ? ' слова' : ' слов',
});

//Local storage
window.global.locStorage = Object.freeze({
    save: (n, o) => window.localStorage.setItem(n, JSON.stringify(o)),
    load: n => JSON.parse(window.localStorage.getItem(n))
});

// const getParent = node => node != null
//     ? node.nodeType == 11 ? getScrollParent(node.host)
//         : getParent(node.parentNode)
//     : null;