;(function($, exports, d, Parse, BoardContainer) {
  var graph = {
    nodeData: null,
    pathData: null,
    board: null
  };

  graph.init = function(data, selection) {
    this.data = Parse(data);
    this.board = new BoardContainer(selection, this);
    return this;
  }

  // graph.reDraw = function(data) {
  //   this.$$parse(data);
  //   this.board.draw(this.data);
  //   return this;
  // }


  // function init() {
  //   force = d3.layout.force().on('tick', calculatePosition);

  //   drag = d3.behavior.drag().on('dragstart', function (d) {
  //     d3.event.sourceEvent.stopPropagation(); // Prevent panning
  //     // d.locked(true);
  //   })
  //   .on('drag', function (d) {
  //     d.px = d3.event.x;
  //     d.py = d3.event.y;
  //     // force.resume();
  //   })
  //   .on('dragend', function (d) {
  //     // d.locked(false);
  //   });

  //   zoom = d3.behavior.zoom();
  // }

  // function calculatePosition() {

  // }



  exports.graph = graph;

})(jQuery, window, document, Parse, BoardContainer);