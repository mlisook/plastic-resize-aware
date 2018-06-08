import {
  html,
  PolymerElement
} from '@polymer/polymer/polymer-element.js';

/**
 * `plastic-resize-aware`
 * An element that fires an event when its size changes
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class PlasticResizeAware extends PolymerElement {
  static get template() {
    return html `
      <style>
        :host {
          display: block;
        }
      </style>
      <slot></slot>
    `;
  }
  static get properties() {
    return {
      /**
       * Current element size in px. { height: width: }
       * @type {Object}
       */
      elementSize: {
        type: Object,
        notify: true,
        readOnly: true,
        value: function () {
          return {
            width: 0,
            height: 0
          };
        }
      },
    };
  }

  static get importMeta() { return import.meta; }

  connectedCallback() {
    super.connectedCallback();
    this._initResizeObserver(false);
  }

  /**
   * Initializes resize observer
   * @param {boolean} isPolyfilled Called after polyfill loaded
   */
  _initResizeObserver(isPolyfilled) {
    // if the polyfill is needed and not yet loaded,
    // wait for it to load first.
    if (!('ResizeObserver' in window)) {
      // There could be multiple plastic-resize-aware elements in the document
      // but we only need to load the polyfill for ResizeObserver
      // one time.
      let polyfillScript = document.getElementById('polyfill-ResizeObserver');
      if (!polyfillScript) {
        // load the ResizeObserver polyfill script
        polyfillScript = document.createElement("script");
        polyfillScript.id = 'polyfill-ResizeObserver';
        polyfillScript.src = this.importPath + "ResizeObserver.js";
        polyfillScript.async = true;
        document.head.appendChild(polyfillScript);
      }
      // listen for the polyfill to finish loading
      // then retry the initLazyLoad process
      polyfillScript.addEventListener("load", _ => this._initResizeObserver(true));
    } else {
      // ResizeObserver is available, initialize observation
      // Create the observer for this page if it doesn't exist
      if (!window.plasticResizeObserver) {
        window.plasticResizeObserver = {
          /* the number of elements sharing this observer */
          counter: 0,
          /* an ResizeObserver with only default arguments */
          observer: new ResizeObserver((entries) => {
            entries.forEach((entry) => {
              entry.target._roCallback(entry);
            });
          }, {})
        };

      }
      // observe this element
      window.plasticResizeObserver.observer.observe(this);
      window.plasticResizeObserver.counter++;
    }
  }
  /**
   * Fire event for this element's resize
   * @param {ResizeObserverEntry} entry 
   */
  _roCallback(entry) {
    this.dispatchEvent(new CustomEvent('element-resize', {
      detail: {
        width: entry.contentRect.width,
        height: entry.contentRect.height
      }
    }));
   
    this._setElementSize({
      width: entry.contentRect.width,
      height: entry.contentRect.height
    });
   
  }
}

window.customElements.define('plastic-resize-aware', PlasticResizeAware);