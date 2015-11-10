/**
 * @fileoverview file detail의 title directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailTitle', fileDetailTitle);

  /* @ngInject */
  function fileDetailTitle($state, RouterHelper) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        file: '=',
        hasInitialLoaded: '=',
        isArchivedFile: '='
      },
      templateUrl : 'app/right/file.detail/title/file.detail.title.html',
      link: link
    };

    function link(scope) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.backToFileList = backToFileList;
      }

      /**
       * Redirect user back to file list.
       */
      function backToFileList() {
        $state.go('messages.detail.' + (RouterHelper.getRightPanelTail() || 'files'));
      }
    }
  }
})();
