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
                     fileAPIservice, modalHelper, FileData, memberService, Dialog, Loading, TutorialTooltip) {

    _init();

    // First function to be called.
    function _init() {
      // file controller에 전달되는 data가 tab(file, star, mention)마다 각각 다르므로 message data를
      // file controller에서 사용가능한 data format으로 convert함
      var file = $scope.file = FileData.convert($scope.fileType, $scope.fileData);

      $scope.file.extWriter = $scope.writer = EntityMapManager.get('total', file.writerId);

      $scope.writerName = $scope.writer.name;
      $scope.profileImage = memberService.getProfileImage($scope.writer.id, 'small');
      $scope.createDate = $filter('getyyyyMMddformat')(file.createdAt);
      $scope.contentTitle = file.contentTitle;

      $scope.isStarred = file.isStarred || false;
      if (file.content) {
        $scope.isExternalShared = file.content.externalShared;
      }
      $scope.getExternalShare = getExternalShare;
      $scope.setExternalShare = setExternalShare;

      $scope.onFileCardClick = onFileCardClick;

      $scope.onOpenShareModal = onOpenShareModal;
      $scope.isDisabledMember = isDisabledMember;
      $scope.onFileDeleteClick = onFileDeleteClick;
      $scope.setCommentFocus = setCommentFocus;

      $scope.isFileOwner = $filter('isFileWriter')(file);
      $scope.isAdmin = memberService.isAdmin();

      $scope.loadingBar = Loading.getTemplate();
      if (file.contentFileUrl) {
        _setFileDownLoad(file.isIntegrateFile, file.contentTitle, file.contentFileUrl);
      }

      if ($scope.file.mustPreview && !$scope.file.hasPreview) {
        // thumbnail를 가져야 하고 thumbnail를 가지지 않은 file card일 경우 thumbnail 생성 event attach

        $scope.$on('createdThumbnailImage', _createdThumbnailImage);
      }
      TutorialTooltip.hide('filetab');
    }

    /**
     * open share modal
     */
    function onOpenShareModal() {
      modalHelper.openFileShareModal($scope, $scope.file);
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
            Dialog.error({
              title: $filter('translate')('@common-invalid-access')
            });
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
      Dialog.confirm({
        body: $filter('translate')('@file-delete-confirm-msg'),
        allowHtml: true,
        onClose: function(result) {
          var fileId;

          if (result === 'okay') {
            fileId = $scope.file.id;

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

                Dialog.success({
                  title: $filter('translate')('@success-file-delete').replace('{{filename}}', $scope.contentTitle)
                });

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

      $scope.downloadUrl = value.downloadUrl;
      $scope.originalUrl = value.originalUrl;
    }

    /**
     * created thumbnail event handler
     * @param {object} $event
     * @param {object} socketData
     * @private
     */
    function _createdThumbnailImage($event, socketData) {
      var message = socketData.data.message;
      var thumbnailUrl;

      if ($scope.file.id === message.id) {
        thumbnailUrl = message.content.extraInfo.smallThumbnailUrl ?
          message.content.extraInfo.smallThumbnailUrl :
          message.content.extraInfo.thumbnailUrl + '?size=80';

        $scope.$apply(function() {
          $scope.file.hasPreview = true;
          $scope.file.imageUrl = $filter('getFileUrl')(thumbnailUrl);
        });
      }
    }

    /**
     * external share 전달한다.
     * @returns {string}
     */
    function getExternalShare() {
      return $scope.isExternalShared;
    }

    /**
     * external share 설정한다.
     * @param {boolean} isExternalShared
     */
    function setExternalShare(isExternalShared) {
      $scope.isExternalShared = isExternalShared;
    }
  }
})();
