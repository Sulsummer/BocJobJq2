;(function($, w, d) {
    'use strict';
    w.http = function(url, params, method) {
        if (!url) {
            // $.errorNotify('请求URl为空，请检查');
            return ;
        }
        if (!method) {
            method = 'get';
        }
        return $.ajax({
            url: url,
            method: method,
            data: params
        });
    }

    $.ajaxSetup({
        dataFilter: function(data) {
            return JSON.parse(data);
        }
    });
})(jQuery, window, document);