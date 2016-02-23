/**
 * @fileoverview file detail의 header directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailHeader', fileDetailHeader);

  /* @ngInject */
  function fileDetailHeader($state, $filter, modalHelper, fileAPIservice, analyticsService, jndPubSub, Dialog,
                            AnalyticsHelper, RouterHelper) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        file: '=',
        downloadUrl: '=',
        originalUrl: '=',
        isArchivedFile: '=',
        isInvalidRequest: '=',
        isExternalShared: '=',
        isAdmin: '=',
        isIntegrateFile: '=',
        onMemberClick: '=',
        backToPrevState: '='
      },
      templateUrl : 'app/right/file.detail/header/file.detail.header.html',
      link: link
    };

    function link(scope) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        var file = scope.file;

        if (!scope.isInvalidRequest) {
          scope.isStarred = file.isStarred;
          scope.isFileOwner = $filter('isFileWriter')(file);

          scope.backToFileList = backToFileList;
          scope.onClickDownload = onClickDownload;
          scope.onClickShare = onClickShare;
          scope.onCommentFocusClick = onCommentFocusClick;
          scope.onStarClick = onStarClick;
          scope.onFileDeleteClick = onFileDeleteClick;

          scope.getExternalShare = getExternalShare;
          scope.setExternalShare = setExternalShare;
        }
      }

      /**
       * download click event handler
       * @param {object} file
       */
      function onClickDownload() {
        var file = scope.file;

        // analytics
        var file_meta = (file.content.type).split("/");
        var download_data = {
          "category": file_meta[0],
          "extension": file.content.ext,
          "mime type": file.content.type,
          "size": file.content.size
        };
        analyticsService.mixpanelTrack("File Download", download_data);
      }

      /**
       * share click event handler
       * @param file
       */
      function onClickShare() {
        var file = scope.file;

        modalHelper.openFileShareModal(scope, file);
      }

      /**
       * focus click event handler
       */
      function onCommentFocusClick() {
        jndPubSub.pub('setCommentFocus');
      }

      /**
       * star click trigger
       */
      function onStarClick() {
        setTimeout(function() {
          $('.file-detail').find('.star-btn').trigger('click');
        });
      }

      /**
       * file delete click event handler
       * @param fileId
       */
      function onFileDeleteClick() {
        Dialog.confirm({
          body: $filter('translate')('@file-delete-confirm-msg'),
          allowHtml: true,
          onClose: function(result) {
            result === 'okay' && _requestFileDelete();
          }
        });
      }

      /**
       * request file delete
       * @private
       */
      function _requestFileDelete() {
        var fileId = scope.file.id;

        fileAPIservice.deleteFile(fileId)
          .success(function() {
            _successFileDelete();

            try {
              //analytics
              AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, {
                'RESPONSE_SUCCESS': true,
                'FILE_ID': fileId
              });
            } catch (e) {}
          })
          .error(function(err) {
            try {
              //analytics
              AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, {
                'RESPONSE_SUCCESS': false,
                'ERROR_CODE': err.code
              });
            } catch (e) {}
          });
      }

      /**
       * success file delete
       * @private
       */
      function _successFileDelete() {
        var file = scope.file;
        scope.isArchivedFile = true;

        Dialog.success({
          title: $filter('translate')('@success-file-delete').replace('{{filename}}', file.content.title)
        });

        jndPubSub.pub('onFileDeleted', file.id);
      }

      /**
       * Redirect user back to file list.
       */
      function backToFileList() {
        $state.go('messages.detail.' + (RouterHelper.getRightPanelTail() || 'files'));
      }

      /**
       * external share 전달한다.
       * @returns {string}
       */
      function getExternalShare() {
        return scope.isExternalShared;
      }

      /**
       * external share 설정한다.
       * @param {boolean} isExternalShared
       */
      function setExternalShare(isExternalShared) {
        scope.isExternalShared = isExternalShared;
      }
    }
  }
})();
