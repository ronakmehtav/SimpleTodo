const containerSelectorString = '#toDos__container';
const container = document.querySelector(containerSelectorString);
const todoListCounter = initializeCounter();
const Content = new Set();

if (localStorage.getItem('todoContent')) {
    const data = JSON.parse(localStorage.getItem('todoContent'));
    if (data.data.length) {
        data.data.forEach(item => Content.add(item));
    }
}

addGlobalEventListner('keydown', '#todo__input', addTodo);

addGlobalEventListner('click', '.removeTodoBtn', removeTodo);

addGlobalEventListner('click', '#clear', () => {
    Content.clear();
    localStorage.clear();
    container.innerHTML = '';
});

addGlobalEventListner('dragstart', '.todo__ListItem', e => {
    e.target.classList.add('dragging');
});

addGlobalEventListner('dragend', '.todo__ListItem', e => {
    e.target.classList.remove('dragging');
});

container.addEventListener('dragover', e => {
    e.preventDefault()
    console.log('running');
    const afterElement = getDragAfterElement(container, e.clientY);
    const draggedElm = document.querySelector('.dragging');

    if (afterElement == null) {
        container.appendChild(draggedElm);
    } else {
        container.insertBefore(draggedElm, afterElement);
    }
});

container.append(
    ...Array.from(Content).map(item => {
        return createTodoListItem('li', {
            class: ['todo__ListItem'],
            text: item,
            id: `todo__listItem-${todoListCounter()}`,
            draggable: 'true',
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

function getDragAfterElement(container,y) {
    const draggableElements = [...container.querySelectorAll('.todo__ListItem:not(.dragging)')];

    return draggableElements.reduce((closet, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closet.offset) {
            return { offset: offset, element: child };
        } else {
            return closet;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element
}

function createTodoListItem(selector, options) {
    const { text, ...optionValues } = options;
    const parent = createElement(selector, optionValues);
    const span = createElement('span', { text: text, id: `${optionValues.id}_span` });
    const removeButton = createElement('button', { class: ['removeTodoBtn'], text: 'remove', id: `${optionValues.id}_button` });
    parent.append(span, removeButton);
    return parent;
}

function setStorage() {
    return localStorage.setItem('todoContent', JSON.stringify({ data: Array.from(Content) }));
}

function addTodo(event) {
    if (event.key === 'Enter' && event.target.value !== '' && !Content.has(event.target.value)) {
        const textContent = event.target.value;
        event.target.value = '';
        Content.add(textContent);
        setStorage();
        const listItem = createTodoListItem('li', {
            class: ['todo__ListItem'],
            text: textContent,
            id: `todo__listItem-${todoListCounter()}`,
            draggable: 'true',
        });
        container.append(listItem);
    }
}

function removeTodo(event) {
    Content.delete(event.target.parentNode.children[0].textContent);
    setStorage();
    event.target.parentNode.remove();
}
