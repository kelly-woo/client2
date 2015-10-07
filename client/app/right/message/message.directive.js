/**
 * @fileoverview message dicrective
 * message search와 star, mention에서 사용함
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
      _init();

      function _init() {
        if (scope.messageQuery) {
          $timeout(function() {
            el.find('.message-card-body').children().highlight(scope.messageQuery);
          },50);
        }
      }
    }
  }
})();
