;(function($, w, d, Notify) {
    'use strict';

    //========================
    //LinkRelation Definition
    //
    var LinkRelation = function(element, option, callbacks) {
        this.$element     = null;
        this.$parent      = $(element);
        this.$fakeBody    = null; // the div that pretends to be the 'body', used to be shown in full window
        this.$body        = $(d.body);
        this.linkItems    = [];//consist of linkItems below
        // this.presentItem  = null;
        this.presentData  = null;
        this.screenSwitch = null;
        this.contextmenus = {};
        this.callbacks    = callbacks;
        this.option       = $.extend({},{
            extraFuncOpen: true,
            baseURL: null,
            params: null,
            defaultShowLayer: 1,
            radius: 15,
            lineStrokeWidth: 1.5,
            svgShadow: true,
            color: {
                pathColor: '#eb9f9f',
                nodeColors: ['#A593E0', '#ffc952', '#47b8e0', '#f199bc', '#67D5B5',
                    '#ef5285', '#0080ff', '#52616a', '#9055A2', '#75D701'],
                markerColor: '#ff0017'
            },
            isNodeFixed: true
        }, option);
        checkOptionValid.call(this, this.option);

        initializeLink.call(this);
        initializeScreenSwitch.call(this);
        initializeContextMenu.call(this);

        bindGlobalEvent.call(this);
    }

    LinkRelation.VERSION = '0.0.1';
    LinkRelation.prototype = {
        constructor: LinkRelation,
        addNewItem: function(params) {
            getData.call(this, this.option.baseURL, params, getNewLinkItem);
            return this;
        },
        /**
         * @description 画布放大到全屏，其实是在这个div上宽高都为100%，再让这个div的全屏显示在最前，就实现了画布全屏
         */
        enterFullWindow: function() {
            if (!this.$fakeBody) initializeFakeBody.call(this);

            this.$fakeBody.append(this.$element);
            this.$body.append(this.$fakeBody);
        },
        exitFullWindow: function() {
            this.$parent.append(this.$element);
            this.$body.find('.fake-body').remove();

        }
    }
    //
    //LinkRelation Definition End
    //============================

    //===============================
    //Private Funcs For LinkRelation
    //
    /*
     * @description 初始化整个LinkRelation样式，检查基地址，并获取第一份数据
     */
    function initializeLink() {
        var that = this;

        var $fullArea = $(d.createElement('div'));
        $fullArea.addClass('full-area');
        this.$parent.append($fullArea);
        this.$element = $fullArea;

        this.$element.addClass('ix-link-relation').addClass('ix-screen');
// this.$element.addClass('full-area')
        this.addNewItem(this.option.params);
    }
    /*
     * @description 初始化切换indicator
     */
    function initializeScreenSwitch() {
        var that = this;
        this.$element.on('screen.switch.ix.LinkItem', function() {
            that.screenSwitch.render();
        });
    }
    /*
     * @description 初始化右键菜单
     */
    function initializeContextMenu() {
        var that = this;
        $('body').find('.context-menu').each(function(i) {
            var $this = $(this);
            if ($this.hasClass('rect')) {
                that.contextmenus['rect'] = new ContextMenu($this, 'rect');
            }
            if ($this.hasClass('path')) {
                that.contextmenus['path'] = new ContextMenu($this, 'path');
            }
        });
    }
    /*
     * @description 根据数据初始化一个新的linkItem
     *              根据新的linkItem，重新设置indicator
     */
    function getNewLinkItem(data) {
        var that = this;

        var section  = d.createElement('section'),
            $section = $(section);

        $section.addClass('link-item');

        this.$element.append($section);

        var linkItem = new LinkItem(data, $section, this);
        this.linkItems.push(linkItem);

        if (!this.screenSwitch) {
            this.screenSwitch = new ScreenSwitch(this);
        }
        else {
            this.screenSwitch.refresh(this.linkItems.length-1);
        }
    }
    /*
     * @description 根据基地址及参数获取数据
     *              如果传入多个回调，将传入获取的数据并依次执行回调方法
     */
    function getData(baseUrl, params) {
        var that = this,
            args = arguments;
        w.http(baseUrl, params)
        .done(function(success){
            if (args.length > 2) {
                [].slice.call(args, 2).forEach(function(callback, i) {
                    callback.call(that, success);
                });
            }
        })
        .fail(function(error){
            console.log(error);
        });
    }
    /*
     * @description 检查部分参数配置是否合法
     * @param option 默认参数与自定义参数的合并对象
     */
    function checkOptionValid(option) {
        if (!option.baseURL) {
            Notify.error('缺少请求数据的URL地址！');
        }
        if (typeof option.defaultShowLayer !== 'number' || option.defaultShowLayer <= 0) {
            Notify.error('层级数不合法！');
        }
        if (typeof option.radius !== 'number' || option.radius <= 0) {
            Notify.error('半径不合法！');
        }
        if (typeof option.lineStrokeWidth !== 'number' || option.lineStrokeWidth <= 0) {
            Notify.error('半径不合法！');
        }
        return;
    }
    /*
     * @description 绑定全局事件
     *              绑定了全局的错误拦截
     */
    function bindGlobalEvent() {
        $(w).on('notify.global.error', function(e, msg) {
            if (!msg) msg = 'Error';

            if (window.hasOwnProperty('Notify')) Notify.error(msg);
            else alert(msg);
        })
        .on('error', function(e, msg) {
            if (!msg) msg = 'Error';

            if (window.hasOwnProperty('Notify')) Notify.error(msg);
            else alert(msg);
        });
    }
    /**
     * @description 设置一个大小等同于body的div
     */
    function initializeFakeBody() {
        var $div = $(d.createElement('div'));
        $div.addClass('fake-body');
        this.$fakeBody = $div;
    }
    //
    //Private Funcs For LinkRelation End
    //===================================

    //====================
    //LinkItem Definition
    //
    var LinkItem = function(data, element, parent) {
        element ?
            this.$element  = $(element) :
            this.$element  = $(d.createElement('section'));
        this.$element.addClass('link-item');

        this.$parent       = parent;
        this.$parent.$element.append(this.$element);

        this.board         = null;
        this.contextmenus  = parent.contextmenus;
        this.data          = data;
        this.option        = parent.option;
        this.layerSelector = null;
        this.$layerPanel   = null;
        this.$funcArea     = null;
        this.$movePanel    = null;
        this.$zoomPanel    = null;
        this.before        = null;
        this.ing           = null;
        this.after         = null;

        if (parent.callbacks) {
            parent.callbacks.before && (this.before = parent.callbacks.before);
            parent.callbacks.ing    && (this.ing    = parent.callbacks.ing);
            parent.callbacks.after  && (this.after  = parent.callbacks.after);
        }

        bindLayerChangeEvent.call(this);
        initializeLinkItem.call(this);

    }

    LinkItem.prototype = {
        constructor: LinkItem
    }
    //
    //LinkItem Definition End
    //========================

    //===========================
    //Private Funcs For LinkItem
    //
    /*
     * @description 初始化一个linkItem
     */
    function initializeLinkItem() {
        initBoard.call(this, this.data, this.option);
        initLayerPanel.call(this, this.data);
        initMovePanel.call(this, this.data);
        initZoomPanel.call(this, this.data);
    }
    /*
     * @description 初始化一个画布
     */
    function initBoard(data, option) {
        !this.board && (this.board = new Board(this, data, option));
        this.board.render(this.before, this.ing, this.after);
    }
    /*
     * @description 初始化画布的层级选择
     */
    function initLayerPanel(data) {
        var that = this;

        var maxLayer    = data[data.length-1].layer,
            $layerPanel = $(d.createElement('div')),
            $screen     = $(d.createElement('div')),
            $ul         = $(d.createElement('ul')),
            i           = 1;

        while (i <= maxLayer) {
            var $li       = $(d.createElement('li')),
                p         = d.createElement('p'),
                layerText = '第 ' + i + ' 层';
            p.innerHTML = layerText;
            $ul.append($li.append(p));

            $li.data('layer', i).data('layer-text', layerText);

            i ++;
        }

        $ul.addClass('ix-card');
        $screen.addClass('screen');
        $layerPanel.addClass('layer-panel');

        $layerPanel.append($screen).append($ul);

        $ul.on('click.change.layer', 'li', function(e) {
            var target;
            if (e.target.tagName.toLowerCase() === 'p') {
                target = e.target.parentElement;
            }
            else {
                target = e.target;
            }
            var layer     = $(target).data('layer'),
                layerText = $(target).data('layer-text');

            if (layer === that.layerSelector) return;

            $screen.html(layerText);
            that.$element.trigger('change.layer', layer);
        });
        $ul.find('li').eq(that.option.defaultShowLayer-1).trigger('click.change.layer');

        $screen.on('click', function(e) {
            $ul.show();
            e.stopPropagation();
        });

        $(w).on('click', function(e) {
            $ul.hide();
        });

        this.$layerPanel = $layerPanel;
        this.$element.append(this.$layerPanel);
    }
    /*
     * @description 绑定层级选择菜单的事件
     */
    function bindLayerChangeEvent() {
        var that = this;
        this.$element.on('change.layer', function(e, layer) {
            that.board.toggleByLayer(layer);
        });
    }
    /*
     * @description 初始化位移面板
     *              绑定位移面板的事件
     */
    function initMovePanel(data) {
        var that = this;

        var $movePanel = $(d.createElement('div')),
            $ul        = $(d.createElement('ul')),
            i          = 0,
            $funcArea  = this.$funcArea;

        if (!$funcArea) {
            $funcArea = $(d.createElement('div'));
            $funcArea.addClass('func-area');
            this.$funcArea = $funcArea;
            this.$element.append(this.$funcArea);
        }

        var $liUp    = $(d.createElement('li')),
            $liRight = $(d.createElement('li')),
            $liDown  = $(d.createElement('li')),
            $liLeft  = $(d.createElement('li'));

        $liUp.addClass('move-up').data('direction', 'up');
        $liRight.addClass('move-right').data('direction', 'right');
        $liDown.addClass('move-down').data('direction', 'down');
        $liLeft.addClass('move-left').data('direction', 'left');

        var interval;

        $ul.append($liUp).append($liRight).append($liDown).append($liLeft)
        .on('click', 'li', $$move)
        .on('mousedown', 'li', function(e) {
            var i = 0;
            interval = setInterval(function() {
                $$move(e);
                i ++;

                if (i === 100){
                    clearInterval(interval);
                }
            }, 10);
        })
        .on('mouseup', function(e) {
            clearInterval(interval);
        });

        function $$move(e) {
            var $target   = $(e.target),
                direction = $target.data('direction'),
                distance  = 5;

            switch (direction) {
                case 'up':
                    direction = 'vertical';
                break;
                case 'down':
                    direction = 'vertical';
                    distance  *= -1;
                break;
                case 'left':
                    direction = 'horizontal';
                break;
                case 'right':
                    direction = 'horizontal';
                    distance  *= -1;
                break;
                default:
                return;
            }
            that.board.move(direction, distance);
        }


        $movePanel.addClass('move-panel').append($ul);
        this.$movePanel = $movePanel;
        this.$funcArea.append(this.$movePanel);
    }
    /*
     * @description 初始化放大缩小面板
     *              绑定放大缩小事件
     */
    function initZoomPanel(data) {
        var that = this;

        var $zoomPanel = $(d.createElement('div')),
            $increase  = $(d.createElement('div')),
            $decrease  = $(d.createElement('div')),
            $funcArea  = this.$funcArea;

        if (!$funcArea) {
            $funcArea = $(d.createElement('div'));
            $funcArea.addClass('func-area');
            this.$funcArea = $funcArea;
            this.$element.append(this.$funcArea);
        }

        var interval;
        $increase.addClass('increase').data('zoom', 'increase');
        $decrease.addClass('decrease').data('zoom', 'decrease');
        $zoomPanel.addClass('zoom-panel').append($increase).append($decrease)
        .on('click', 'div.increase, div.decrease', $$zoom)
        .on('mousedown', 'div.increase, div.decrease', function(e) {
            var i = 0;
            interval = setInterval(function() {
                $$zoom(e);
                i ++;
                if (i === 100){
                    clearInterval(interval);
                }
            }, 10);
        })
        .on('mouseup', 'div.increase, div.decrease', function(e) {
            clearInterval(interval);
        });

        function $$zoom(e) {
            var $target = $(e.target),
                zoom    = $target.data('zoom'),
                scale   = 0.1;

            if (zoom === 'decrease') {
                scale *= -1;
            }

            that.board.zoom(scale);
        }

        this.$zoomPanel = $zoomPanel;
        this.$funcArea.append(this.$zoomPanel);
    }
    //
    //Private Funcs For LinkItem End
    //===============================

    //=================
    //Board Definition
    //
    var Board = function(parent, data, option) {
        this.$parent        = parent;
        this.$parentEle     = parent.$element;
        this.svg            = null;
        this.svgElement     = null;
        this.$svgElement    = null;
        this.locationMarker = null;
        this.data           = data;
        this.option         = option;
        this.nodes          = [];
        this.paths          = [];
        this.force          = null;
        this.drag           = null;
        this.svgNodes       = null;
        this.svgPaths       = null;
        this.svgTexts       = null;
        this.viewBox        = null;                 // 这个记录的是svg初始化时的viewBox属性，不会被修改
        this.scale          = 1;
        this.contextmenus   = parent.contextmenus;
        this.id             = getRadomNumAt15();
    }

    Board.SCALE = [0.2, 2];

    Board.prototype = {
        constructor: Board,
        /*
         * @description 绘制关联关系图形
         * @param before 对象，绘制之前需要执行的回调方法集合
         * @param ing    对象，绘制过程中需要执行的回调方法集合
         * @param after  对象，绘制结束后需要执行的回调方法集合
         */
        render: function(before, ing, after) {
            if (before) {
                getBefore.call(this.$parent.$parent, before);
            }

            setSvg.call(this);
            setNodes.call(this);
            setPaths.call(this);
            setForce.call(this);
            renderSvg.call(this);
            renderMarker.call(this);
            isNodeFixed.call(this);

            if (ing) {
                getIng.call(this, ing);
            }

            if (after) {
                getAfter.call(this, after);
            }
        },
        /*
         * @description 根据选择的层级，过滤显示的图形
         * @param layer int 需要显示的最大层级
         */
        toggleByLayer: function(layer) {
            this.svgNodes.style('display', function(item, i){
                if(item.data.layer > layer){
                    return 'none';
                }
            });
            this.svgTexts.style('display', function(item, i){
                if(item.data.layer > layer){
                    return 'none';
                }
            });
            this.svgPaths.style('display', function(item, i){
                if(item.source.data.layer > layer || item.target.data.layer > layer){
                    return 'none';
                }
            });
            return this;
        },
        /*
         * @description 执行放大缩小
         * @param scale float 放大缩小的比例差值
         */
        zoom: function(scale) {
            scale = scale + this.scale;

            if (scale < Board.SCALE[0] || scale > Board.SCALE[1]) {
                return;
            }

            if (!this.viewBox) this.viewBox = this.svgElement.getAttribute('viewBox').split(' ');

            var viewBox = this.svgElement.getAttribute('viewBox').split(' ');

            //原始大小
            var originViewBox2 = parseInt(this.viewBox[2]),
                originViewBox3 = parseInt(this.viewBox[3]);

            //当前位置、大小
            var viewBox0 = parseInt(viewBox[0]),
                viewBox1 = parseInt(viewBox[1]),
                viewBox2 = parseInt(viewBox[2]),
                viewBox3 = parseInt(viewBox[3]);

            //目标变化大小
            viewBox[2] = originViewBox2 / scale;
            viewBox[3] = originViewBox3 / scale;

            //目标变化位置
            viewBox[0] = viewBox0 + (viewBox2 - viewBox[2])/2;
            viewBox[1] = viewBox1 + (viewBox3 - viewBox[3])/2;


            this.svgElement.setAttribute('viewBox', viewBox.join(' '));
            this.scale = scale;
        },
        /*
         * @description 执行上下左右位移
         * @param direction string 决定水平或者垂直方向
         * @param distance float 移动的距离：
         *                       水平方向，大于零向左移动，小于零向右移动
         *                       垂直方向，大于零向下移动，小于零向上移动
         */
        move: function(direction, distance) {
            if (!direction || !distance) return;

            var viewBox = this.svgElement.getAttribute('viewBox').split(' ');

            if (direction === 'horizontal') {
                viewBox[0] = parseInt(viewBox[0]) + distance;
            }
            if (direction === 'vertical') {
                viewBox[1] = parseInt(viewBox[1]) + distance;
            }

            this.svgElement.setAttribute('viewBox', viewBox.join(' '));
        }

    }
    //
    //Board Definition End
    //=====================

    //========================
    //Private Funcs For Board
    //
    /*
     * @description 初始化svg标签
     */
    function setSvg() {
        this.svg = d3.select(this.$parentEle[0])
                        .append("svg")
                        .attr("width", '100%')
                        .attr("height", '100%')
                        .attr('preserveAspectRatio', 'xMidYMid meet');
        this.globalG = this.svg.append('g')
                        // .attr("transform", "translate(0,0)scale(1)")
                        .attr("width", '100%')
                        .attr("height", '100%');
        var def = this.svg.append('defs');
        var filter = def.append('filter')
                        .attr('id', 'svg-shadow-'+this.id)
                        .attr('x', -1)
                        .attr('y', -1)
                        .attr('width', '250%')
                        .attr('height', '250%');
        var feOffset = filter.append('feOffset')
                        .attr('result', 'offOut')
                        .attr('in', 'SourceAlpha')
                        .attr('dx', 1)
                        .attr('dy', 2);
        var feColorMatrix = filter.append('feColorMatrix')
                        .attr('result', 'matrixOut')
                        .attr('in', 'offOut')
                        .attr('values', function(){
                            return "0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.6 0";
                        });
        var feGaussianBlur = filter.append('feGaussianBlur')
                        .attr('result', 'blurOut')
                        .attr('in', 'matrixOut')
                        .attr('stdDeviation', 2);
        var feBlend = filter.append('feBlend')
                        .attr('in', 'SourceGraphic')
                        .attr('in2', 'blurOut')
                        .attr('mode', 'normal');
        this.svgElement = this.$parentEle[0].querySelector('svg');
        this.svgElement.setAttribute('viewBox',
                        0+' '+ 0 +' '+
                        this.svgElement.clientWidth+' '+
                        this.svgElement.clientHeight);
        this.$svgElement = $(this.svgElement);
    }
    /*
     * @description 初始化d3需要的节点数据
     */
    function setNodes() {
        var that = this;
        this.data.forEach(function(item, i){
            that.nodes.push({
                data: item
            });
        });
    }
    /*
     * @description 初始化d3需要的连线数据
     */
    function setPaths() {
        var that = this;
        this.nodes.forEach(function(item, i){
            that.paths = $$setPath(that.paths, item.data);
        });
        function $$setPath(paths, data){
            if (!data.in) return;
            data.in.forEach(function(item, i){
                paths.push({
                    source: item.order,
                    target: data.order
                });
            });
            if (!data.out) return;
            data.out.forEach(function(item, i){
                paths.push({
                    source: data.order,
                    target: item.order
                });
            });
            return paths;
        }
    }
    /*
     * @description 初始化d3的力学图，绑定位置更新事件
     */
    function setForce() {
        var that = this;

        this.force = d3.layout.force()
                    .nodes(this.nodes)
                    .links(this.paths)
                    .size([this.svgElement.clientWidth, this.svgElement.clientHeight])
                    .linkDistance(100)
                    .linkStrength(1)
                    .charge(-25000)
                    .gravity(1);

        this.force.on("tick", function(){ //对于每一个时间间隔
            //更新连线坐标
            that.svgPaths.attr("x1",function(d){ return d.source.x; })
                .attr("y1",function(d){ return d.source.y; })
                .attr("x2",function(d){ return d.target.x; })
                .attr("y2",function(d){ return d.target.y; });
            that.svgPaths.attr("d", function(d){
                return drawLineArrow(d.source.x, d.source.y, d.target.x, d.target.y);
            });
            //更新节点坐标
            // that.svgNodes.attr("cx",function(d){ return d.x; })
            //     .attr("cy",function(d){ return d.y; });
            that.svgNodes.attr("x",function(d){ return d.x; })
                .attr("y",function(d){ return d.y; });

            // 更新文字坐标
            that.svgTexts.attr("x", function(d){ return d.x; })
               .attr("y", function(d){ return d.y; });
        });


        this.nodes[0].x = this.svgElement.clientWidth/2;
        this.nodes[0].y = this.svgElement.clientHeight/2;
        this.nodes[0].fixed = true;

        this.force.start();

        return this;
    }
    /*
     * @description 使用d3，用处理好的节点数据与连线数据绘制成svg图像
     */
    function renderSvg() {
        var that = this,
            svgNodes, svgPaths, svgTexts, e,
            drag = d3.behavior.drag()
            .on('dragstart', function(node) {
                e = d3.event.sourceEvent;
                if (e.target.tagName === 'rect') {
                    e.stopPropagation();
                }
            })
            .on('drag', function(d) {
                if (e.target.tagName === 'rect') {
                    d.px = d3.event.x;
                    d.py = d3.event.y;
                    that.force.resume();
                }
            }),
            // drag = this.force.drag(),
            zoom = d3.behavior.zoom().scaleExtent([0.2, 3]).duration(150)
            .on('zoom', function() {
                that.globalG.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            });


        svgPaths = this.globalG.selectAll("path")
                .data(that.paths)
                .enter()
                .append("path")
                .attr("d", function(item, i){
                    //绘制箭头
                    return drawLineArrow(item.source.x, item.source.y, item.target.x, item.target.y);
                })
                .attr("id", function(item, i){
                    //添加每条连线的id
                    return getRadomNumAt15() + "-i-path-" + item.source.index+'-'+item.target.index;
                })
                .attr('class', function(item, i) {
                    //添加连线的class
                    return 'i-path-'+that.id;
                })
                .style("stroke", function(){
                    //设置连线的颜色
                    return that.option.color.pathColor;
                })
                .style("stroke-width", that.option.lineStrokeWidth);  //连线的宽度
        svgNodes = this.globalG.selectAll("rect")
                .data(that.nodes)
                .enter()
                .append("rect")
                .attr('width', function(item, i){
                    //矩形的宽
                    return 2*that.option.radius;
                })
                .attr('height', function(item, i){
                    //矩形的高
                    return 2*that.option.radius;
                })
                .attr('x', function(item, i){
                    //矩形的位置x
                    return item.x;
                })
                .attr('y', function(item, i){
                    //矩形的位置y
                    return item.y;
                })
                .attr("id", function(item, i){
                    return getRadomNumAt15() + "-i-point-" + item.index;
                })
                .attr('class', function(item, i) {
                    return 'i-node-'+that.id;
                })
                .attr("filter", function(){
                    //矩形的阴影
                    return "url(#svg-shadow-"+that.id+")";
                })
                .style("fill",function(item,i){
                    //矩形的颜色
                    return that.option.color.nodeColors[(item.data.layer-1)%that.option.color.nodeColors.length];
                })
                .call(drag);  //拖拽开始生效

        svgTexts = this.globalG.selectAll("text")
                .data(that.nodes)
                .enter()
                .append("text")
                .style("fill", "black")
                .attr("dx", function(item, i){
                    return that.option.radius;
                })
                .attr("dy", function(item, i){
                    return that.option.radius;
                })
                .text(function(item, i){
                    //文字内容
                    return item.data.name;
                });

        this.svg.call(zoom);
        this.svg.call(drag);

        this.svgNodes = svgNodes;
        this.svgPaths = svgPaths;
        this.svgTexts = svgTexts;
        this.drag     = drag;
        return this;
    }
    /*
     * @description 初始化高亮标记marker
     */
    function renderMarker() {
        if (!this.locationMarker) {
            this.locationMarker = new LocationMarker(this, this.option.color.markerColor);
        }
    }
    /*
     * @description 根据参数，设置节点是否静止
     */
    function isNodeFixed() {
        if (this.option.isNodeFixed) {
            for (var len = this.nodes.length, i = len*len; i > 0; i --) {
                this.force.tick();
            }
            this.nodes.forEach(function(item) {
                item.fixed = true;
            });
        }
        else {
            this.nodes[0].fixed = false;
        }
    }
    /*
     * @description 执行before中的所有回调
     */
    function getBefore(before) {
        var that = this;
        for (var func in before) {
            if (typeof before[func] === 'function') {
                before[func].call(this);
            }
        }
    }
    /*
     * @description 执行ing中的所有回调
     */
    function getIng(ing) {
        var that = this;
        var updateNodes = this.svg.selectAll("rect").data(this.nodes);

        updateNodes.attr('width', function(item, i){
                    var weight = $$getWeight(ing.setWeight, item.data),
                        width;

                    if (ing.setWidth) width  = ing.setWidth(item.data);

                    if (width) {
                        return 2*width*weight;
                    }

                    return 2*that.option.radius*weight;
                })
                .attr('height', function(item, i){
                    var weight = $$getWeight(ing.setWeight, item.data),
                        height;

                    if (ing.setHeight) height  = ing.setHeight(item.data);

                    if (height) {
                        return 2*height*weight;
                    }

                    return 2*that.option.radius*weight;
                })
                .attr('rx', function(item, i) {
                    var result;
                    if (ing.setCircle) {
                        result = ing.setCircle(item.data);
                        if (result === undefined || result === 1) {
                            return;
                        }
                        else if (result === 0) {
                            var weight = $$getWeight(ing.setWeight, item.data);
                            d3.select(this).attr('width', 2*that.option.radius*weight);
                            return 2*that.option.radius*weight;
                        }
                        else if (result && (typeof result === 'number')) {
                            d3.select(this).attr('width', 2*result);
                            return 2*result;
                        }
                        else if (result
                            && (Object.prototype.toString.call(result) === '[object Array]')
                            && (result.length === 2)) {
                            d3.select(this).attr('width', 2*result[0]);
                            return 2*result[0];
                        }
                    }
                })
                .attr('ry', function(item, i) {
                    var result;
                    if (ing.setCircle) {
                        result = ing.setCircle(item.data);
                        if (result === undefined || result === 1) {
                            return;
                        }
                        else if (result === 0) {
                            var weight = $$getWeight(ing.setWeight, item.data);
                            d3.select(this).attr('height', 2*that.option.radius*weight);
                            return 2*that.option.radius*weight;
                        }
                        else if (result && (result === 'number')) {
                            d3.select(this).attr('height', 2*result);
                            return 2*result;
                        }
                        else if (result && (result.length === 2)) {
                            d3.select(this).attr('height', 2*result[1]);
                            return 2*result[1];
                        }
                    }
                })
                .attr('transform', function(item, i) {
                    if (ing.setNodeOffset) {
                        var $this = d3.select(this);
                        var detail = {
                            width :  $this.attr('width'),
                            height:  $this.attr('height'),
                            rx    :  $this.attr('rx'),
                            ry    :  $this.attr('ry'),
                            radius:  that.option.radius
                        };
                        var offset = ing.setNodeOffset(item.data, detail);
                        if (offset && (offset.length === 2)) {
                            return 'translate('+offset[0]+' '+offset[1]+')';
                        }
                    }
                });

        var updateTexts = this.svg.selectAll("text").data(this.nodes);
        updateTexts.style("fill", function(item, i) {
                    if (ing.setTextColor) {
                        return ing.setTextColor(item.data);
                    }
                    return 'black';
                })
                .attr('transform', function(item, i) {
                    if (ing.setTextOffset) {
                        var $this = d3.select(this);
                        var detail = {
                            width :  $this.attr('width'),
                            height:  $this.attr('height'),
                            rx    :  $this.attr('rx'),
                            ry    :  $this.attr('ry'),
                            radius:  that.option.radius
                        };
                        var offset = ing.setTextOffset(item.data, detail);
                        if (offset && (offset.length === 2)) {
                            return 'translate('+offset[0]+' '+offset[1]+')';
                        }
                    }
                });
        if (ing.customize) {
            for(var func in ing.customize) {
                if (typeof ing.customize[func] === 'function') {
                    ing.customize[func].call(this);
                }
            }
        }
    }
    /*
     * @description 执行after中的所有回调
     */
    function getAfter(after) {
        var that = this;

        var dblclick = true,
            dblclickTimer = null;

        //====================================
        //执行clickNode方法
        //================
        //包含区别click事件和dblclick实际的判断
        //
        if (after.clickNode && typeof after.clickNode === 'function') {
            this.$svgElement.on('click.node.ix.LinkRelation', '.i-node-'+this.id, function(e) {
                if (dblclickTimer === null) {
                    dblclickTimer = setTimeout(function() {
                        dblclick = false;

                        //================
                        //实际执行click事件
                        //
                        e.preventDefault();
                        try {
                            var node;
                            if (e.target.tagName === 'rect') {
                                node = d3.select(e.target).data();
                            }
                            if( after.clickNode.call(that, e, node && node[0]) === 'stopPropagation') {
                                e.stopPropagation();
                            }
                        }
                        catch(err) {
                            throw ('error: ' + err);
                        }

                        //
                        //click事件执行结束
                        //==================

                        clearTimeout(dblclickTimer);
                        dblclickTimer = null;
                        dblclick = true;
                    }, 250);
                }
                else{
                    if (dblclick) {
                        clearTimeout(dblclickTimer);
                        dblclickTimer = null;
                        return;
                    }
                }
            });
        }
        //
        //执行clickNode方法结束
        //=====================

        //=====================
        //执行dblclickNode方法
        //
        if (after.dblclickNode && typeof after.dblclickNode === 'function') {
            this.$svgElement.on('dblclick.node.ix.LinkRelation', '.i-node-'+this.id, function(e) {
                e.preventDefault();
                try {
                    var node;
                    if (e.target.tagName === 'rect') {
                        node = d3.select(e.target).data();
                    }
                    if (after.dblclickNode.call(that, e, node && node[0], that.locationMarker) === 'stopPropagation') {
                        e.stopPropagation();
                    }
                }
                catch(err) {
                    throw ('error: ' + err);
                }
            })
        }
        //
        //执行dblclickNode方法结束
        //========================

        if (after.clickPath && typeof after.clickPath === 'function') {
            this.$svgElement.on('click.path.ix.LinkRelation', '.i-path-'+this.id, function(e) {
                if (dblclickTimer === null) {
                    dblclickTimer = setTimeout(function() {
                        dblclick = false;

                        //================
                        //实际执行click事件
                        //
                        e.preventDefault();
                        try {
                            var path, isExchangable = $$checkPathIsExchangable.call(that, e);
                            if( after.clickPath.call(that, e, path, isExchangable) === 'stopPropagation') {
                                e.stopPropagation();
                            }
                        }
                        catch(err) {
                            throw ('error: ' + err);
                        }

                        //
                        //click事件执行结束
                        //==================

                        clearTimeout(dblclickTimer);
                        dblclickTimer = null;
                        dblclick = true;
                    }, 250);
                }
                else{
                    if (dblclick) {
                        clearTimeout(dblclickTimer);
                        dblclickTimer = null;
                        return;
                    }
                }
            })
        }

        //=====================
        //执行dblclickPath方法
        //
        if (after.dblclickPath && typeof after.dblclickPath === 'function') {
            this.$svgElement.on('dblclick.path.ix.LinkRelation', '.i-path-'+this.id, function(e) {
                e.preventDefault();
                try {
                    var path, isExchangable = $$checkPathIsExchangable.call(that, e);
                    if (after.dblclickPath.call(that, e, path, isExchangable, that.locationMarker) === 'stopPropagation') {
                        e.stopPropagation();
                    }
                }
                catch(err) {
                    throw ('error: ' + err);
                }
            })
        }
        //
        //执行dblclickPath方法结束
        //========================

        //========================
        //执行节点右键事件
        if (after.contextmenuNode && typeof after.contextmenuNode === 'function') {
            this.$svgElement.on('contextmenu', function(e) {
                e.preventDefault();
                if ((e.target.tagName === 'rect') && that.contextmenus['rect']) {
                    var node = d3.select(e.target).data()[0];

                    after.contextmenuNode.call(that, e, that.contextmenus['rect'], node);
                }
            });
        }
        //========================

        //========================
        //执行连线右键事件
        if (after.contextmenuPath && typeof after.contextmenuPath === 'function') {
            this.$svgElement.on('contextmenu', 'path', function(e) {
                e.preventDefault();
                if ((e.target.tagName === 'path') && that.contextmenus['path']) {
                    var path = d3.select(e.target).data()[0],
                        isExchangable = $$checkPathIsExchangable.call(that, e);

                    after.contextmenuPath.call(that, e, that.contextmenus['path'], path, isExchangable);
                }
            });
        }
        //========================

        if (after.customize) {
            for(var func in after.customize) {
                if (typeof after.customize[func] === 'function') {
                    after.customize[func].call(this);
                }
            }
        }
    }
    /*
     * @description 检查是否是双向连线
     */
    function $$checkPathIsExchangable(e) {
        var isExchangable = false,
            that = this;
        if (e.target.tagName === 'path') {
            var path = d3.select(e.target).data()[0];
            var tmpObj = {
                source: path.target.index,
                target: path.source.index
            };
            that.paths.forEach(function(item, i) {
                if( (item.source.index === tmpObj.source)
                    && (item.target.index === tmpObj.target)) {
                    isExchangable = true;
                }
            })
        }
        return isExchangable;
    }

    /*
     * @description 检查是否有设置权重的方法，有则执行并返回权重，没有则返回默认权重1
     * @params setWeight ing中的setWeight方法
     * @params data 节点数据
     */
    function $$getWeight(setWeight, data) {
        if (setWeight) {
            var weight = setWeight(data);
            return weight > 2 ? 2 : (weight < 0.5 ? 0.5 : weight);
        }
        else {
            return 1;
        }
    }
    /*
     * @description 绘制连线的上的箭头
     * @param x1,y1 float 连线一端的坐标
     * @param x2,y2 float 连线另一端的坐标
     */
    function drawLineArrow(x1,y1,x2,y2) {
        var path;
        var slopy,cosy,siny;
        var Par=10.0;
        var x3,y3;
        slopy=Math.atan2((y1-y2),(x1-x2));
        cosy=Math.cos(slopy);
        siny=Math.sin(slopy);

        path="M"+x1+","+y1+" L"+x2+","+y2;

        x3=(Number(x1)+Number(x2))/2;
        y3=(Number(y1)+Number(y2))/2;

        path +=" M"+x3+","+y3;

        path +=" L"+(Number(x3)+Number(Par*cosy-(Par/2*siny)))+","+(Number(y3)+Number(Par*siny+(Par/2*cosy)));

        path +=" M"+(Number(x3)+Number(Par*cosy+Par/2*siny))+","+ (Number(y3)-Number(Par/2*cosy-Par*siny));
        path +=" L"+x3+","+y3;

        return path;
    }
    /*
     * @description 生成15位的随机数
     */
    function getRadomNumAt15(){
        var t = '';
        for(var i = 0; i < 15; i ++){
            t += Math.floor(Math.random() * 10);
        }
        return t;
    }
    //
    //Private Funcs For Board End
    //============================

    //==========================
    //LocationMarker Definition
    //
    var LocationMarker = function(parent, color) {
        this.parent     = parent;

        if (color) this.color = color;
        else this.color = '#ff0017';

        this.element = d3.select(parent.svg[0][0]).append('path')
                        .attr('fill', this.color)
                        .attr('stroke', this.color)
                        .attr('stroke-width', 2)
                        .style('display', 'none');
    }

    LocationMarker.prototype = {
        constructor: LocationMarker,
        /*
         * @description 显示marker
         * @param position 包含x和y的坐标，为了兼容event对象，接收的对象一定要包含clientX和clientY属性
         *                 在高亮节点时，为了能显示到节点的中心，建议使用节点的x和y来拼成position对象
         */
        show: function(position) {
            if (!position) return;
            var x = position.clientX, y = position.clientY, that = this;
            this.element
                .attr('d', function() {
                    // return 'M'+x+' '+y+' L'+(x-7)+' '+(y-10)+'Q '+x+' '+(y-24)+' '+(x+7)+' '+(y-10)+' Z';
                    return 'M'+x+' '+y+' L'+(x-8)+' '+(y-10)+' L'+(x-8)+' '+(y-20)+' L'+(x+8)+' '+(y-20)+' L'+(x+8)+' '+(y-10)+' Z';
                    // return 'M'+x+' '+y+' L'+(x-8)+' '+(y-10)+' L'+(x-8)+' '+(y-10.5)+' Q '+x+' '+(y-22.5)+' '+(x+8)+' '+(y-10.5)+' L'+(x+8)+' '+(y-10)+' Z';
                })
                .style('display', 'block');
        },
        /*
         * @description 隐藏marker
         */
        hide: function() {
            this.element.style('display', 'none');
        },
        /*
         * @description 当节点移动时，使marker保持跟随指定的节点
         * @param node 节点数据，follow只能针对节点使用
         */
        follow: function(node) {
            var that = this;
            this.show({
                clientX: node.x,
                clientY: node.y
            });
            this.parent.drag.on('drag', function(item) {
                if (item.index === node.index) {
                    var position = {
                        clientX: node.x,
                        clientY: node.y
                    }
                    that.show(position);
                }
            });
        }
    }
    //
    //LocationMarker Definition End
    //==============================

    //==================
    //Plugin Definition
    //
    function Component(option, cbs) {
        var $this = $(this),
            data = $this.data('ix.LinkRelation'),
            options = $.extend({}, data && data.option, typeof option === 'object' && option);

        if (!data) {
            $this.data('ix.LinkRelation', new LinkRelation(this, options, cbs));
            data = $this.data('ix.LinkRelation');
        }
        return data;
    }

    $.fn.ixLinkRelation = Component;
    //
    //Plugin Definition End
    //======================


    //==========================
    //ContextMenu Definition
    //
    var ContextMenu = function($element) {
        this.$element = $element;
        this.$ul      = $element.find('ul');
    }

    ContextMenu.DATANAME = 'context-menu-list';

    ContextMenu.prototype = {
        constructor: ContextMenu,
        /*
         * @description 打开右键菜单
         * @param position {float, float} 右键菜单打开的位置，可以直接传入js标准事件对象，
        *                                 也可以是含有clientX和clientY属性的对象
         * @param autoClose boolean 是否在任意点击事件发生时自动关闭
         */
        open: function(position, autoClose) {
            var e;
            if (position && (position.type === 'contextmenu')) {
                e = position;
                position = {
                    left: e.clientX,
                    top: e.clientY
                }
            }

            position.hasOwnProperty('left') && position.hasOwnProperty('top')
                && this.$element.css(position).show();

            if (autoClose || (autoClose === undefined)) {
                var that = this;
                $(d).on('click', function() {
                    that.close();
                });
            }

            return this;
        },
        /*
         * @description 关闭右键菜单
         */
        close: function() {
            this.$element.hide();
            return this;
        }
    }
    //
    //ContextMenu Definition End
    //==============================

    //==========================
    //ScreenSwitch Definition
    //
    var ScreenSwitch = function(linkRelation) {
        this.linkRelation  = linkRelation;
        this.$indicator    = (function() {
            var $indicator = $('<div class="screen-indicator"></div>'),
                $ul        = $('<ul></ul>');
            $indicator.append($ul);
            return $indicator;
        })();
        this.$lis          = null;

        this.linkRelation.$element.append(this.$indicator);

        this.refresh(0);
    }

    ScreenSwitch.prototype = {
        constructor: ScreenSwitch,
        /*
         * @description 初始化一个切换section的list
         *              在初始化过程中，初始化每个linkItem的section的z-Index为0
         *              每次调用时，删除之间的事件绑定，删除indicator子节点，全部重新生成、绑定
         * @param       index为初始化ScreenSwitch时设置默认active为第i个section，从0开始
         */
        refresh: function(index) {
            var linkItems = this.linkRelation.linkItems,
                $ul       = this.$indicator.find('ul')
                this.$lis = [];

            offEventOfIndicator.call(this);
            $ul.empty();

            for(var i = 0, len = linkItems.length; i < len; i ++) {
                var $li = $(d.createElement('li'));
                $li.attr('data-slide-to', i);
                $li.data('target', linkItems[i].$element);
                $ul.append($li);

                this.$lis.push($li);
            }

            addEventToIndicator.call(this);
            this.$lis[index] && this.$lis[index].trigger('click', index);

        }
    }
    /*
     * @description 给indicator绑定切换事件
     */
    function addEventToIndicator() {
        var that = this;

        this.$indicator.on('click', 'li', function(e, index) {
            var $this = $(this);
            that.$lis.forEach(function($li, i) {
                if (index === undefined) {
                    index = parseInt($this.attr('data-slide-to'));
                }
                if (i !== index) $li.removeClass('active').data('target').css('display', 'none');
                else $li.addClass('active').data('target').css('display', 'block');
            });
        });
    }
    /*
    * @description 将indicator绑定的事件移除
    */
    function offEventOfIndicator() {
        this.$indicator.off('click');
    }
    //
    //ScreenSwitch Definition End
    //==============================


})(jQuery, window, document, window.Notify);

// var links = [ { source : {value:obj1, writable: true} , target:{value:obj2, writable: true}, obj1: obj1, obj2: obj2} , 
// { source :{value:obj1, writable: true}, target:{value:obj3, writable: true}, obj1: obj1, obj3:obj3} ,
// { source :{value:obj1, writable: true}, target:{value:obj4, writable: true}, obj1: obj1, obj4: obj4} , 
// { source :{value:obj2, writable: true}, target:{value:obj5, writable: true}, obj2: obj2, obj5: obj5} ,
// { source :{value:obj2, writable: true}, target:{value:obj6, writable: true}, obj2: obj2, obj6: obj6} , 
// { source :{value:obj2, writable: true}, target:{value:obj7, writable: true}, obj2: obj2, obj7: obj7} ];