;(function($, exports, d) {
  'use strict';
  /**
   * @description
   * svg structure:
   * <g>
   *  <text ...>...</text>
   *  ...//selfElement
   * </g>
   */
  function BaseElement(parent) {
    this.element       = null;
    this.text          = null;
    this.textElement   = null;
    this.selfElement   = null;
    this.type          = null;
    this.id            = null;
  }

  BaseElement.prototype.gsElement = function(e) {
    if (e) {
      this.element = e;
      return this;
    }
    return this.element;
  }

  BaseElement.prototype.gsClassed = function() {
    if (!arguments.length) {
      return this.element.classed();
    }
    else if (arguments[arguments.length - 1] === false) {
      this.element.classed(Array.prototype.join.call(arguments, ' '), false);
    }
    else this.element.classed(Array.prototype.join.call(arguments, ' '), true);
    return this;
  }

  BaseElement.prototype.gsText = function(t) {
    if (t) {
      this.text = t;
      this.$$gsTextElement();
      return this;
    }
    return this.text;
  }

  BaseElement.prototype.$$gsTextElement = function() {
    if (!this.textElement) {
      this.textElement = this.element.append('text');
    }
    this.textElement.text(this.text);
    return this;
  }

  BaseElement.prototype.gsTextClassed = function() {
    return this.gsClassed.apply(this.textElement, arguments);
  }

  BaseElement.prototype.gsSelfElement = function(se) {
    if (se) {
      this.selfElement.remove();
      this.selfElement = se;
      this.element.append(this.selfElement);
      return this;
    }
    return this.selfElement;
  }


  BaseElement.prototype.gsSelfClassed = function() {
    return this.gsClassed.apply(this.selfElement, arguments);
    // if (!arguments.length) {
    //   return this.selfElement.classed();
    // }
    // this.selfElement.classed.apply(this.selfElement, arguments);
    // return this;
  }

  BaseElement.prototype.gsType = function(t) {
    if (t) {
      this.type = t;
      return this;
    }
    return this.type;
  }




  exports.BaseElement = BaseElement;
})(jQuery, window, document);