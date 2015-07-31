(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('systemEvent', systemEvent);

  /* @ngInject */
  function systemEvent($filter) {
    return {
      restrict: 'E',
      scope: false,
      link: link,
      templateUrl: 'app/center/view_components/center_chat_templates/system_event/system.event.html'
    };

    function link(scope, element, attrs) {
      scope.msg.extTime = $filter('gethmmaFormat')(scope.msg.time);
    }
  }
})();
