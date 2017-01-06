;(function($, exports, Nodes) {
  'use strict';

  /**
   * @description
   * board structure:
   * <svg ...> //svg
   *  <g ...> //element global g for zoom & drag
   *    <g ...>...</g> //nodeContainer
   *    <g ...>...</g> //pathContainer
   *  </g>
   * </svg>
   */
  function BoardContainer(container, graph) {
    var that = this, drag, force, zoom;
    //svg
    this.svg = container.append('svg').attr('width', '100%').attr('height', '100%').classed('graph-svg', true);
    //global g
    this.element = this.svg.append('g').attr('width', '100%').attr('height', '100%');
    //NodeContainer g
    this.nodeContainer = this.element.append('g').classed('node-container', true);
    //PathContainer g
    this.pathContainer = this.element.append('g').classed('path-container', true);

    this.draw(graph).drag(drag);
  }

  BoardContainer.prototype.draw = function(graph) {
    this.nodes  = new Nodes(this.nodeContainer).draw(graph.nodes);
    this.paths  = new Paths(this.pathContainer).draw(graph.paths);
    return this;
  }

  BoardContainer.prototype.drag = function(drag) {
    this.nodes.drag(drag);
    return this;
  }

  // BoardContainer.prototype.startForce = function() {

  // }
  exports.BoardContainer = BoardContainer;
})(jQuery, window, Nodes)