;(function(exports) {
  'use strict';

  /**
   * @description
   * path svg structure:
   * <g class="path"> //element
   *  <text ...>...</text>
   *  ...//selfElement
   * </g>
   */

  function BasePath(path) {
    this.source  = path.source;
    this.target  = path.target;
    this.element = null;
  }

  BasePath.prototype = Object.create(BaseElement.prototype);
  BasePath.prototype.constructor = BasePath;

  BasePath.prototype.gsSource = function(s) {
    if (s) {
      this.source = s;
      return this;
    }
    return this.source;
  }

  BasePath.prototype.gsTarget = function(t) {
    if (t) {
      this.target = t;
      return this;
    }
    return this.target;
  }

  BasePath.prototype.gsElement = function(e) {
    if (e) {
      this.element = e;
      return this;
    }
    return this.element;
  }

  BasePath.prototype.draw = function(selection) {
    this.gsElement(this.$$draw(selection));
  }

  BasePath.prototype.$$draw = function(selection) {
    return selection.append('path');
  }





  exports.BasePath = BasePath;
})(window, BaseELement);