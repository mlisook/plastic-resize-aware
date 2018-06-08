# plastic-resize-aware

This package contains two Polymer 3.0 elements:

`plastic-resize-aware` is a container element that fires an event when its size changes.

`plastic-element-query` is a non visual element that allows you to use CSS media query style
expressions as **element queries** to apply and remove CSS classes on a target element.
<!-- TOC -->

- [plastic-resize-aware](#plastic-resize-aware)
    - [Prior Versions](#prior-versions)
    - [Why and How](#why-and-how)
    - [Install](#install)
    - [How to Use](#how-to-use)
        - [plastic-resize-aware](#plastic-resize-aware-1)
        - [plastic-element-query](#plastic-element-query)

<!-- /TOC -->
## Prior Versions

Please see the element [resize-aware](https://www.webcomponents.org/element/mlisook/resize-aware) for a version that works with Polymer 1.0 or 2.0. The prior version does not
include element queries.

## Why and How

Sometimes you may need to take some action when the rendered size of an element changes. This element provides the 
something like the window resize event but for an individual element.

There are many reasons an element's size could change - CSS or class changes, content changes, content of other elements affecting
the flow, viewport changes, etc.

The `plastic-resize-aware` element uses a `ResizeObserver` which is polyfilled if necessary (so no polling).

The `plastic-element-query` element depends on a `plastic-resize-aware` element for size detection. As the reference element changes size the element query gets compared to the new size. 

## Install

`npm install --save plastic-resize-aware`

## How to Use

### plastic-resize-aware


```html
<plastic-resize-aware on-element-size-changed="handleChange">
    <p>
      [[theReview]]
    </p>
    <img src="[[thePic]]">
</plastic-resize-aware>
 ```
 or
 ```html
<plastic-resize-aware id="pra1">
  any content that could have been in a div
</plastic-resize-aware>
```
```javascript
this.$.pra1.addEventListener('element-resize', this.someHandlerName);
```

### plastic-element-query

The idea with this element is that there is a _reference element_ which must be a 
`plastic-resize-aware` element, who's size is monitored.  There is also a _target element_
which can be the same as the reference element or a different element.  The target element
is changed by modifying its `classList` depending on the `queryExpression` matching or
not matching the reference element's size.

```html
<plastic-resize-aware class="refoo-area right-pin">
    <plastic-element-query query-expression="(min-width: 50em) and (min-height: 40px)" 
       assign-classes="bigfiz  bin baz"></plastic-element-query>
    <plastic-element-query query-expression="(max-width: 225px),(max-height: 20px)" 
       assign-classes="tinytext"></plastic-element-query>
    <p>
      [[theReview]]
    </p>
    <img src="[[thePic]]">
</plastic-resize-aware>
 ```
 **Explanation:**

In this example, the _reference element_ and _target element_ were not specified so both
default to the parent `plastic-resize-aware`.

When the width of the plastic-resize-aware element is at least 50em _and_ the height is 
at least 40px, the classes bigfiz, bin and baz will be added to the  plastic-resize-aware element. When 
that is no longer true, those classes will be removed.

When the width of the plastic-resize-aware element is at most 225px _or_ the height is 
at most 20px, the class tinytext will be added to the  plastic-resize-aware element. When 
that is no longer true, that class will be removed.

It is not necessary to locate the `plastic-element-query` inside `plastic-resize-aware` nor is it
required to apply the CSS modification to the `plastic-resize-aware` element.  The `ref-element`
attribute can be used to point to an instance of `plastic-resize-aware` by id (string).  In code
you can set `refElement` to an id string or an element reference to a `plastic-resize-aware`.

Similarly the target for applying CSS classes does not have to be a parent `plastic-resize-aware` or even
a `plastic-resize-aware` at all.  Use the `target-element` attribute to specify an id or set in code to
an element reference.

```html
<plastic-resize-aware id="intheflow" class="badabing">
    <some-sorta-content>...</some-sorta-content>
</plastic-resize-aware>
<div id="searcher">...</div>
<plastic-element-query query-expression="(min-width: 50em) and (min-height: 40px)" 
    ref-element="intheflow" target-element="searcher"
    assign-classes="bigfiz bin baz"></plastic-element-query>
<plastic-element-query query-expression="(max-width: 225px),(max-height: 20px)" 
    ref-element="intheflow" target-element="searcher"
    assign-classes="tinytext"></plastic-element-query>
 ```

 #### Event

 `plastic-element-query` fires a `element-query-match` event when the matching status
 of its `queryExpression` changes.  The event detail includes:
 ```js
{
    queryExpression: // the query expression 
    matches: // boolean - new matching status
    targetElement: // reference to the target element
    classList: // the list of class names
    width: // width of the ref-element
    height: // height of the ref-element
}
```

## Issues

Please submit issues via the github repository.

## Contributions

Contributions via a PR are welcome. 

## License

MIT
