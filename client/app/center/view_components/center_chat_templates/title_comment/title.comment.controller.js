/**
 * @fileoverview 코멘트의 컨트롤러
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TitleCommentCtrl', TitleCommentCtrl);

  /* @ngInject */
  function TitleCommentCtrl($scope) {
    $scope.$on('centerOnFileDeleted', _onFileDeleted);

    /**
     * 파일이 지워졌을 때
     * @param event
     * @param param
     * @private
     */
    function _onFileDeleted(event, param) {
      var deletedFileId = parseInt(param.file.id, 10);
      if ($scope.msg.feedback.id === deletedFileId) {
        $scope.msg.feedback.status = 'archived';
      }
    }
  }
})();
