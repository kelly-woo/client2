(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('text', text);

  function text() {
    return {
      restrict: 'E',
      scope: true,
      link: link,
      templateUrl: 'app/center/view_components/center_chat_templates/text/text.html',
      controller: 'TextMessageCtrl'
    };

    function link(scope, element, attrs) {

    }
  }
})();
