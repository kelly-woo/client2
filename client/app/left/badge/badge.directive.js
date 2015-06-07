(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('badge', badge);

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

    function link(scope, element, attrs, controller) {
      var key = scope.group + '_' + scope.key;
      scope.$watch('content', function(newVal, oldVal) {
        if (newVal > 0) {
          UnreadBadge.add(key, _getAbsoluteBottom(), scope.entity);
        } else {
          UnreadBadge.remove(key);
        }
        jndPubSub.pub('onBadgeCountChanged');
      });

      scope.$on('$destroy', _onDestroy);

      function _getAbsoluteBottom() {
        var scrollTop = $('#lpanel-list-container').scrollTop();
        return scrollTop + element.offset().top + element.parent().height();
      }
      function _onDestroy() {
        UnreadBadge.remove(key);
      }
    }
  }
})();