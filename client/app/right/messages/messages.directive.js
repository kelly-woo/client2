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
      scope: {
        status: '='
      },
      link: angular.noop,
      templateUrl : 'app/right/messages/messages.html',
      controller: 'RightMessagesCtrl'
    };
  }
})();