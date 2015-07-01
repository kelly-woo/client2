(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('fileCtrl', fileCtrl);

  function fileCtrl($scope, $rootScope, $filter, $timeout, $state, entityheaderAPIservice, fileAPIservice, analyticsService, publicService, entityAPIservice, AnalyticsHelper) {
    var file;

    file = $scope.file;

    $scope.onFileItemClick = onFileItemClick;
    $scope.onFileDeleteClick = onFileDeleteClick;
    $scope.setCommentFocus = setCommentFocus;
    $scope.isIntegrateFile = fileAPIservice.isIntegrateFile(file.content.serverUrl);

    function onFileItemClick() {
      $state.go('files', {userName: file.writer.name, itemId: file.id});
    }

    function onFileDeleteClick() {
      var property = {};
      var PROPERTY_CONSTANT = AnalyticsHelper.PROPERTY;
      var fileId = file.id;

      if (!confirm($filter('translate')('@file-delete-confirm-msg'))) {
        return;
      }

      fileAPIservice.deleteFile(fileId)
        .success(function(response) {
          try {
            //analytics
            property[PROPERTY_CONSTANT.RESPONSE_SUCCESS] = true;
            property[PROPERTY_CONSTANT.FILE_ID] = fileId;
            AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, property);
          } catch (e) {
          }

          $rootScope.$broadcast('onFileDeleted', fileId);
        })
        .error(function(err) {
          console.log(err);
          try {
            //analytics
            property[PROPERTY_CONSTANT.RESPONSE_SUCCESS] = false;
            property[PROPERTY_CONSTANT.ERROR_CODE] = err.code;
            AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, property);
          } catch (e) {
          }
        })
        .finally(function() {

        });
    }

    function setCommentFocus() {
      if ($state.params.itemId != file.id) {
        $rootScope.setFileDetailCommentFocus = true;

        $state.go('files', {
          userName    : file.writer.name,
          itemId      : file.id
        });
      } else {
        fileAPIservice.broadcastCommentFocus();
      }
    }
  }
})();
