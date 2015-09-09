/**
 * @fileoverview 각 토픽마다 생성되는 announcement directive
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicList', topicList);

  function topicList(Viewport, TopicListRenderer) {
    return {
      restrict: 'E',
      replace: true,
      link: link
    };

    //list: [],
    //  jqViewport: viewport,
    //  viewportHeight: 0,
    //  itemHeight: 25,
    //  listHeight: 0,
    //  bufferLength: 10

    function link(scope, el, attrs) {
      var model = attrs.model;
      var jqFilter = $(attrs.filter);
      var list = scope.$eval(attrs.list);
      var type = attrs.type;

      var jqViewport = el.parent();
      var jqList = $('<div class="list"></div>').appendTo(el);
      var viewport = Viewport.create(jqViewport, jqList, {
        viewport: '.list',
        viewportMaxHeight: 662,
        list: list,
        itemHeight: 73,
        bufferLength: 10
      });

      var matches = list;

      function getMatches(value) {
        return _.chain(list).filter(function (item) {
          return item.name.indexOf(value) > -1;
        }).sortBy('name').value();
      }

      TopicListRenderer.render(type, list, viewport);

      jqFilter.on('blur', function() {
        matches = getMatches(scope.$eval(model));
        TopicListRenderer.render(type, matches, viewport);
      });

      jqViewport
        .on('scroll', function() {
          TopicListRenderer.render(type, matches, viewport);
        })
        .on('mousewheel', function() {
          TopicListRenderer.render(type, matches, viewport);
        });
    }
  }
})();
