import loadComponents from 'gia/loadComponents';
import removeComponents from 'gia/removeComponents';
import config from 'gia/config';

const store = {};

export function send(element) {
    if (element.tagName.toLocaleLowerCase() === "form") {
        return submit(element);
    } else if(element.tagName.toLocaleLowerCase() === "a") {
        return click(element);
    } else {
        console.warn('Element is not tag "a" or "form"');
    }
}

export function request(options) {
    return new Promise((resolve, reject) => {
        let defaults = {
            url: window.location.pathname + window.location.search,
            method: "GET",
            data: null
        };

        let data = {
            ...defaults,
            ...options
        };

        let request = new XMLHttpRequest();

        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if (request.status !== 500) {
                    try {
                        let json = JSON.parse(request.responseText);
                        resolve({
                            response: json,
                            request: request,
                        });
                    } catch(error) {
                        resolve({
                            response: request.responseText,
                            request: request,
                        });
                    }
                } else {
                    reject(request);
                }
            }
        }

        request.open(data.method, data.url, true);
        request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        request.send(data.data);
    });
}

export function click(element) {
    element.classList.add('is-loading');

    const connection = request({
        url: element.href
    });
    connection.then(({response, request}) => {
        element.classList.remove('is-loading');
        if (typeof response === 'object') {
            processResponse(response);
        }
    }).catch(error => {
        console.warn(error);
    });
    return connection;
}

export function submit(element) {
    if (queryAll('.has-error', element).length) {
        console.warn('Form not valid.');
        return;
    }

    element.classList.add('is-loading');

    // submitted
    let form = element;
    let formData = new FormData(form);

    // send data
    const connection = request({
        url: form.action,
        method: form.method,
        data: formData,
    });
    connection.then(({response, request}) => {
        element.classList.remove('is-loading');
        if (typeof response === 'object') {
            processResponse(response);
        }
    }).catch(error => {
        console.warn(error);
    });
    return connection;
}

function processResponse(response) {
    if (response.snippets) {
        replaceSnippets(response.snippets);
    }
    if (response.url) {
        window.history.replaceState({
                url: response.url,
                random: Math.random(),
                source: "swup",
            },
            document.title,
            response.url,
        );
    }
}

export function replaceSnippets(snippets) {
    Object.keys(snippets).forEach(snippetName => {
        replaceSnippet(snippets[snippetName], snippetName);
    });
}

export function replaceSnippet(newContent, snippetName) {
    const element = document.getElementById(snippetName);
    const customSnippet = element['__nette_snippet__'];

    if (customSnippet) {
        customSnippet._replaceContent();
    } else {
        removeComponents(element);

        if (element.hasAttribute("data-ajax-append")) {
            element.innerHTML = element.innerHTML + newContent;
        } else if (element.hasAttribute("data-ajax-prepend")) {
            element.innerHTML = newContent + element.innerHTML;
        } else if (element.innerHTML !== newContent) {
            element.innerHTML = newContent;
        }

        loadComponents(store.components, element);

        if (config._options.log) {
            console.info(`Updated snippet '${ snippetName }'`);
        }
    }
}

export class Snippet {
    constructor(element) {
        this.element = element;
        this.element['__nette_snippet__'] = this;
    }

    _replaceContent({ element, newContent, snippetName }) {
        removeComponents(element);
        this.update({ element, newContent, snippetName });
        loadComponents(element);
    }

    update({ element, newContent, snippetName }) {
        removeComponents(element);

        if (element.hasAttribute("data-ajax-append")) {
            element.innerHTML = element.innerHTML + newContent;
        } else if (element.hasAttribute("data-ajax-prepend")) {
            element.innerHTML = newContent + element.innerHTML;
        } else if (element.innerHTML !== newContent) {
            element.innerHTML = newContent;
        }

        loadComponents(store.components, element);

        if (config._options.log) {
            console.info(`Updated snippet '${ snippetName }'`);
        }
    }
}

export function setComponents(components) {
    store.components = components;
}

function queryAll(selector, context = document) {
    if (typeof selector !== 'string') {
        return selector;
    }

    return Array.prototype.slice.call(context.querySelectorAll(selector));
}

export default {
    send: send,
    request: request,
    handleClick: click,
    handleSubmit: submit,
    replaceSnippets: replaceSnippets,
    replaceSnippet: replaceSnippet,
    setComponents: setComponents,
    Snippet: Snippet,
}