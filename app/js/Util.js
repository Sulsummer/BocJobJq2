;(function(exports, d, $) {
  exports.util = {
    /*
     * @description 生成n位的随机数
     */
    getRandomNum: function(n) {
        var t = '';
        for(var i = 0; i < n; i ++){
            t += Math.floor(Math.random() * 10);
        }
        return t;
    },
    http: function(url, params, method) {
        var that = this;

        if (!url) {
            return ;
        }
        if (!method) {
            method = 'get';
        }
        $.ajaxSetup({
            dataFilter: function(data) {
                return JSON.parse(data);
            }
        });
        return $.ajax({
            url: url,
            method: method,
            data: params,
            random: that.getRandomNum(10)
        });
    },
    /**
     * @description 为连线到矩形边缘，计算矩形边缘坐标
     */
    calculateRectEdge: function(source, target) {
      var offset = 2,
          dx = target.x - source.x,
          dy = target.y - source.y,
          length = Math.sqrt(dx * dx + dy * dy);

      if (length <= parseInt(target.node.getAttribute('width'))*1.5) {
        return false;
      }

      var innerDistance = this.distanceToBorder(target.node, dx, dy);

      var ratio = (length - (innerDistance + offset)) / length,
        x = dx * ratio + source.x,
        y = dy * ratio + source.y;

      return {x: x, y: y};
    },
    /**
     * @description 矩形边到中心的距离
     */
    distanceToBorder: function(rect, dx, dy) {
      var width = rect.getAttribute('width'),
        height = rect.getAttribute('height');

      var innerDistance,
        m_link = Math.abs(dy / dx),
        m_rect = height / width;

      if (m_link <= m_rect) {
        var timesX = dx / (width / 2),
          rectY = dy / timesX;
        innerDistance = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(rectY, 2));
      } else {
        var timesY = dy / (height / 2),
          rectX = dx / timesY;
        innerDistance = Math.sqrt(Math.pow(height / 2, 2) + Math.pow(rectX, 2));
      }

      return innerDistance;
    },
    /**
     * @description 对于对象o(必须是jquery对象），在class1与class2之间切换
     *              如果o不含class1和class2，则添加class1
     */
    toggle: function(o, class1, class2) {
        if (o.hasClass(class1)) o.removeClass(class1).addClass(class2);
        else o.removeClass(class2).addClass(class1);
    }
  }
})(window, document, $);