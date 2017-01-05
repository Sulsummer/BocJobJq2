;(function($, w, d) {
  'use strict';

  function Pop() {
    var that = this;
    this.$ele = (function() {
      var $ele = $(d.createElement('div'));
      $ele.addClass('pop').addClass('hide');
      $('.container').append($ele);
      return $ele;
    })();
    this.$content = (function() {
      var $ele = $(d.createElement('div'));
      $ele.addClass('pop-content');
      that.$ele.append($ele);
      return $ele;
    })();
    this.$close = (function() {
      var $ele = $(d.createElement('div'));
      $ele.addClass('pop-close');
      that.$ele.append($ele);
      $ele.on('click', function() {
        that.toggle();
      });
      return $ele;
    })();
    this.$mask = (function() {
      var $ele = $(d.createElement('div'));
      $ele.addClass('pop-mask').addClass('hide');
      $ele.on('click', function() {
        that.toggle();
      });
      $('.container').append($ele);
      return $ele;
    })();
  }
  //初始化：1.创建表格
  //       2.更新数据
  Pop.prototype.init = function(params) {
    this.$ele.addClass('open');
    this.$mask.addClass('open');
    this.createTable(params);
    this.refresh(params);
  }

  Pop.prototype.toggle = function(toOpen) {
    if (!toOpen) {
      util.toggle(this.$ele, 'open', 'hide');
      util.toggle(this.$mask, 'open', 'hide');
    }
    else {
      this.$ele.removeClass('hide').addClass('open');
      this.$mask.removeClass('hide').addClass('open');
    }
  }
  //更新数据
  Pop.prototype.refresh = function(params) {
    this.$$request(params);
    this.toggle(true);
  }
  //创建表格
  Pop.prototype.createTable = function(params) {
    this.$table = $(d.createElement('table'));
    this.$thead = $(d.createElement('thead'));
    this.$tbody = $(d.createElement('tbody'));
    this.$table.addClass('pop-table').append(this.$thead).append(this.$tbody);

    var $trInThead = $(d.createElement('tr'));
    $trInThead.append('<td>a</td>').append('<td>b</td>').append('<td>c</td>');
    this.$thead.append($trInThead);

    this.$content.append(this.$table);

    //根据params设定请求参数，然后进行请求，获取到数据后将数据填入表格
    this.$$request(params);
  }
  //我一般习惯用$$开头命名私有方法
  //获取数据
  Pop.prototype.$$request = function(params) {
    //util.http(params)...
    this.$$refreshData();
  }
  // 1.表格剩余的主体画出来
  // 2.数据填到表格里
  Pop.prototype.$$refreshData = function(data) {
    for (var j = 0; j < 100; j ++) {
      var $tr = $(d.createElement('tr'));
      for (var i = 0; i < 3; i ++) {
        var $td = $(d.createElement('td'));
        $td.text(i);
        $tr.append($td);
      }
      this.$tbody.append($tr);
    }

    this.$content.focus();
  }


  w.pop = new Pop();
})(jQuery, window, document)