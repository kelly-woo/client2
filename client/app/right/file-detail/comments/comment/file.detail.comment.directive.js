/**
 * @fileoverview file detail의 comment directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailComment', fileDetailComment);

  /* @ngInject */
  function fileDetailComment() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        content: '='
      },
      link: link
    };

    function link(scope, el) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        // html을 el.append를 사용하지 않고 ng-bind-html을 사용하여 자식 element로 넣게 되면 mention-view의 data가 날아가
        // 어느 member에 대한 mention인지 구분할 수 없다.
        el.append(scope.content);
      }
    }
  }
})();
