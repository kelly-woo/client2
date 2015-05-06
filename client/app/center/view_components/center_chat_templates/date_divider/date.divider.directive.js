(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('dateDivider', dateDivider);

  function dateDivider() {
    return {
      restrict: 'E',
      scope: false,
      link: link,
      templateUrl: 'app/center/view_components/center_chat_templates/date_divider/date.divider.html'
    };

    function link(scope, element, attrs) {

    }
  }
})();
