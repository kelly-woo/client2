(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerHelpMessageContainer', centerHelpMessageContainer);

  function centerHelpMessageContainer() {
    return {
      restrict: 'EA',
      controller: 'HelpMessageCtrl',
      templateUrl: 'app/center/help_messages/help.messages.html',
      replace: true,
      link: link,
      scope: {
        currentState: '=status'
      }
    };

    function link(scope, element, attr, ctrl) {
    }
  }
})();