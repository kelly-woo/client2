(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('titleComment', titleComment);

  function titleComment() {
    return {
      restrict: 'E',
      scope: false,
      link: link,
      templateUrl: 'app/center/center_chat_templates/title_comment/title.comment.html'
    };

    function link(scope, element, attrs) {

    }
  }
})();
