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
          UnreadBadge.add(key, {
            top: _getAbsoluteTop(),
            bottom: _getAbsoluteTop() + element.parent().height()
          }, scope.entity);
        } else {
          UnreadBadge.remove(key);
        }
        jndPubSub.pub('onBadgeCountChanged');
      });

      scope.$on('$destroy', _onDestroy);

      function _getAbsoluteTop() {
        var scrollTop = $('#lpanel-list-container').scrollTop();
        return scrollTop + element.offset().top;
      }

      function _onDestroy() {
        UnreadBadge.remove(key);
      }
    }
  }
})();