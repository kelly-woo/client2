(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('socialSnippet', socialSnippet);

  function socialSnippet() {
    return {
      restrict: 'E',
      scope: false,
      link: link,
      replace: true,
      templateUrl: 'app/center/view_components/center_chat_templates/content_attacher/social.snippet.html'
    };

    function link(scope, element, attrs) {
    }
  }
})();
