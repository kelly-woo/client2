/**
 * @fileoverview message directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('message', message);

  function message($timeout) {
    var STARRED_ITEM_REMOVE_DELAY = 3000;

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

      if (scope.message.type === 'star' && scope.hasStar) {
        el.find('.message-star i')
          .on('click', function() {
            if (scope.isStarred) {
              el.parent().css('opacity', .6);
            } else {
              el.parent().css('opacity', 1);
            }
          });
      }
    }
  }
})();
