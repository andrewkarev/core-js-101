/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return width * height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const parsedObject = JSON.parse(json);
  Object.setPrototypeOf(parsedObject, proto);
  return parsedObject;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */
class CssSelectorBuilder {
  constructor() {
    this.validOrder = ['element', 'id', 'class', 'attr', 'pseudoClass', 'pseudoElement'];
    this.value = '';
    this.selectorsToCombine = [];
    this.selectorOccurances = {
      element: 0,
      id: 0,
      class: 0,
      attr: 0,
      pseudoClass: 0,
      pseudoElement: 0,
    };
  }

  element(value) {
    this.handleNumberOfOccurances('element');
    this.checkSelectorsOrder('element');
    this.selectorOccurances.element += 1;
    this.value += value;
    return this;
  }

  id(value) {
    this.handleNumberOfOccurances('id');
    this.checkSelectorsOrder('id');
    this.selectorOccurances.id += 1;
    this.value += `#${value}`;
    return this;
  }

  class(value) {
    this.checkSelectorsOrder('class');
    this.selectorOccurances.class += 1;
    this.value += `.${value}`;
    return this;
  }

  attr(value) {
    this.checkSelectorsOrder('attr');
    this.selectorOccurances.attr += 1;
    this.value += `[${value}]`;
    return this;
  }

  pseudoClass(value) {
    this.checkSelectorsOrder('pseudoClass');
    this.selectorOccurances.pseudoClass += 1;
    this.value += `:${value}`;
    return this;
  }

  pseudoElement(value) {
    this.handleNumberOfOccurances('pseudoElement');
    this.selectorOccurances.pseudoElement += 1;
    this.value += `::${value}`;
    return this;
  }

  handleNumberOfOccurances(selectorType) {
    if (this.selectorOccurances[selectorType]) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
  }

  checkSelectorsOrder(selectorType) {
    const nextSelectorOrder = this.validOrder
      .slice(this.validOrder.indexOf(selectorType) + 1)
      .filter((type) => this.selectorOccurances[type]);

    if (nextSelectorOrder.length) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
  }

  stringify() {
    if (this.selectorsToCombine.length) {
      return this.selectorsToCombine
        .filter((item) => item)
        .join(' ');
    }
    return this.value;
  }

  combine(selector1, combinator, selector2) {
    if (this.selectorsToCombine.length) {
      return this;
    }

    this.selectorsToCombine.push(selector1.value, `${combinator}`, selector2.value, ...selector2.selectorsToCombine);
    return this;
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new CssSelectorBuilder().element(value);
  },

  id(value) {
    return new CssSelectorBuilder().id(value);
  },

  class(value) {
    return new CssSelectorBuilder().class(value);
  },

  attr(value) {
    return new CssSelectorBuilder().attr(value);
  },

  pseudoClass(value) {
    return new CssSelectorBuilder().pseudoClass(value);
  },

  pseudoElement(value) {
    return new CssSelectorBuilder().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new CssSelectorBuilder().combine(selector1, combinator, selector2);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
