/**
 * @fileoverview message directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightMessageGroup', messageGroup);

  /* @ngInject  */
  function messageGroup() {
    return {
      restrict: 'EA',
      replace: true,
      scope: true,
      templateUrl : 'app/right/messages/message-group/message.group.html',
      controller: 'RightMessageGroupCtrl',
      link: angular.noop
    };
  }
})();
