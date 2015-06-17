(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('neighborItem', neighborItem)
    .controller('neighborItemCtrl', neighborItemCtrl);

  function neighborItem() {
    return {
      restrict: 'EA',
      scope: {
        message: "=",
        query: "="
      },
      replace: true,
      link: link,
      templateUrl : 'app/right/search.messages/search.message/neighbor.item/neighbor.item.html',
      controller: 'neighborItemCtrl'
    };
  }

  function link(scope, element, attrs) {

  }

  /* @ngInject */
  function neighborItemCtrl($scope, $timeout) {
    var message = $scope.message;

    var STATUS_SHARED = 'shared';
    var STATUS_UNSHARED = 'unshared';
    var TYPE_COMMENT = 'comment';

    $scope.isFile = isFile();
    $scope.isShared = isShared();
    $scope.isUnShared = isUnShared();
    $scope.isComment = isComment();
    $scope.isSticker = isSticker();

    (function() {
      if (!!$scope.query) {
        highlightText($scope.query);
      }
    })();

    if ($scope.query) {
    }

    function highlightText(text) {
      $timeout(function() {
        $('.current .message-content').highlight(text);
      }, 50);
    }

    /**
     * sticker 인지 여부 반환
     * @returns {boolean}
     */
    function isSticker() {
      return message.type === 'sticker';
    }

    /**
     * file 인지 여부 반환
     * @returns {boolean}
     */
    function isFile() {
      return message.type !== 'text' && message.type !== 'sticker';
    }

    /**
     * 공유되었는이 여부 반환
     * @returns {boolean}
     */
    function isShared() {
      return message.status == STATUS_SHARED;
    }

    /**
     * 공유되지 않았는지 여부 반환
     * @returns {boolean}
     */
    function isUnShared() {
      return message.status == STATUS_UNSHARED;
    }

    /**
     * 파일 코멘트인지 여부 반환
     * @returns {boolean}
     */
    function isComment() {
      return message.type == TYPE_COMMENT;
    }
  }

})();