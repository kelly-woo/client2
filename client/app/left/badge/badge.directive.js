/**
 * @fileoverview  unread 뱃지 directive
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('badge', badge);

  /* @ngInject */
  function badge(jndPubSub, UnreadBadge) {
    return {
      link: link,
      scope: {
          content: '@content',
          group: '@group',
          key: '@key',
          entity: '@entity'
      },
      restrict: 'E',
      templateUrl: 'app/left/badge/badge.html'
    };

    function link(scope, el, attrs, ctrl) {
      var key = scope.group + '_' + scope.key;
      var jqParent = el.parent();
      scope.$on('$destroy', _onDestroy);
      scope.$watch('content', _onContentChange);

      /**
       * 뱃지 내용 변경 시 핸들러
       * @param {string} newVal 변경된 값
       * @param {string} oldVal 변경전 값
       * @private
       */
      function _onContentChange(newVal, oldVal) {
        var top;
        var bottom;

        if (newVal > 0) {
          top = _getTop();
          bottom = top + jqParent.height();

          UnreadBadge.add(key, {
            top: top,
            bottom: bottom
          }, scope.entity);
        } else {
          UnreadBadge.remove(key);
        }
        jndPubSub.pub('onBadgeCountChanged');
      }

      /**
       * scope 제거시 이벤트 핸들러
       * @private
       */
      function _onDestroy() {
        UnreadBadge.remove(key);
      }

      /**
       * top 절대 위치를 반환한다.
       * @returns {number} top 위치
       * @private
       */
      function _getTop() {
        var scrollTop = $('#lpanel-list-container').scrollTop();
        return scrollTop + jqParent.offset().top;
      }
    }
  }
})();
