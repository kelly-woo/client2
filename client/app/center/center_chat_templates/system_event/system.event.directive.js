(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('systemEvent', systemEvent);

  function systemEvent() {
    return {
      restrict: 'E',
      scope: false,
      link: link,
      templateUrl: 'app/center/center_chat_templates/system_event/system.event.html'
    };

    function link(scope, element, attrs) {

    }
  }
})();
