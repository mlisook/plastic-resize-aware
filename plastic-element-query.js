import {
    html,
    PolymerElement
} from '@polymer/polymer/polymer-element.js';
import './plastic-resize-aware.js';

/**
 * `plastic-resize-query`
 * An element size query
 *
 * @customElement
 * @polymer
 * @demo demo/index2.html
 */
class PlasticElementQuery extends PolymerElement {
    static get template() {
        return html `
        <style>
          :host {
            display: none;
          }
        </style>
        <slot></slot>
      `;
    }
    static get properties() {
        return {
            /**
             * Target element reference, or target element id,
             * to apply CSS changes to.
             * 
             * If not specified, the parent plastic-resize-aware element
             * is targetted.
             */
            targetElement: {
                type: Object,
                value: null,
                observer: '_targetElementChanged'
            },
            /**
             * Reference plastic-resize-aware element as a reference, or string element id.
             * This refers to the element that provides resize notifications and whose
             * size is used for comparison to element query rules.
             * 
             * If not specified, the parent plastic-resize-aware element
             * is used.
             */
            refElement: {
                type: Object,
                value: null,
                observer: '_refElementChanged'
            },
            /**
             * element query expression
             */
            queryExpression: {
                type: String,
            },
            /**
             * list of CSS classes to assign to the target element
             * if the queryExpression matches
             */
            assignClasses: {
                type: String,
            },
            /**
             * does the queryExpression match?
             */
            isMatching: {
                type: Boolean,
                readOnly: true,
                value: false,
                observer: '_isMatchingChanged'
            },
            /**
             * Current reference element size in px. { height: width: }
             * @type {Object}
             */
            _refElementSize: {
                type: Object,
                value: null,
                observer: "_refSizeChanged"
            },
            /**
             * The plastic-resize-aware element used 
             * the basis for element query
             */
            _refElement: {
                type: Object,
                observer: "_refElementRefChanged"
            },
            /**
             * The target element for
             * css class changes
             */
            _targetElement: {
                type: Object,
                observer: "_targetElementRefChanged"
            }
        };
    }

    static get importMeta() {
        return import.meta;
    }

    connectedCallback() {
        super.connectedCallback();
        if (!this._refElement) {
            this._refElement = this._getDefaultParent();
        }
        if (!this._targetElement) {
            this._targetElement = this._getDefaultParent();
        }
    }

    /**
     * Returns the parent plastic-resize-aware element
     */
    _getDefaultParent() {
        let currentElem = this;
        let currentTag = this.tagName;
        while (currentTag !== 'PLASTIC-RESIZE-AWARE') {
            currentElem = currentElem.parentElement;
            if (!currentElem || currentElem.tagName == 'BODY') {
                return null;
            }
            currentTag = currentElem.tagName;
        }
        return currentElem;
    }

    /**
     * Handle change to target element
     * @param {string | element} newValue 
     * @param {string | element} oldValue 
     */
    _targetElementChanged(newValue, oldValue) {
        if (newValue) {
            if (typeof newValue == 'object') {
                this._targetElement = newValue;
            } else {
                if (typeof newValue == 'string') {
                    let te = document.getElementById(newValue);
                    if (te) {
                        this._targetElement = te;
                    } else {
                        console.error('Target element "' + newValue + '" not found.');
                    }
                }
            }
        }
    }

    /**
     * Handle change to reference element
     * @param {string | element} newValue 
     * @param {string | element} oldValue 
     */
    _refElementChanged(newValue, oldValue) {
        if (newValue) {
            if (typeof newValue == 'object') {
                if (newValue && newValue.tagName && newValue.tagName == 'PLASTIC-RESIZE-AWARE') {
                    this._refElement = newValue;
                } else {
                    console.log('Reference element is not plastic-resize-aware');
                }
            } else {
                if (typeof newValue == 'string') {
                    let te = document.getElementById(newValue);
                    if (te && te.tagName && te.tagName == 'PLASTIC-RESIZE-AWARE') {
                        this._refElement = te;
                    } else {
                        console.error('Reference element "' + newValue + '" not found or is not plastic-resize-aware.');
                    }
                }
            }
        }
    }

