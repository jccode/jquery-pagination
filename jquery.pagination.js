/**
 * jQuery分页插件

usage sample
============

HTML
----
<div id="page"></div>

javascript
----------
 $("#page").pagination({
     className: "pagination-right", 
     page: pageNo, 
     count: totalCount, 
     callback: function (current_page, new_page) {
         var condition = {
             pageNo: new_page
         };
         initList(condition);
     }, 
     refresh: false
 });

 * @author jcchen
 * @depend jQuery && bootstrap
 */

;(function ($) {

    // Define Constants
    var CLASS_NUM = "page-num", 
        CLASS_PREV = "page-prev", 
        CLASS_NEXT = "page-next";

    /**
     * Entry
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    var Pagination = function ($el, options) {
        this.$el = $el;
        this.options =  $.extend({}, $.fn.pagination.defaults, options);
        this.init();
    };

    Pagination.prototype = {
        init: function() {
            //this.render();
            this.$el.data("page", this.options.page); // save current page number
            this.bindEvent();
        },
        bindEvent: function() {
            var $el = this.$el,
                opts = this.options;
            $el.on("click", function (e) {

                var $target = $(e.target), 
                    currentPage = $el.data("page");

                // number
                if($target.hasClass(CLASS_NUM)) { 
                    clickHandler(currentPage, $target.html());
                }

                // prev
                else if($target.hasClass(CLASS_PREV)) {
                    if(currentPage > 1)
                        clickHandler(currentPage, parseInt(currentPage)-1);
                }

                // next
                else if($target.hasClass(CLASS_NEXT)) {
                    if(currentPage < opts.count) 
                        clickHandler(currentPage, parseInt(currentPage)+1);
                }

                return false;
            });
        }, 
        render: function(opts) {
            var opts = $.extend(this.options, opts);
            this.$el.data("page", opts.page); // save current page number
            this.$el.html(buildHTML(this.$el, opts));
            setActive(this.$el);
        }
    };
    
    
    /**
     * 构建HTML
     * @param  {object} opts [description]
     * @return {string}      [description]
     */
    function buildHTML ($el, opts) {
        // total page less than 1, don't show pagination.
        if(opts.count <= 1) return "";

        // build item list
        var itemList = [], 
            page = parseInt($el.data("page")), 
            num = Math.min(opts.num, opts.count), 
            region = pageRegion(page, num, opts.count);

        itemList.push(buildItem(CLASS_PREV, opts.title.prev));
        for(var i = region.start; i <= region.end; i++) {
            itemList.push(buildItem(CLASS_NUM, i));
        }
        itemList.push(buildItem(CLASS_NEXT, opts.title.next));

        // build body
        var result = 
            Template.body
                .replace("${className}", opts.className)
                .replace("${itemList}", itemList.join(""));

        return result;
    }

    function clickHandler(currentPage, newPage) {
        var pagination = $(document).data("pagination");
            $el = pagination.$el, 
            opts = pagination.options;
        $el.data("page", newPage);
        if(!opts.refresh) {
            pagination.render({
                "page": newPage
            });
        }
        opts.callback && opts.callback.call(null, currentPage, newPage);
    }

    /**
     * 构建单个元素
     * @param  {string} clazz  样式名
     * @param  {string} text    分页标签显示的内容
     * @return {string}        innerHTML
     */
    function buildItem(clazz, text) {
        var result =  
            Template.item
                .replace("${className}", clazz)
                .replace(/\${text}/g, text);

        return result;
    }

    /**
     * 计算页码区间
     * @param  {number} page     当前页码
     * @param  {number} num      页码显示的个数
     * @param  {number} count    总页码数
     * @return {[type]}          [description]
     */
    function pageRegion (page, num, count) {
        var boundary = Math.ceil(num / 2), 
            region;
        if(page <= boundary) {
            region = {
                start: 1, 
                end: num
            };

        } else {
            var left = boundary, 
                right = num - left;

            if(page + right >= count) {
                region = {
                    start: count - num + 1, 
                    end: count
                }
            } else {
                region = {
                    start: page - left + 1, 
                    end: page + right
                }
            }
        }
        return region;
    }

    /**
     * 设置当前激活的页码
     * @param {[type]} argument [description]
     */
    function setActive ($el) {
        var page = $el.data("page");
        $(".pagination > ul > li", $el).removeClass( "active" );
        $("." + CLASS_NUM + "[idx=" + page + "]", $el).parent().addClass( "active" );
    }

    /**
     * 模板
     * @type {Object}
     */
    var Template = {
        
        body: '\
                <div class="pagination ${className}">\
                    <ul>\
                        ${itemList}\
                    </ul>\
                </div>\
                ', 

        item: '<li><a href="#" class="${className}" idx="${text}">${text}</a></li>'
    };



    $.fn.pagination = function (options) {
        var $doc = $(document),
            instance = $doc.data("pagination");
        if(!instance) $doc.data("pagination", (instance = new Pagination($(this), options)));
        instance.render({
            page: options.page,
            count: options.count
        });
    };

    $.fn.pagination.Constructor = Pagination;


    /**
     * 默认Options
     * @type {Object}
     */
    $.fn.pagination.defaults = {
        page: 1,                // require. current page no. default is 1.
        count: 1,               // require. total page count
        callback: $.noop(),     // require. callbak when click
        num: 5,                 // how many number shows
        className: "",              // additional class name
        refresh: true,          // whether refresh when page no changes. Typically, this value set false when using ajax.
        title: {                // title of the previous btn & next btn.
            prev: "&laquo;",          // "«"
            next: "&raquo;"           // "»"
        }
    }

})(jQuery);
