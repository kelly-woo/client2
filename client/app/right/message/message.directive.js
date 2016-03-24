/**
 * @fileoverview message dicrective
 * message search와 star, mention에서 사용함
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightMessage', rightMessage);

  function rightMessage($timeout) {
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
      controller: 'RightMessageCtrl'
    };

    function link(scope, el, attrs) {
      _init();

      function _init() {

        if (attrs.messageData === 'prev' || attrs.messageData === 'next') {
          scope.content = scope.inlineContent;
        }

        if (scope.messageQuery) {
          $timeout(function() {
            el.find('.message-card-body').highlight(scope.messageQuery);
          },50);
        }
      }
    }
  }
})();
