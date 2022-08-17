const containerSelectorString = '#toDos__container';
const todoListCounter = initializeCounter();
const Content = new Set();

if (localStorage.getItem('todoContent')) {
    const data = JSON.parse(localStorage.getItem('todoContent'));
    if (data.data.length) {
        data.data.forEach(item => Content.add(item));
    }
}

document.querySelector(containerSelectorString).append(
    ...Array.from(Content).map(item => {
        return createElement('li', {
            class: ['todo__ListItem'],
            text: item,
            id: `todo__listItem-${todoListCounter()}`,
        });
    })
)


/**
 *  Global Eventlistner
 * @param {Event} type Events which can occur on a element.
 * @param {String} selector Selector String to match the element.
 * @param {Function} callback The Function will receive Event.
 * @param {object=}  options Same Object for the normal eventlistener.
 * @param {Element=document} parent Element you want to attach the event.
 */
function addGlobalEventListner(
    type,
    selector,
    callback,
    options,
    parent = document
) {
    parent.addEventListener(
        type,
        (e) => {
            if (e.target.matches(selector)) callback(e);
        },
        options
    );
}

/**
 * To create a Html element.
 * @param {Element Type} type The Type of element you want to create.
 * @param {Object} [options]  The class,dataset,id,etc you want to add the element.
 * @returns
 */
function createElement(type, options = {}) {
    const element = document.createElement(type);
    Object.entries(options).forEach(([key, value]) => {
        key = key.toLocaleLowerCase();
        if (key === 'class' || key === 'classname') {
            value.forEach((value) => element.classList.add(value));
            return;
        }
        if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
            return;
        }
        if (key === 'text') {
            element.textContent = value;
            return;
        }

        element.setAttribute(key, value);
    });
    return element;
}

/**
 * create a counter function
 * @param {Boolean=} indexFlag toggle it to true to change the index to start from 1.
 * @returns counter function which produces values index from 0.
 */
function initializeCounter(indexFlag) {
    let count = 0;
    return function counter() {
        return indexFlag ? ++count : count++;
    };
}

addGlobalEventListner('keydown', '#todo__input', addTodo);
addGlobalEventListner('click', '.todo__ListItem', removeTodo);
addGlobalEventListner('click', '#clear', () => {
    Content.clear();
    setStorage();
    document.querySelector(containerSelectorString).innerHTML = '';
})

function setStorage() {
    return localStorage.setItem('todoContent', JSON.stringify({ data: Array.from(Content) }));
}

function addTodo(event) {
    if (event.key === 'Enter' && event.target.value !== '' && !Content.has(event.target.value)) {
        const textContent = event.target.value;
        event.target.value = '';
        Content.add(textContent);
        setStorage();
        const listItem = createElement('li', {
            class: ['todo__ListItem'],
            text: textContent,
            id: `todo__listItem-${todoListCounter()}`,
        });
        document.querySelector(containerSelectorString).append(listItem);
    }
}

function removeTodo(event) {
    Content.delete(event.target.textContent);
    setStorage();
    event.target.remove();
}
