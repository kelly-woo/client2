/**
 * @fileoverview file controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('FileCtrl', FileCtrl);

  /* @ngInject */
  function FileCtrl($scope, $rootScope, $state, $filter, EntityMapManager, publicService, fileAPIservice, FileData, messageAPIservice) {
    _init();

    // First function to be called.
    function _init() {
      var file = $scope.file = FileData.convert($scope.fileType, $scope.fileData);

      $scope.file.extWriter = $scope.writer = EntityMapManager.get('total', file.writerId);

      $scope.writerName = $scope.writer.name;
      $scope.profileImage = $filter('getSmallThumbnail')($scope.writer);
      $scope.createDate = $filter('getyyyyMMddformat')(file.createdAt);
      $scope.commentCount = file.commentCount;
      $scope.contentTitle = file.contentTitle;

      $scope.isStarred = file.isStarred || false;

      $scope.onFileCardClick = onFileCardClick;

      $scope.onClickShare = onClickShare;
      $scope.isDisabledMember = isDisabledMember;
      $scope.onFileDeleteClick = onFileDeleteClick;
      $scope.setCommentFocus = setCommentFocus;
    }

    function onClickShare() {
      fileAPIservice.openFileShareModal($scope, $scope.file);
    }

    function onFileCardClick() {
      var hasStateChange;

      messageAPIservice.getMessage($scope.fileData.teamId, $scope.file.id)
        .success(function(file) {
          if (file.status === 'created') {
            hasStateChange = true;
            $state.go($scope.file.type + 's', {userName: $scope.writerName, itemId: $scope.file.id});
          }
        })
        .finally(function() {
          if (!hasStateChange) {
            alert($filter('translate')('@common-remove-origin'));
          }
        });

      //jndPubSub.updateRightFileDetailPanel();
      //$state.go('messages.detail.filedetail', _.extend( {},$state.params, {userName: $scope.writerName, itemId: $scope.file.id, tail: $scope.file.type + 's'}));
    }

    function isDisabledMember() {
      return publicService.isDisabledMember($scope.file.extWriter);
    }

    function onFileDeleteClick() {
      var fileId = $scope.file.id;

      if (!confirm($filter('translate')('@file-delete-confirm-msg'))) {
        return;
      }

      fileAPIservice.deleteFile(fileId)
        .success(function(response) {
          try {
            //analytics
            AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, {
              'RESPONSE_SUCCESS': true,
              'FILE_ID': fileId
            });
          } catch (e) {
          }

          $rootScope.$broadcast('onFileDeleted', fileId);
        })
        .error(function(err) {
          console.log(err);
          try {
            //analytics
            AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, {
              'RESPONSE_SUCCESS': false,
              'ERROR_CODE': err.code
            });
          } catch (e) {
          }
        })
        .finally(function() {

        });
    }

    function setCommentFocus() {
      if ($state.params.itemId != $scope.file.id) {
        $rootScope.setFileDetailCommentFocus = true;

        $state.go('files', {
          userName    : $scope.writerName,
          itemId      : $scope.file.id
        });
      } else {
        fileAPIservice.broadcastCommentFocus();
      }
    }
  }
})();
