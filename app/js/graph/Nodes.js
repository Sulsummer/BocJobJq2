;(function($, exports) {
  'use strict';

  /**
   * @description
   * node container structure:
   * <svg ...> //svg
   *  <g ...> //element global g for zoom & drag
   *    <g ...>//nodeContainer
   *      <g ...>...</g>//circle container
   *      <g ...>...</g>//other container
   *    </g>
   *    <g ...>...</g> //pathContainer
   *  </g>
   * </svg>
   *
   * @params container: nodeContainer
   */
  function Nodes(container) {
    var that = this;
    this.container = container;
    this.circleNodeContainer = this.container.append('g').classed('node-container-circle', true);
    this.nodes = [];
  }

  Nodes.prototype.draw = function(data) {
    //circle
    this.circleNodes = this.circleNodeContainer.selectAll('.node-container-circle-element')
        .data(data)
        .enter()
        .append('g')
        .filter(function(item, i) {
          return item.type === 'CircleNode';
        })
        .classed('node-container-circle-element', true);
    this.circleNodes.each(function(item) {
      item.draw(d3.select(this));
    });
    this.nodes.push(this.circleNodes);

    return this;
  }

  Nodes.prototype.drag = function(drag) {
    this.nodes.forEach(function(item) {
      item.each(function(subItem) {
        subItem.drag(drag);
      });
    });
  }

  exports.Nodes = Nodes;
})(jQuery, window);