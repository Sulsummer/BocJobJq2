;(function($, exports, d, BaseElement, NODE) {
  'use strict';
  /**
   * @description
   * node svg structure:
   * <g class="node"> //element
   *  <text ...>...</text>
   *  ...//selfElement
   * </g>
   */
  function BaseNode(data) {
    BaseElement.apply(this, arguments);

    this.fixed = true;
    this.id    = data.id;
  }

  BaseNode.prototype = Object.create(BaseElement.prototype);
  BaseNode.prototype.constructor = BaseNode;


  BaseNode.prototype.gsFixed = function(f) {
    if (f) {
      this.fixed = f;
      return this;
    }
    return this.fixed;
  }

  BaseNode.prototype.draw = function(selection) {
    return this.gsElement(selection.append('circle').attr('r', 15).attr('fill', '#ccc'));
  }

  BaseNode.prototype.onMousehover = function() {
    this.gsClassed(NODE.HIGHLIGHT_COLOR);
  }

  BaseNode.prototype.onMouseLeave = function() {
    this.gsClassed(NODE.HIGHLIGHT_COLOR, false);
  }

  BaseNode.prototype.onFocus = function() {
    this.selfElement.attr('stroke', NODE.FOCUSED_COLOR).attr('stroke-width', NODE.FOCUSED_WIDTH);
  }

  BaseNode.prototype.onLostFocus = function() {
    this.selfElement.attr('stroke', 'none');
  }

  BaseNode.prototype.onClick = function(fn) {
    this.onFocus();

    if (!fn) return;
    if (fn instanceof Array) {
      fn.forEach(function(item) {
        if (typeof item === 'function') item();
      });
    }
    else if (typeof fn === 'function') fn();
    else return;
  }

  exports.BaseNode = BaseNode;
})(jQuery, window, document, BaseElement, CONFIG.NODE);