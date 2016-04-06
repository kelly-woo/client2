/**
 * @fileoverview file directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightFile', file);

  function file($filter, $rootScope, $state, $timeout, AnalyticsHelper, Dialog, ExternalFile, fileAPIservice,
                FileDetail, JndUtil, memberService, modalHelper) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        fileType: '=',
        fileData: '=',
        fileQuery: '='
      },
      link: link,
      templateUrl : 'app/right/file/file.html',
      controller: 'RightFileCtrl'
    };

    function link(scope, el) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.onExternalShareClick = onExternalShareClick;

        _attachDomEvents();
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        el.on('click', _onFileCardClick)
          .on('mouseleave', _onFileCardMouseLeave);

        if (scope.isFileTab) {

          // file menu가 ng-if로 rendering 된 직후 이벤트 연결하기 위함
          $timeout(function() {
            el.find('.file-menu')
              .on('click', _onFileMenuClick)
              .on('click', 'a.external-share-file', _onExternalShareClick)
              .on('click', 'a.star-file', _onStarClick)
              .on('click', 'a.download-file,a.original-file', _onDownloadClick)
              .on('click', 'a.share-file', _onShareClick)
              .on('click', 'a.focus-comment-file', _onCommentFocusClick)
              .on('click', 'a.delete-file', _onDeleteClick);
          }, 0);
        }
      }

      /**
       * external share click event handler
       * @param {object} $event
       */
      function onExternalShareClick($event) {
        // 외부공유가 click 되었을때 event가 file card에 전달되어 file detail로 이동하지 않도록 한다.
        $event.stopPropagation();

        ExternalFile.openShareDialog(scope.file.content);
      }

      /**
       * 파일 아이템 클릭 이벤트 핸들러
       * @private
       */
      function _onFileCardClick() {
        var memberId = memberService.getMemberId();

        if (scope.file.writerId === memberId) {
          // 본인이 작성한 file 이라면 항상 조회 가능

          $state.go(scope.file.type + 's', {userName: scope.writerName, itemId: scope.file.id});
        } else {
          FileDetail.get(scope.file.id)
            .success(function(response) {
              // 해당 file에 접근권한이 존재
              FileDetail.setFileDetail(response);

              $state.go(scope.file.type + 's', {userName: scope.writerName, itemId: scope.file.id});
            })
            .error(function() {
              Dialog.error({
                title: $filter('translate')('@common-invalid-access')
              });
            });
        }
      }

      /**
       * 파일 아이템에서 마우스 leave 이벤트 핸들러
       * @private
       */
      function _onFileCardMouseLeave() {
        if (scope.status.isOpen) {
          JndUtil.safeApply(scope, function() {
            scope.status.isOpen = false;
          });
        }
      }

      /**
       * 파일 메뉴 클릭 이벤트 핸들러
       * @param $event
       * @private
       */
      function _onFileMenuClick($event) {
        // file menu click event가 file card에 전달되어 file detail로 이동하지 않도록 한다.
        $event.stopPropagation();
      }

      /**
       * 외부에 파일 공유하기 클릭 이벤트 핸들러
       * @private
       */
      function _onExternalShareClick() {
        scope.status.isOpen = false;
      }

      /**
       * 즐겨찾기 클릭 이벤트 핸들러
       * @private
       */
      function _onStarClick() {
        scope.status.isOpen = false;
        el.find('.file-star i').trigger('click');
      }

      /**
       * 원본파일 다운로드 클릭 이벤트 핸들러
       * @private
       */
      function _onDownloadClick() {
        JndUtil.safeApply(scope, function() {
          scope.status.isOpen = false;
        });
      }

      /**
       * 다른 룸에 공유하기 클릭 이벤트 핸들러
       * @private
       */
      function _onShareClick() {
        scope.status.isOpen = false;
        modalHelper.openFileShareModal(scope, scope.file);
      }

      /**
       * 코멘트 달기 클릭 이벤트 핸들러
       * @private
       */
      function _onCommentFocusClick() {
        scope.status.isOpen = false;

        if ($state.params.itemId != scope.file.id) {
          $rootScope.setFileDetailCommentFocus = true;

          $state.go('files', {
            userName: scope.writerName,
            itemId: scope.file.id
          });
        } else {
          fileAPIservice.broadcastCommentFocus();
        }
      }

      /**
       * 삭제하기 클릭 이벤트 핸들러
       * @private
       */
      function _onDeleteClick() {
        scope.status.isOpen = false;

        Dialog.confirm({
          body: $filter('translate')('@file-delete-confirm-msg'),
          allowHtml: true,
          onClose: function(result) {
            if (result === 'okay') {
              _requestDeleteFile(scope.file.id);
            }
          }
        });
      }

      /**
       * 파일 삭제 요청함
       * @param {number} fileId
       * @private
       */
      function _requestDeleteFile(fileId) {
        fileAPIservice.deleteFile(fileId)
          .success(function() {
            _analyticsFileDeleteSuccess(fileId);

            Dialog.success({
              title: $filter('translate')('@success-file-delete').replace('{{filename}}', scope.contentTitle)
            });

            $rootScope.$broadcast('onFileDeleted', fileId);
          })
          .error(function(err) {
            _analyticsFileDeleteError(err);
          });
      }

      /**
       * 파일 삭제 성공 로그
       * @param {number} fileId
       * @private
       */
      function _analyticsFileDeleteSuccess(fileId) {
        try {
          //analytics
          AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, {
            'RESPONSE_SUCCESS': true,
            'FILE_ID': fileId
          });
        } catch (e) {
        }
      }

      /**
       * 파일 삭제 실패 로그
       * @param {number} fileId
       * @private
       */
      function _analyticsFileDeleteError(err) {
        try {
          //analytics
          AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DELETE, {
            'RESPONSE_SUCCESS': false,
            'ERROR_CODE': err.code
          });
        } catch (e) {
        }
      }
    }
  }
})();
