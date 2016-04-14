/**
 * @fileoverview scroll loading directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightScrollLoading', rightScrollLoading);

  function rightScrollLoading() {
    return {
      restrict: 'A',
      scope: {
        loadMore: '&',
        isLoading: '='
      },
      link: link
    };

    function link(scope, el) {
      var _list = el.find('.scroll-loading-list');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _attachDomEvents();
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        // list를 담는 container에 스크롤이 생길정도로 list의 높이가 크지 않을때
        // mousewheel로도 조회 가능해야 한다.
        el.on('mousewheel', _onLoadMore)
          .on('scroll', _onLoadMore);
      }

      /**
       * 더 불러오기 핸들러
       * @private
       */
      function _onLoadMore() {
        if (!scope.isLoading && _isLoadMore()) {
          scope.loadMore();
        }
      }

      /**
       * 더 불러오기 여부
       * @returns {boolean}
       * @private
       */
      function _isLoadMore() {
        var listHeight = _list.height();
        var containerBottom = el.scrollTop() + el.height();

        return listHeight - containerBottom < listHeight / 8;
      }
    }
  }
})();
