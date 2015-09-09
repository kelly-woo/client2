/**
 * @fileoverview viewport 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('Viewport', Viewport);

  /* @ngInject */
  function Viewport() {
    var Viewport = {
      init: init,
      updateList: updateList,
      render: render,
      remove: remove,

      getItem: getItem,
      getItemElement: getItemElement,
      getPosition: getPosition,
      getFocusableScrollTop: getFocusableScrollTop,
    };

    return {
      /**
       * Viewport factory
       * @param {object} jqViewport
       * @param {object} jqList
       * @param {object} options
       * @returns {*}
       */
      create: function(jqViewport, jqList, options) {
        return Object.create(Viewport).init(jqViewport, jqList, options);
      }
    };
    /**
     * init
     * @param {object} jqViewport
     * @param {object} jqList
     * @param {object} options
     * @param {number} options.viewportHeight     - viewport의 height
     * @param {number} options.viewportMaxHeight  - viewport의 최대 height
     * @param {number} options.itemHeight         - item의 height
     * @param {array} options.list                - list data
     * @param {number} options.bufferLength       - 자연스러운 scroll을 위해 여분으로 생성될 item 수
     * @param {function} options.onCreateItem     - 특정 dom element가 생성된 후 수행할 callback
     * @param {function} options.onRendered       - viewport에 노출될 dom element가 전부 생성된 후 수행할 callback
     * @returns {init}
     */
    function init(jqViewport, jqList, options) {
      var that = this;

      that.renderedMap = {};

      that.jqViewport = jqViewport;
      that.jqViewport.css({position: 'relative'});
      that.jqList = jqList;

      that.options = {
        viewportHeight: 0,
        itemHeight: 25,
        list: [],
        bufferLength: 10
      };

      _.extend(that.options, options);

      // viewportMaxHeight가 입력되지 않았다면 viewportHeight를 maxHeight로 사용한다.
      // viewportMaxHeight가 입력되지 않으면 고정된 viewportHeight를 제공한다.
      that.options.viewportMaxHeight == null && (that.options.viewportMaxHeight = that.options.viewportHeight);

      return that;
    }

    /**
     * viewport에 노출되어야 할 item의 position을 전달한다.
     * @returns {{
     *  oriBeginIndex : bufferLength option 제외한 begin index,
     *  oriEndIndex   : bufferLength options 제외한 end index,
     *  beginY        : viewport에 노출된 list의 begin y position(list의 시작점 0을 기준으로함),
     *  endY          : viewport에 노출된 list의 end y position(list의 시작점 0을 기준으로함),
     *  beginIndex    : bufferLength options을 포함한 begin index,
     *  endIndex      : bufferLength options을 포함한 end index}}
     */
    function getPosition() {
      var that = this;
      var options = that.options;
      var listLength = that.options.list.length;
      var beginY = 0;
      var endY = 0;
      var oriBeginIndex;
      var beginIndex;
      var oriEndIndex;
      var endIndex;

      if (listLength > 0) {
        beginY = that.jqViewport.scrollTop() || 0;
        endY = beginY + options.viewportHeight;

        oriBeginIndex = Math.floor(beginY / options.itemHeight);
        beginIndex = oriBeginIndex - options.bufferLength;
        beginIndex = beginIndex < 0 ? 0 : beginIndex;

        oriEndIndex = Math.floor(endY / options.itemHeight);
        endIndex = oriEndIndex + options.bufferLength;
        endIndex = endIndex >= listLength ? listLength - 1 : endIndex;

        if (beginIndex < 0) {
          beginIndex = 0;
        }

        if (endIndex > listLength) {
          endIndex = listLength - 1;
        }

        beginY = beginY - options.bufferLength * options.itemHeight;
        if (beginY < options.itemHeight) {
          beginY = 0;
        }

        endY = options.listHeight - beginY - ((endIndex - beginIndex) * options.itemHeight);
        if (endY > options.listHeight) {
          beginY = options.listHeight - (endIndex - beginIndex) * options.itemHeight;
        } else if (endY < 0) {
          beginY = beginY + endY;
          endY = 0;
        }
      }

      return {
        oriBeginIndex: oriBeginIndex,
        oriEndIndex: oriEndIndex,
        beginY: beginY,
        endY: endY,
        beginIndex: beginIndex,
        endIndex: endIndex
      };
    }

    /**
     * viewport에 출력될 list를 갱신한다.
     * @param {array} list
     * @returns {updateList}
     */
    function updateList(list) {
      var that = this;
      var options = that.options;

      options.list = list;
      options.listHeight = list.length * options.itemHeight;
      that.jqList.empty().css('height', options.listHeight);

      options.viewportHeight = options.listHeight > options.viewportMaxHeight ? options.viewportMaxHeight : options.listHeight;
      that.jqViewport.css('height', options.viewportHeight);

      // list 갱신시 이전에 생성된 dom element는 삭제한다.
      that.remove();

      that.renderedMap = {};
      that.prevRenderList = [];

      return that;
    }

    /**
     * viewport에 dom element를 rednering
     * @param {object} position - viewport에서 생성해야할 position
     * @param {array} elements  - dom element를 생성할 html 문자열 array
     */
    function render(position, elements) {
      var that = this;
      var map = that.renderedMap;
      var renderList = [];

      _.each(elements, function(element, index) {
        index = position.beginIndex + index;
        if (map[index] == null) {
          map[index] = $(element).appendTo(that.jqList).css({top: index * that.options.itemHeight}).data('viewport-index', index);
          that.options.onCreateItem && that.options.onCreateItem(map[index], that.options.list[index]);
        }

        renderList.push(index);
      });

      // 이전에 생성된 dom element 중 현재 보여져야할 position에 포함되지 않았다면 삭제를 수행한다.
      _.each(that.prevRenderList, function(value) {
        if (position.beginIndex > value || position.endIndex < value) {
          that.remove(value);
        }
      });

      that.prevRenderList = renderList;

      that.options.onRendered && that.options.onRendered();
    }

    /**
     * focus 되야할 element의 scroll top 값을 전달한다.
     * @param {number} index
     * @returns {*}
     */
    function getFocusableScrollTop(index) {
      var that = this;

      var viewportScrollTop = that.jqViewport.scrollTop() || 0;
      var viewportHeight = that.options.viewportHeight;
      var viewportTop = that.jqViewport.offset().top;

      var itemHeight = that.options.itemHeight;
      var itemTop = index * that.options.itemHeight + viewportTop - viewportScrollTop;

      var compare = itemTop - viewportTop;
      var scrollTop;

      if (compare < 0) {
        // 위로 가기

        scrollTop = viewportScrollTop + compare;
      } else if (compare + itemHeight > viewportHeight) {
        // 밑으로 가기

        scrollTop = viewportScrollTop + compare - viewportHeight + itemHeight;
      }

      return scrollTop;
    }

    /**
     * 생성된 dom element를 viewport에서 보여지지 않도록 삭제한다.
     * @param {number}index
     */
    function remove(index) {
      var that = this;
      var map = that.renderedMap;

      if (_.isNumber(index)) {
        map[index].remove();
        delete map[index];
      } else {
        for (index in map) {
          if (map.hasOwnProperty(index)) {
            map[index].remove();
            delete map[index];
          }
        }
      }
    }

    /**
     * 특정 index에 해당하는 dom element를 전달한다.
     * @param {number} index
     * @returns {*}
     */
    function getItemElement(index) {
      return this.renderedMap[index];
    }

    /**
     * list 또는 list의 특정 item data(dom element 아님)를 전달한다.
     * @param {number} index
     * @returns {*}
     */
    function getItem(index) {
      var that = this;

      return _.isNumber(index) ? that.options.list[index] : that.options.list;
    }
  }
})();
