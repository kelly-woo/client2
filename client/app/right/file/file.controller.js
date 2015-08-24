/**
 * @fileoverview file controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('FileCtrl', FileCtrl);

  /* @ngInject */
  function FileCtrl($scope, $rootScope, $state, $filter, EntityMapManager, publicService,
                    fileAPIservice, FileData, memberService, configuration) {
    var _regxHTTP = /^[http|https]/i;

    _init();

    // First function to be called.
    function _init() {
      // file controller에 전달되는 data가 tab(file, star, mention)마다 각각 다르므로 message data를
      // file controller에서 사용가능한 data format으로 convert함
      var file = $scope.file = FileData.convert($scope.fileType, $scope.fileData);

      $scope.file.extWriter = $scope.writer = EntityMapManager.get('total', file.writerId);

      $scope.writerName = $scope.writer.name;
      $scope.profileImage = $filter('getSmallThumbnail')($scope.writer);
      $scope.createDate = $filter('getyyyyMMddformat')(file.createdAt);
      $scope.contentTitle = file.contentTitle;

      $scope.isStarred = file.isStarred || false;

      $scope.onFileCardClick = onFileCardClick;

      $scope.onOpenShareModal = onOpenShareModal;
      $scope.isDisabledMember = isDisabledMember;
      $scope.onFileDeleteClick = onFileDeleteClick;
      $scope.setCommentFocus = setCommentFocus;

      $scope.isFileOwner = $filter('isFileWriter')(file);
      $scope.isAdmin = memberService.isAdmin();

      if (file.contentFileUrl) {
        _setFileDownLoad(file.isIntegrateFile, file.contentTitle, file.contentFileUrl);
      }
    }

    /**
     * open share modal
     */
    function onOpenShareModal() {
      fileAPIservice.openFileShareModal($scope, $scope.file);
    }

    /**
     * file card click event handler
     */
    function onFileCardClick() {
      var memberId = memberService.getMemberId();

      if ($scope.file.writerId === memberId) {
        // 본인이 작성한 file 이라면 항상 조회 가능

        $state.go($scope.file.type + 's', {userName: $scope.writerName, itemId: $scope.file.id});
      } else {
        fileAPIservice.getFileDetail($scope.file.id)
          .success(function(response) {
            // 해당 file에 접근권한이 존재
            fileAPIservice.dualFileDetail = response;

            $state.go($scope.file.type + 's', {userName: $scope.writerName, itemId: $scope.file.id});
          })
          .error(function() {
            alert($filter('translate')('@common-leaved-topic'));
          });
      }
    }

    /**
     * disabled member 여부
     * @returns {*|boolean|*}
     */
    function isDisabledMember() {
      return publicService.isDisabledMember($scope.file.extWriter);
    }

    /**
     * delete file click event handler
     */
    function onFileDeleteClick() {
      var fileId = $scope.file.id;

      if (!confirm($filter('translate')('@file-delete-confirm-msg'))) {
        return;
      }

      fileAPIservice.deleteFile(fileId)
        .success(function() {
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
        });
    }

    /**
     * focus to comment area
     */
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

    /**
     * file download 설정
     * @param {boolean} isIntegrateFile
     * @param {string} contentTitle
     * @param {string} contentFileUrl
     * @private
     */
    function _setFileDownLoad(isIntegrateFile, contentTitle, contentFileUrl) {
      var value;

      $scope.isIntegrateFile = isIntegrateFile;
      value = $filter('downloadFile')(isIntegrateFile, contentTitle, contentFileUrl);

      $scope.hasProtocol = value.hasProtocol;
      $scope.downloadUrl = value.downloadUrl;
      $scope.originalUrl = value.originalUrl;
    }
  }
})();
