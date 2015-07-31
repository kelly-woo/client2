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
      templateUrl: 'app/center/view_components/center_chat_templates/title_comment/title.comment.html',
      controller: 'TitleCommentCtrl'
    };

    function link(scope, element, attrs) {

    }
  }
})();
