(function(){
  'use strict';

  // FILE UPLOAD controller
  angular
    .module('jandiApp')
    .controller('FileUploadModalCtrl', FileUploadModalCtrl);

  /* @ngInject */
  function FileUploadModalCtrl($rootScope, $scope, $timeout, modalHelper, currentSessionHelper, analyticsService,
                               fileAPIservice, ImagesHelper, AnalyticsHelper, TopicFolderModel, fileUplodOptions) {
    var PUBLIC_FILE = 744;    // PUBLIC_FILE code
    var jqProgressBar;
    var fileUploader;
    var fileObject;

    $scope.currentEntity = currentSessionHelper.getCurrentEntity();

    $scope.isLoading = false;

    // $scope.joinedChannelList 는 어차피 parent scope 에 없기때문에 rootScope까지 가서 찾는다. 그렇기에 left와 right panel 사이에 sync가 맞는다.
    $scope.selectOptions = TopicFolderModel.getNgOptions(fileAPIservice.getShareOptionsWithoutMe($scope.joinedEntities, $scope.memberList));
    $scope.eventHandler = function eventHandler(btnType) {
      fileUploader.upload(!!btnType);
    };

    fileObject = fileUplodOptions.fileUploader.fileObject;
    if (fileUplodOptions.fileUploader.isUploadingStatus()) {
      // 현재 upload 중이고 이어서 upload함
      fileUploader = fileUplodOptions.fileUploader;
      fileUploader.updateUploadStatus();
    } else {
      // 최초 upload함
      fileUploader = fileUplodOptions.fileUploader.setOptions({
        // file api 제공 여부
        supportFileAPI: true,
        // file object convert
        convertFile: function(file) {
          if (file.comment) {
            $scope.comment = file.comment;
          }
      
          return $scope.file = file;
        },
        // fileInfo object convert
        convertFileInfo: function(file) {
          var fileInfo;
      
          if (file.isImage) {
            createImgEle($scope, file);
          }
      
          fileInfo = {
            isPrivateFile: false,
            uploadType: file.uploadType,
            permission: PUBLIC_FILE,
        
            // file upload시 공유 대화방 수정 가능함.
            share: $scope.currentEntity.id,
            // file upload시 comment 수정 가능함.
            comment: $scope.comment
          };
      
          // upload modal title 갱신, fileInfo에 title 설정
          $timeout(function() {
            $('#file_upload_title').val(fileInfo.title = file.name);
          }, 100);

      
          // upload modal currentEntity 갱신
          $scope.currentEntity = $scope.currentEntity;
      
          $('#file_upload_comment').focus();
      
          return $scope.fileInfo = fileInfo;
        },
        // upload sequence 시작
        onBegin: function() {
          $scope.lastIndex = fileObject.size();
        },
        // 하나의 file upload 시작
        onUpload: function(file, fileInfo) {
          // 공유 entity id 와 comment는 최초 설정된 값에서 변경 가능하므로 재설정함
          fileInfo.share = $scope.currentEntity.id;

          fileInfo.comment = $scope.comment;
      
          // scope comment 초기화
          $scope.comment = '';
      
          // progress bar 초기화
          $rootScope.curUpload = {};
          $rootScope.curUpload.lFileIndex = !!fileUploader.lastProgressIndex;
          $rootScope.curUpload.cFileIndex = !!fileUploader.currentProgressIndex;
          $rootScope.curUpload.title = file.name;
          $rootScope.curUpload.progress = 0;
          $rootScope.curUpload.status = 'initiate';
        },
        // 하나의 file upload 중
        onProgress: function(evt, file) {
          $scope.lastIndex = fileObject.size();
      
          // stop transition
          jqProgressBar && jqProgressBar.removeClass('init-progress-bar');
      
          // progress bar의 상태 변경
          $rootScope.curUpload = {};
          $rootScope.curUpload.lFileIndex = fileUploader.lastProgressIndex;
          $rootScope.curUpload.cFileIndex = fileUploader.currentProgressIndex;
          $rootScope.curUpload.title = file.name;
          $rootScope.curUpload.progress = parseInt(100.0 * evt.loaded / evt.total);
          $rootScope.curUpload.status = 'uploading';
        },
        // 하나의 file upload 완료
        onSuccess: function(response, index, length) {
          _setProgressBarStyle('success', index, length);
          $rootScope.curUpload.status = 'done';
      
          // analytics
          var share_target = "";
          var fileInfo = response.data.fileInfo;
          var topicType;
      
          switch ($scope.currentEntity.type) {
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
              'TOPIC_ID': $scope.currentEntity.id,
              'FILE_ID': response.data.messageId
            });
          } catch (e) {
          }
      
      
          var file_meta = (response.data.fileInfo.type).split("/");
      
          var upload_data = {
            "entity type"   : share_target,
            "category"      : file_meta[0],
            "extension"     : response.data.fileInfo.ext,
            "mime type"     : response.data.fileInfo.type,
            "size"          : response.data.fileInfo.size
          };
      
          analyticsService.mixpanelTrack( "File Upload", upload_data );
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
      
          $rootScope.curUpload.status = 'error';
          $rootScope.curUpload.hasError = true;
          $rootScope.curUpload.progress = 0;
        },
        // upload confirm end
        onConfirmEnd: function() {
          modalHelper.closeModal();

          delete $rootScope.fileUploader;
        },
        // upload sequence end
        onEnd: fileUplodOptions.onEnd
      }); 
    }

    /**
     * image파일 upload시 upload modal에 보여지는 미리보기 용 dataUrl 생성
     */
    function createImgEle($scope, file) {
      var fileReader;
      var index;

      if (file.dataUrl) {
        $scope.dataUrl = '';
        $timeout(function() {
          $scope.$apply(function($scope) {
            $scope.dataUrl = file.dataUrl;
          });
        });
      } else {
        fileReader = new window.FileReader();

        $scope.dataUrl = '';
        fileReader.onload = function(e) {
          $scope.$apply(function($scope) {
            $scope.dataUrl = e.target.result;
          });
        };
        fileReader.readAsDataURL(file);
      }
    }

    $scope.$watch('dataUrl', function(newValue, oldValue){
      if (!!newValue) {
        _onNewDataUrl(newValue);
      }
    });

    /**
     * dataUrl 가 바뀔 때마다 image-loader를 사용해서 dataUrl 의 이미지를 보여준다.
     * @param {string} newDataUrl - 정확히 string 은 아니고 base64 그놈이다
     * @private
     */
    function _onNewDataUrl(newDataUrl) {
      var blobFile;
      var jqImageLoader;
      var jqImageLoaderContainer;

      blobFile = fileAPIservice.dataURItoBlob(newDataUrl);
      $scope.blobFile = blobFile;

      jqImageLoader = ImagesHelper.getImageLoaderElement();

      jqImageLoader.attr({
        'isBlob': true,
        'image-max-height': 172
      });

      ImagesHelper.compileImageElementWithScope(jqImageLoader, $scope);

      jqImageLoaderContainer = $('.upload-image-preview');
      jqImageLoaderContainer.empty();

      if (jqImageLoaderContainer.length) {
        jqImageLoaderContainer.append(jqImageLoader);
      }
    }

    /**
     * progress bar의 style을 설정함
     * @param {string} type - 설정 type
     * @param {number} index - 현재 upload되는 file의 index
     * @param {number} length - upload 되는 file의 length
     */
    function _setProgressBarStyle(type, index, length) {
      jqProgressBar = jqProgressBar || $('.progress-striped').children();

      // progress bar 100% 상태에서 다음 file을 upload 위해 progress bar 0%로 변경시
      // transition style 적용되어 animation 들어가는 것을 방지 하기위해 confirm done
      // 일때 transition 적용을 잠시 해제함.
      if (index !== length) {
        if (type === 'success') {
          jqProgressBar.addClass('init-progress-bar');
        } else {
          jqProgressBar.css('width', 0).addClass('init-progress-bar');
        }
      }
    }
  }
}());
