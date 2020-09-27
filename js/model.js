//TODO-1:
//1. Сделать загрузку данных их старого формата
//2. Восстановить функцию очистки результата
//3. Восстановить озвучку в мобильной версии
//4. Если словарь исключён из изучения, необходимо удалить сответствующие слова на изучении 
//   (если после этого слов осталось слишком мало, необходимо добавить новые - случайным образом?)
//5. Когда выучил слово, счетчик обновляется только после выбора нового
//6. После возврата с другого экрана, надо перезапускать игру, т.к. текущее слово м.б. уже не в игре

// DONE:
//1. Добавить обработку слов с несколькими значениями (когда перевод - это массив массивов) 

//TODO-2:
//1. Сделать сохранение пред-го значения генератора сл. чисел (чтобы не повторять слово несколько раз подряд)
//2. Написать плагин для автоматической сборки моибльной версии (gulp-плагин?)

'use strict';
window.global.initModel = async () => Promise.all([
    window.global.loadDictAsync('verbs'),
    window.global.loadDictAsync('pop')
]).then(values => {

    const names = [];
    const data = {};

    values.forEach(({ name, obj }) => {
        names.push(name);
        data[name] = obj;
    });

    Object.freeze(data);
    console.log('[data]', data, '[names]', names);

    const state = window.global.getDictsState(names);

    return {
        settings: window.global.getSettings(),
        dictsState: state,
        dicts: window.global.getDictionaries(data, state)
    };
});