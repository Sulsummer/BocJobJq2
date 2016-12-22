$(function() {
    'use strict';
    var a = $('.db').ixLinkRelation({
        baseURL: '../data3.txt',
        defaultShowLayer: 1
    },
     {
        after: {
            // contextmenuNode: function(e) {
            //     arguments[1].open(e)
            // }
            dblclickNode: function(e, node, lm) {
                lm.follow(node)
            },
            contextmenuNode: function(e, menu, data) {
                menu.open(e);
                console.log(menu);
                menu.$ul.on('click', 'li.new', function() {
                    a.addNewItem({
                    });
                })
            }
        }
    });
    a.addNewItem();

    // setTimeout(function() {
    //     a.enterFullWindow();
    // }, 5000);
    // setTimeout(function() {
    //     a.exitFullWindow();
    // }, 15000);

});

