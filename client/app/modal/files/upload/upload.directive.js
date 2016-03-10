/**
 * @fileoverview file upload modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileUploadModal', fileUploadModal);

  function fileUploadModal($rootScope, $timeout, $state, modalHelper, AnalyticsHelper, Mentionahead,
                           analyticsService, jndPubSub) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el) {
      var _jqFileUploadTitle = $('#file_upload_title');

      var PUBLIC_FILE = 744;    // PUBLIC_FILE code

      var fileUploadOptions = scope.fileUploadOptions;
      var fileUploader;
      var fileObject;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.data = {
          comment: ''
        };

        scope.upload = upload;
        scope.cancel = cancel;

        _setFilUploader();
      }

      /**
       * file upload를 수행하는 object를 설정한다.
       * @private
       */
      function _setFilUploader() {
        fileObject = fileUploadOptions.fileUploader.fileObject;
        if (fileUploadOptions.fileUploader.isUploadingStatus()) {
          // 현재 upload 중이고 이어서 upload함
          fileUploader = fileUploadOptions.fileUploader;
          fileUploader.updateUploadStatus();
        } else {
          // 최초 upload함
          fileUploader = fileUploadOptions.fileUploader.setOptions({
            // file api 제공 여부
            supportFileAPI: true,
            // file object convert
            convertFile: function(file) {
              if (file.comment) {
                scope.data.comment = _.trim(file.comment);
              }

              return scope.file = file;
            },
            // fileInfo object convert
            convertFileInfo: function(file) {
              var fileInfo;

              if (file.isImage) {
                _createImgEle(scope, file);
              }

              fileInfo = {
                isPrivateFile: false,
                uploadType: file.uploadType,
                permission: PUBLIC_FILE,

                // file upload시 공유 대화방 수정 가능함.
                //roomId: scope.selectedEntity.entityId || scope.selectedEntity.id,
                share: scope.selectedEntityId,

                // file upload시 comment 수정 가능함.
                comment: scope.data.comment
              };

              // upload modal title 갱신, fileInfo에 title 설정
              fileInfo.title = file.name;
              _jqFileUploadTitle.val(file.name);

              // upload modal currentEntity 갱신
              scope.selectedEntity = scope.selectedEntity;
              scope.selectedEntityId = scope.selectedEntity.id;

              $('#file_upload_comment').focus();

              return scope.fileInfo = fileInfo;
            },
            // upload sequence 시작
            onBegin: function() {
              scope.lastIndex = fileObject.size();
            },
            // 하나의 file upload 시작
            onUpload: function(file, fileInfo) {
              // 공유 entity id 와 comment는 최초 설정된 값에서 변경 가능하므로 재설정함
              //fileInfo.roomId = scope.selectedEntity.entityId || scope.selectedEntity.id;
              fileInfo.share = scope.selectedEntityId;

              fileInfo.comment = el.find('#file_upload_comment').val().trim();

              _setMentions(fileInfo);

              // scope comment 초기화
              scope.data.comment = '';

              _setCurrentProgressBar(file);
            },
            // 하나의 file upload 중
            onProgress: function(evt, file) {
              scope.lastIndex = fileObject.size();

              // set transition
              _setProgressBarStyle('progress');

              if (!$rootScope.curUpload.isAborted) {
                _setCurrentProgressBar(file, {
                  progress: parseInt(100.0 * evt.loaded / evt.total),
                  status: 'uploading'
                });
              }
            },
            // 하나의 file upload 완료
            onSuccess: function(response, index, length) {
              _trackFileUploadInfo(response);
              _setProgressBarStyle('success', index, length);
              //_setThumbnailImage(response);

              $rootScope.curUpload.status = 'done';
            },
            // 하나의 file upload error
            onError: function(err, index, length) {
              var property = {};
              var PROPERTY_CONSTANT = AnalyticsHelper.PROPERTY;

              //analytics
              try {
                AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_UPLOAD, {
                  'RESPONSE_SUCCESS': false,
                  'ERROR_CODE': err.code
                });
              } catch (e) {

              }

              _setProgressBarStyle('error', index, length);

              $rootScope.curUpload.status = $rootScope.curUpload.isAborted ? 'abort' : 'error';
              $rootScope.curUpload.hasError = true;
              $rootScope.curUpload.progress = 0;
            },
            // upload confirm end
            onConfirmEnd: function(index, length) {
              modalHelper.closeModal();

              if (_isUploadEnd(index, length)) {
                fileUploadOptions.onEnd();
              }
            },
            // upload sequence end
            onEnd: fileUploadOptions.onEnd
          });
        }
      }

      /**
       * image파일 upload시 upload modal에 보여지는 미리보기 용 dataUrl 생성한다.
       */
      function _createImgEle(scope, file) {
        var fileReader;

        if (file.dataUrl) {
          scope.dataUrl = '';
          $timeout(function() {
            scope.$apply(function(scope) {
              scope.dataUrl = file.dataUrl;
            });
          });
        } else {
          fileReader = new window.FileReader();

          scope.dataUrl = '';
          fileReader.onload = function(e) {
            scope.$apply(function(scope) {
              scope.dataUrl = e.target.result;
            });
          };
          fileReader.readAsDataURL(file);
        }
      }

      /**
       * 현재 progress bar를 설정한다.
       * @param {object} file
       * @param {object} options
       * @private
       */
      function _setCurrentProgressBar(file, options) {
        var curUpload = {
          lFileIndex: fileUploader.lastProgressIndex,
          cFileIndex: fileUploader.currentProgressIndex,
          title: file.name,
          progress: 0,
          status: 'initiate'
        };

        $rootScope.curUpload = _.extend(curUpload, options);
      }

      /**
       * 마지막 file upload confirm이 진행 되었고, 더이상 upload를 진행하지 않는지 여부를 전달한다.
       * @param {number} index
       * @param {number} length
       * @returns {boolean}
       * @private
       */
      function _isUploadEnd(index, length) {
        return index === length && $rootScope.curUpload && $rootScope.curUpload.status === 'done';
      }

      /**
       * progress bar의 style을 설정한다.
       * @param {string} type - 설정 type
       * @param {number} index - 현재 upload되는 file의 index
       * @param {number} length - upload 되는 file의 length
       */
      function _setProgressBarStyle(type, index, length) {
        var jqProgressBar = $('.progress-striped').children();

        // progress bar 100% 상태에서 다음 file을 upload 위해 progress bar 0%로 변경시
        // transition style 적용되어 animation 들어가는 것을 방지 하기위해 confirm done
        // 일때 transition 적용을 잠시 해제함.
        if (index !== length) {
          if (type === 'success') {
            jqProgressBar.removeClass('animation-progress-bar');
          } else {
            jqProgressBar.css('width', 0).removeClass('animation-progress-bar');
          }
        } else if (type === 'progress') {

          // progress bar animation 효과 설정
          jqProgressBar.addClass('animation-progress-bar');
        }
      }

      /**
       * 업로드 하는 파일에 대한 mention정보를 설정한다.
       * @param {object} fileInfo
       * @private
       */
      function _setMentions(fileInfo) {
        var mentionList = Mentionahead.getMentionListForTopic($state.params.entityId);
        var mentionMap = Mentionahead.getSingleMentionItems(mentionList);
        var mention = Mentionahead.getMentionAllForText(fileInfo.comment, mentionMap, fileInfo.share);

        if (mention) {
          fileInfo.comment = mention.msg;
          fileInfo.mentions = mention.mentions;
        }
      }

      /**
       * file upload
       */
      function upload() {
        fileUploader.upload(true, {
          straight: !!scope.isStraightUpload
        });
      }

      /**
       * file upload cancel
       */
      function cancel() {
        fileUploader.upload(false);
      }

      /**
       * thumbnail image 설정
       * @param response
       * @private
       */
      function _setThumbnailImage(response) {
        var data = response.data;
        var fileInfo = data.fileInfo;
        var thumbnailUrl;

        if (thumbnailUrl = fileInfo.thumbnailUrl) {
          // Todo
          // fileAPIservice.upload후 thumbnail image 생성이 비동기 방식에서 동기 방식으로 전환됨에 따라.
          // 기존에 thumbnail image를 출력하기 위해 사용하던 'file_image' socket event가 deprecation 되고
          // fileAPIservice.upload의 response에서 'file_image' socket event이 전달하던 data를 사용하도록 변경되었다.
          // 아래의 코드는 기존에 'file_image' socket event가 들어오던 코드에 대응하기 위해 작성 되었으며,
          // web_client가 배포되고 그다음 backend에서 수정된 내용을 배포한 후에는 'createThumbnailImage'로
          // 전달하는 data format 변경과 'file_image' 관련된 코드 삭제가 이루어져야 한다.
          jndPubSub.pub('createdThumbnailImage', {
            data: {
              message: {
                id: data.messageId,
                content: {
                  extraInfo: {
                    width: fileInfo.width,
                    height: fileInfo.height,
                    orientation: fileInfo.orientation,
                    thumbnailUrl: thumbnailUrl
                  }
                }
              }
            }
          });
        }
      }

      /**
       * file upload 정보 분석자에 전달
       * @private
       */
      function _trackFileUploadInfo(response) {
        // analytics
        var share_target = "";
        var fileInfo = response.data.fileInfo;
        var topicType;
        var file_meta;
        var upload_data;

        switch (scope.selectedEntity.type) {
          case 'channels':
            topicType = 'public';
            share_target = "topic";
            break;
          case 'privategroups':
            topicType = 'private';
            share_target = "private group";
            break;
          case 'users':
            topicType = 'users';
            share_target = "direct message";
            break;
          default:
            topicType = 'invalid';
            share_target = "invalid";
            break;
        }
        try {
          AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_UPLOAD, {
            'RESPONSE_SUCCESS': true,
            'TOPIC_ID': scope.selectedEntity.id,
            'FILE_ID': response.data.messageId
          });
        } catch (e) {
        }

        file_meta = (response.data.fileInfo.type).split("/");
        upload_data = {
          "entity type"   : share_target,
          "category"      : file_meta[0],
          "extension"     : response.data.fileInfo.ext,
          "mime type"     : response.data.fileInfo.type,
          "size"          : response.data.fileInfo.size
        };

        analyticsService.mixpanelTrack( "File Upload", upload_data );
      }
    }
  }
})();
