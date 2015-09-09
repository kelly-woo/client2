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

      getList: getList,
      getPosition: getPosition
    };

    return {
      create: function(jqViewport, jqList, options) {
        return Object.create(Viewport).init(jqViewport, jqList, options);
      }
    };

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
        listHeight: 0,
        bufferLength: 10
      };

      _.extend(that.options, options);

      //updateList.call(that, options.list);
      that.options.viewportMaxHeight == null && (that.options.viewportMaxHeight = that.options.viewportHeight);

      return that;
    }

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
        oriEndIndex = Math.floor(endY / options.itemHeight);
        endIndex = oriEndIndex + options.bufferLength;

        if (beginIndex < 0) {
          beginIndex = 0;
        }

        if (endIndex > listLength) {
          endIndex = listLength;
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

    function updateList(list) {
      var that = this;
      var options = that.options;

      options.list = list;
      options.listHeight = list.length * options.itemHeight;
      that.jqList.empty().css('height', options.listHeight);

      options.viewportHeight = options.listHeight > options.viewportMaxHeight ? options.viewportMaxHeight : options.listHeight;
      that.jqViewport.css('height', options.viewportHeight);

      that.remove();
      that.renderedMap = {};
      that.prevRenderList = [];

      return that;
    }

    function render(position, elements) {
      var that = this;
      var map = that.renderedMap;
      var renderList = [];

      _.each(elements, function(element, index) {
        index = position.beginIndex + index;

        if (map[index] == null) {
          map[index] = $(element).appendTo(that.jqList).css({top: index * that.options.itemHeight});
          that.options.onCreateItem && that.options.onCreateItem(map[index], that.options.list[index]);
        }

        renderList.push(index);
      });

      _.each(that.prevRenderList, function(value) {
        if (position.beginIndex > value || position.endIndex < value) {
          that.remove(value);
        }
      });

      that.prevRenderList = renderList;
    }

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

    function getList() {
      return this.options.list;
    }
  }
})();
