/**
 * @fileoverview message directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('message', message);

  function message($timeout) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        messageType: '=',
        messageData: '=',
        messageQuery: '=',
        messageHasStar: '='
      },
      link: link,
      templateUrl : 'app/right/message/message.html',
      controller: 'MessageCtrl'
    };

    function link(scope, el) {
      if (scope.messageQuery) {
        $timeout(function() {
          el.find('.message-card-body').children().highlight(scope.messageQuery);
        },50);
      }
    }
  }
})();
