;(function($, w, d) {
  'use strict';
  function Left() {
    var that = this;

    this.$left = $('.left');
    this.$right = $('.right');
    this.$left.addClass('on');
    this.$right.addClass('on');

    this.$title = $('.left .maintitle');
    this.$in   = $('.left table.in');
    this.$inBody   = this.$in.find('tbody'),
    this.$out  = $('.left table.out');
    this.$outBody  = this.$out.find('tbody');

    this.$close = (function() {
      var $ele = $('.left .close.on');
      $ele.on('click', function() {
        that.toggle();
      });
      that.$left.append($ele);
      return $ele;
    })();



  }
  Left.prototype.init = function(node) {
    this.$title.text(node.name);
    $('.title').each(function() {
      $(this).css('display', 'block');
    });
    this.$in.css('display', 'table');
    this.$out.css('display', 'table');

    this.$inBody.empty();
    this.$outBody.empty();

    this.createTable(node.in, this.$inBody).createTable(node.out, this.$outBody);
    return this;
  }
  Left.prototype.createTable = function(data, $ele) {
    data.forEach(function(item, i) {
      var $tr = $('<tr></tr>');
      $tr.append('<td>'+item.customerId+'</td>')
          .append('<td>'+item.name+'</td>')
          .append('<td>'+item.amt+'</td>');
      $ele.append($tr);
    });
    return this;
  }
  Left.prototype.toggle = function() {
    util.toggle(this.$left, 'on', 'off');
    util.toggle(this.$right, 'on', 'off');
    util.toggle(this.$close, 'on', 'off')
  }
  w.left = new Left();
})(jQuery, window, document);