    /**
     * When the reference element size changes, evaluate the
     * element queryExpression for a match
     * 
     * @param {Object} newValue 
     * @param {Object} oldValue 
     */
    _refSizeChanged(newValue, oldValue) {
        if (newValue && newValue.hasOwnProperty('width') && newValue.hasOwnProperty('height')) {
            // check if match
            if (this.queryExpression) {
                let m = this._matchQuery(this.queryExpression, {
                    type: 'screen',
                    width: newValue.width + 'px',
                    height: newValue.height + 'px'
                });
                if (m !== this.isMatching) {
                    this._setIsMatching(m);
                }
            }
        } else {
            if (this.isMatching) {
                this._setIsMatching(false);
            }
        }
    }

    /**
     * When the isMatching value changes, apply CSS changes
     * and fire an event
     * @param {Boolean} newValue 
     * @param {Boolean} oldValue 
     */
    _isMatchingChanged(newValue, oldValue) {
        // if it matches
        if (newValue && !oldValue) {
            if (this.assignClasses && this._targetElement) {
                let clist = this.assignClasses.split(' ').filter(e => e.length > 0);
                this._targetElement.classList.add(...clist);
            }
            this.dispatchEvent(new CustomEvent('element-query-match', {
                detail: {
                    queryExpression: this.queryExpression,
                    matches: true,
                    targetElement: this._targetElement,
                    classList: this.assignClasses,
                    width: newValue.width,
                    height: newValue.height
                }
            }));
        }
        // if it doesn't match
        if (!newValue && oldValue) {
            if (this.assignClasses && this._targetElement) {
                let clist = this.assignClasses.split(' ').filter(e => e.length > 0);
                this._targetElement.classList.remove(...clist);
            }
            this.dispatchEvent(new CustomEvent('element-query-match', {
                detail: {
                    queryExpression: this.queryExpression,
                    matches: false,
                    targetElement: this._targetElement,
                    classList: this.assignClasses,
                    width: newValue.width,
                    height: newValue.height
                }
            }));
        }
    }
    _refElementRefChanged(newValue, oldValue) {
        if (oldValue) {
            oldValue.removeEventListener('element-resize', this._handleResize);
        }
        if (newValue) {
            newValue.addEventListener('element-resize', this._handleResize.bind(this));
        }
    }
    _targetElementRefChanged(newValue, oldValue) {

    }

    _handleResize(e) {
        this._refElementSize = {
            width: e.detail.width,
            height: e.detail.height
        };


    }

    //
    // Element Query Parser
    //   adapted with only minor changes from ericf/css-mediaquery
    //

