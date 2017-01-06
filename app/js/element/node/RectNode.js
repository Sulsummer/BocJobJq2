;(function($, exports, d, BaseNode) {
  'use strict';

  function RectNode() {

  }

  RectNode.prototype = Object.create(BaseNode.prototype);
  RectNode.prototype.constructor = RectNode;

  exports.CricleNode = RectNode;
})(jQuery, window, document, BaseNode)