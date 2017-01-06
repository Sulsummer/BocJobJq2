;(function($, exports, CircleNode) {
  'use strict';

  var nodes, paths, hash;

  function node(data) {
    var n;
    return data.map(function(item) {
      n = createNode(item);
      hash[n.id] = n;
      return n;
    });
  }

  function path(data, nodes) {
    var r = [];
    data.forEach(function(item) {
      creatPath(item, r);
    });
    return r.map(function(item) {
      if (item.type && exports[item.type + 'Path']) return new exports[item.type + 'Path'](item);
      return new exports['BasePath'](item);
    });
  }

  function createNode(item) {
    if (exports[item.type + 'Node']) return new exports[item.type + 'Node'](item);
    return new exports['BaseNode'](item);
  }

  function createPath(item, r) {
    item.in.forEach(function(subItem) {
      r.push({
        source: hash[subItem.id],
        target: hash[item.id],
        type: null
      });
    });
    item.out.forEach(function(subItem) {
      r.push({
        source: hash[item.id],
        target: hash[subItem.id],
        type: null
      });
    });
  }

  exports.Parse = function(data) {
    nodes = node(data);
    paths = path(data, nodes);
    return {
      nodes: nodes,
      paths: paths
    }
  }
})(jQuery, window, CircleNode);