    _parseQuery(mediaQuery) {
        const RE_MEDIA_QUERY = /^(?:(only|not)?\s*([_a-z][_a-z0-9-]*)|(\([^\)]+\)))(?:\s*and\s*(.*))?$/i,
            RE_MQ_EXPRESSION = /^\(\s*([_a-z-][_a-z0-9-]*)\s*(?:\:\s*([^\)]+))?\s*\)$/,
            RE_MQ_FEATURE = /^(?:(min|max)-)?(.+)/;


        return mediaQuery.split(',').map(function (query) {
            query = query.trim();

            var captures = query.match(RE_MEDIA_QUERY);

            // Media Query must be valid.
            if (!captures) {
                throw new SyntaxError('Invalid CSS media query: "' + query + '"');
            }

            var modifier = captures[1],
                type = captures[2],
                expressions = ((captures[3] || '') + (captures[4] || '')).trim(),
                parsed = {};

            parsed.inverse = !!modifier && modifier.toLowerCase() === 'not';
            parsed.type = type ? type.toLowerCase() : 'all';

            // Check for media query expressions.
            if (!expressions) {
                parsed.expressions = [];
                return parsed;
            }

            // Split expressions into a list.
            expressions = expressions.match(/\([^\)]+\)/g);

            // Media Query must be valid.
            if (!expressions) {
                throw new SyntaxError('Invalid CSS media query: "' + query + '"');
            }

            parsed.expressions = expressions.map(function (expression) {
                var captures = expression.match(RE_MQ_EXPRESSION);

                // Media Query must be valid.
                if (!captures) {
                    throw new SyntaxError('Invalid CSS media query: "' + query + '"');
                }

                var feature = captures[1].toLowerCase().match(RE_MQ_FEATURE);

                return {
                    modifier: feature[1],
                    feature: feature[2],
                    value: captures[2]
                };
            });

            return parsed;
        });
    }

    _matchQuery(mediaQuery, values) {
        return this._parseQuery(mediaQuery).some((query) => {
            var inverse = query.inverse;

            // Either the parsed or specified `type` is "all", or the types must be
            // equal for a match.
            var typeMatch = query.type === 'all' || values.type === query.type;

            // Quit early when `type` doesn't match, but take "not" into account.
            if ((typeMatch && inverse) || !(typeMatch || inverse)) {
                return false;
            }

            var expressionsMatch = query.expressions.every((expression) => {
                var feature = expression.feature,
                    modifier = expression.modifier,
                    expValue = expression.value,
                    value = values[feature];

                // Missing or falsy values don't match.
                if (!value) {
                    return false;
                }

                switch (feature) {
                    case 'orientation':
                    case 'scan':
                        return value.toLowerCase() === expValue.toLowerCase();

                    case 'width':
                    case 'height':
                    case 'device-width':
                    case 'device-height':
                        expValue = this._toPx(expValue);
                        value = this._toPx(value);
                        break;

                    case 'resolution':
                        expValue = this._toDpi(expValue);
                        value = this._toDpi(value);
                        break;

                    case 'aspect-ratio':
                    case 'device-aspect-ratio':
                    case /* Deprecated */ 'device-pixel-ratio':
                        expValue = this._toDecimal(expValue);
                        value = this._toDecimal(value);
                        break;

                    case 'grid':
                    case 'color':
                    case 'color-index':
                    case 'monochrome':
                        expValue = parseInt(expValue, 10) || 1;
                        value = parseInt(value, 10) || 0;
                        break;
                }

                switch (modifier) {
                    case 'min':
                        return value >= expValue;
                    case 'max':
                        return value <= expValue;
                    default:
                        return value === expValue;
                }
            });

            return (expressionsMatch && !inverse) || (!expressionsMatch && inverse);
        });
    }

    _toDecimal(ratio) {
        var decimal = Number(ratio),
            numbers;

        if (!decimal) {
            numbers = ratio.match(/^(\d+)\s*\/\s*(\d+)$/);
            decimal = numbers[1] / numbers[2];
        }

        return decimal;
    }

    _toDpi(resolution) {
        const RE_RESOLUTION_UNIT = /(dpi|dpcm|dppx)?\s*$/;
        var value = parseFloat(resolution),
            units = String(resolution).match(RE_RESOLUTION_UNIT)[1];

        switch (units) {
            case 'dpcm':
                return value / 2.54;
            case 'dppx':
                return value * 96;
            default:
                return value;
        }
    }

    _toPx(length) {
        const RE_LENGTH_UNIT = /(em|rem|px|cm|mm|in|pt|pc)?\s*$/;
        var value = parseFloat(length),
            units = String(length).match(RE_LENGTH_UNIT)[1];

        switch (units) {
            case 'em':
                return value * 16;
            case 'rem':
                return value * 16;
            case 'cm':
                return value * 96 / 2.54;
            case 'mm':
                return value * 96 / 2.54 / 10;
            case 'in':
                return value * 96;
            case 'pt':
                return value * 72;
            case 'pc':
                return value * 72 / 12;
            default:
                return value;
        }
    }


}

window.customElements.define('plastic-element-query', PlasticElementQuery);