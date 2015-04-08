(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerHelpMessageContainer', centerHelpMessageContainer);

  function centerHelpMessageContainer() {
    return {
      restrict: 'EA',
      controller: 'HelpMessageCtrl',
      templateUrl: 'app/center/help-messages/help.messages.html',
      replace: true,
      transclude: true,
      link: link,
      scope: {
        currentState: '=status',
        currentModalInstance: '=modalInstance'
      }
    };

    function link(scope, element, attr, ctrl) {
    }
  }

})();