;(function(exports, ArrowPath) {
  'use strict';
  function Paths(container) {
    this.container = container;
    this.arrowPathContainer = this.container.append('g').classed('path-container-arrow', true);
    this.paths = [];
  }

  Paths.prototype.draw = function(data) {
    this.arrowPaths = this.arrowPathContainer.selectAll('.path-container-arrow-element')
          .data(data)
          .enter()
          .append('g')
          .classed('.path-container-arrow-element', true)
          .filter(function(item) {
            return item.type === 'ArrowPath'
          });
    this.arrowPaths.each(function(item) {
      item.draw(d3.select(this));
    });
    this.paths.push(this.arrowPaths);
    return this;
  }

  



  exports.Paths = Paths;
})(window, ArrowPath)