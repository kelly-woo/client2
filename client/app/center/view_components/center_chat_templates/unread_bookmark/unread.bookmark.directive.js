(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('unreadBookmark', unreadBookmark);

  function unreadBookmark() {
    return {
      restrict: 'E',
      scope: false,
      link: link,
      templateUrl: 'app/center/view_components/center_chat_templates/unread_bookmark/unread.bookmark.html'
    };

    function link(scope, element, attrs) {

    }
  }
})();
