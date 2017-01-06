;(function($, exports, d, BaseNode, CFG) {
  'use strict';
  /**
   * @description
   * circle node svg structure:
   * <g class="node">
   *  <circle ...></circle>
   *  <text ...>...</text>
   * </g>
   */
  function CircleNode(data) {
    BaseNode.apply(this, arguments);
    this.radius = CFG.NODE.RADIUS;
    this.color  = CFG.NODE.COLOR;
    this.data   = data;
    this.type   = 'CircleNode';
  }

  CircleNode.prototype = Object.create(BaseNode.prototype);
  CircleNode.prototype.constructor = CircleNode;

  CircleNode.prototype.gsRadius = function(r) {
    if (r) {
      this.radius = r;
      return this;
    }
    return this.radius;
  }

  CircleNode.prototype.gsColor = function(c) {
    if (c) {
      this.color = c;
      return this;
    }
    return this.color;
  }

  CircleNode.prototype.draw = function(selection) {
    return this.gsElement(selection.append('circle').attr('r', this.radius).attr('fill', this.color));
  }

  CircleNode.prototype.drag = function(drag) {
    this.element.call(drag);
    return this;
  }


  exports.CircleNode = CircleNode;
})(jQuery, window, document, BaseNode, CONFIG)