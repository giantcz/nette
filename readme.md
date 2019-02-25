# Nette helpers

## Prerequisites
Include `setComponents` function to define components for replaced snippets.
```javascript
import { setComponents } from '@giantcz/nette';
setComponents(components);
``` 

## Functions
### `request`
Sends request and automatically processes the response. 

In a JSON response:
* `snippets` get replaced and [Gia components](https://github.com/giantcz/gia#component) within are initialized 
* `url` gets replaced in the URL bar with [replaceState](https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_replaceState()_method)
* `redirect`, when set, redirects page to this URL (hard reload) 

Accepts options object with defaults:
```javascript
const options = {
    url: window.location.pathname + window.location.search,
    method: "GET",
    data: null
}
request(options);
```

Function returns Promise of the request that can be further used for processing.
```javascript
request(options)
    .then(({response, request}) => {
        console.log(response);
        console.log(request);
    })
    .catch(request => {
        console.error(request);
    });
```

### `send`
Accepts element (`a` or `form`) and makes Ajax request.  
For `a`, request is made to the URL defined in `href` attribute. 
For `form`, request is with a form submission. 
In case any `form` includes any element with class `has-error`, the sending is cancelled.

Function also returns Promise of the request.

### `replaceSnippet`
Replaces the content of HTML snippets and initializes [Gia components](https://github.com/giantcz/gia#component) within.

Accepts:
* `newContent` - string of new content
* `snippetName` - snippet name (`id` attribute)

Example: 
```javascript
replaceSnippet('<div>Content</div>', 'snippet--paginator');
```

### `replaceSnippets`
Accepts object and runs [replaceSnippet](#replaceSnippet) for every record. 
```javascript
replaceSnippets({
    'snippets--paginator': '<div>Content</div>',
});
```

### `setComponents`
Saves component constructors for further use when replacing snippets. 
Function accepts object of components.

```javascript
import { setComponents } from '@giantcz/nette';
setComponents(components);
``` 

### `triggerEvent`
Triggers event in [Gia eventbus](https://github.com/giantcz/gia#eventbus) in a form of `nette:[first parameter]`.
```javascript
triggerEvent("openPopup");
```

### `Snippet`
When initialized over an element, the instance is saved inside of the element. If the instance exists, it's `update` method is used for processing of the content replacement of snippet.
```javascript
import { Snippet } from '@giantcz/nette';
const instance = new Snippet(element);

instance.update = function({ element, newContent, snippetName }) {
    ...
}
```