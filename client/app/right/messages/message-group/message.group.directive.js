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
      link: link,
      templateUrl : 'app/right/messages/message-group/message.group.html',
      controller: 'RightMessageGroupCtrl'
    };

    function link(scope, element, attrs) {
    }
  }
})();
