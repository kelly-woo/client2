/**
 * @fileoverview messages directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightMessages', rightMessages);

  function rightMessages() {
    return {
      restrict: 'EA',
      replace: true,
      scope: true,
      link: link,
      templateUrl : 'app/right/messages/messages.html',
      controller: 'RightMessagesCtrl'
    };

    function link(scope, element, attrs) {
    }
  }
})();