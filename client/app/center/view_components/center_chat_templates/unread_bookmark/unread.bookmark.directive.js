/**
 * @fileoverview center message중에서 unread-bookmark 관린하는 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('unreadBookmark', unreadBookmark);

  /* @ngInject */
  function unreadBookmark() {
    return {
      restrict: 'E',
      scope: false,
      link: link,
      templateUrl: 'app/center/view_components/center_chat_templates/unread_bookmark/unread.bookmark.html'
    };

    function link(scope, element, attrs) {
      if (scope.isLastReadMarker(attrs.linkId)) {
        element.removeClass('hidden');
      } else {
        element.remove();
      }
    }
  }
})();
