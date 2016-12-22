;(function($, exports, d) {
    'use strict';
    var w = exports;

    var Notify = function() {
        this.$element         = $(d.createElement('div'));
        this.items            = [];
        this.intervalToMove   = null;
        this.moving           = null;
        this.msgCache         = [];
        this.$element.addClass('notify');
        $('body').append(this.$element);

    }
    Notify.DURATION = 3000;
    Notify.prototype = {
        constructor: Notify,
        success: function(msg, title) {
            showNotify.call(this, 'success', msg, title);
        },
        error: function(msg, title) {
            showNotify.call(this, 'error', msg, title);
        },
        warn: function(msg, title) {
            showNotify.call(this, 'warn', msg, title);
        },
        customize: function(msg, title, color) {
            showNotify.call(this, color, msg, title);
        }
    }

    /*
     * @description 通知的移动
     */
    function intervalToMoveCheck() {
        var that = this;
        return setInterval(function() {
            //获取最顶部的第一个通知元素
            var first = that.$element.children().eq(0);

            if (!first) return;

            //如果第一个已经在通知栏外面了，就删去，同时first指向新的第一个通知
            if (parseInt(first.css('top')) < 0) {
                removeItem.call(that, first.data('ix.notifyItem'));
                first = that.$element.children().eq(0);
            }

            //此次移动的距离就是first的实际高度+first距离通知栏顶部的高度
            var move = first.height() +
                        parseInt(first.css('padding-top')) +
                        parseInt(first.css('padding-bottom')) +
                        parseInt(first.css('margin-bottom'));

            //每个通知移动一次，距离为上面计算的移动距离，移动过程中移动状态moving标记为true
            that.$element.children().each(function(i) {
                that.moving = true;
                var item = $(this).data('ix.notifyItem');

                if (!item) return;

                item.move(move);
            });

            //一次移动结束，移动状态moving标记为false
            setTimeout(function() {
                that.moving = false;
            }, NotifyItem.DURATION);

            //一次移动结束后，如果通知栏不在有通知存在，结束通知动画，隐藏通知栏
            if (that.$element.children().length <= 0) {
                clearInterval(that.intervalToMove);
                that.intervalToMove = null;
                that.$element.hide();
            }
        }, Notify.DURATION);
    }
    /*
     * @description 添加一个新的通知
     */
    function addItem(type, msg, title) {
        //如果当前没有在通知，创建一个新的通知移动队列
        if (!this.intervalToMove) {
            this.intervalToMove = intervalToMoveCheck.call(this);
        }

        var item = new NotifyItem(type, msg, title);

        //获取目前所有存在的通知
        var children = this.$element.children();
        //如果没有存在通知，就新添加到第一条，并立即显示
        if (!children.length) {
            this.$element.append(item.$element);
            item.show(0);
        }
        else {
            //如果已经有通知存在，获取存在的最后一条通知
            var last = children.last();
            this.$element.append(item.$element);

            //根据最后一条通知的位置，计算要新添加的通知距离顶部的位置，并设置上去
            var targetTop = parseInt(last.css('top'))+
                            last.height()+
                            parseInt(last.css('margin-bottom'))+
                            parseInt(last.css('padding-top'))+
                            parseInt(last.css('padding-bottom'));
            item.show(targetTop);
        }

        return item;
    }
    //删除一个通知
    function removeItem(item) {
        item.remove();
    }
    //显示一条新通知
    function showNotify(type, msg, title) {
        var that = this;
        //如果通知栏当前正在移动，将新通知的内容存到缓存中，等此次移动结束后再添加
        if (this.moving) {
            this.msgCache.push({
                type: type,
                msg: msg,
                title: title
            });
        }
        //添加新通知
        else {
            //如果通知栏存在通知但是没有显示，则显示通知栏
            if (!this.items.length && !this.$element.is(':visible')) {
                this.$element.show();
            }
            //生成一条新的通知
            if (!this.msgCache.length) {
                addItem.call(this, type, msg, title);
            }
            //从缓存中读取全部缓存的通知内容
            else {
                $$readCache.call(this);
            }
        }
    }
    function $$readCache() {
        var len = this.msgCache.length;
        while (len >= 0) {
            var item = this.msgCache.shift();

            if (!item) return;

            showNotify.call(this, item.type, item.msg, item.title);

            len --;
        }
    }
    //隐藏通知栏
    function hideNotify() {
        this.$element.hide();
    }

    var NotifyItem = function(type, msg, title) {
        this.id       = 0;
        this.$element = $(d.createElement('div'));
        this.$element.data('ix.notifyItem', this).addClass('notify-item ix-card');
        if (typeof type === 'string') this.$element.addClass(type);
        else if (typeof type === 'object') this.$element.css({
            color: type.fontColor,
            background: type.bgColor
        });

        msg && (this.msg = msg);
        this.$msgElement = $(d.createElement('div'));
        this.$msgElement.addClass('notify-item-msg').html(this.msg);

        if (title) {
            this.title         = title;
            this.$titleElement = $(d.createElement('div'));
            this.$titleElement.addClass('notify-item-title').html(this.title);
        }

        this.$titleElement && this.$element.append(this.$titleElement);

        this.$element.append(this.$msgElement);

        this.id ++;
    }

    NotifyItem.DURATION = 150;

    NotifyItem.prototype = {
        constructor: NotifyItem,
        //根据传入的位置显示当前通知
        //因为一条通知是左右占满通知栏的，所以只需要距离通知栏顶部这一个维度就能定位一条通知的位置
        show: function(targetTop) {
            this.$element.css('top', targetTop + 100);
            this.$element.offset();
            this.$element
                .css('display', 'block')
                .animate({
                    top: targetTop,
                    opacity: 1
                }, NotifyItem.DURATION);
            return this;
        },
        //向上移动distance距离
        move: function(distance) {
            var presentTop = parseInt(this.$element.css('top'));
            this.$element.animate({
                top: presentTop - distance
            }, NotifyItem.DURATION);
        },
        //删除当前通知
        remove: function() {
            this.$element.remove();
            return this;
        }
    }


    exports.Notify = new Notify();
})(jQuery, window, document);