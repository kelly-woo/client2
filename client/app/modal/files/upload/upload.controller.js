(function(){
  'use strict';

  // FILE UPLOAD controller
  angular
    .module('jandiApp')
    .controller('FileUploadModalCtrl', FileUploadModalCtrl);

  /* @ngInject */
  function FileUploadModalCtrl($rootScope, $scope, $modalInstance, FilesUpload, fileAPIservice, analyticsService, $timeout) {
    var PUBLIC_FILE = 744;    // PUBLIC_FILE code
    var filesUpload;
    var fileObject;

    $scope.isLoading = false;

    // $scope.joinedChannelList 는 어차피 parent scope 에 없기때문에 rootScope까지 가서 찾는다. 그렇기에 left와 right panel 사이에 sync가 맞는다.
    $scope.selectOptions = fileAPIservice.getShareOptions($scope.joinEntities, $scope.memberList);
    $scope.eventHandler = function eventHandler(btnType) {
      filesUpload.upload(!!btnType);
    };

    fileObject = $scope.fileObject;
    filesUpload = FilesUpload.createInstance(fileObject, {
      // file api 제공 여부
      supportFileAPI: $scope.supportHtml5,
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
        $scope.title = fileInfo.title = file.name;

        // upload modal currentEntity 갱신
        $scope.currentEntity = $scope.currentEntity;

        $('#file_upload_comment').focus();

        return $scope.fileInfo = fileInfo;
      },
      // upload sequence 시작
      onBegin: function() {
        $scope.currentIndex = 1;
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
        $rootScope.curUpload.lFileIndex = filesUpload.lastProgressIndex;
        $rootScope.curUpload.cFileIndex = filesUpload.currentProgressIndex;
        $rootScope.curUpload.title = file.name;
        $rootScope.curUpload.progress = 0;
        $rootScope.curUpload.status = 'initiate';

        $timeout(function() {
          $('.progress-striped').children().addClass('progress-bar');
        });
      },
      // 하나의 file upload 중
      onProgress: function(evt) {
        // progress bar의 상태 변경
        $rootScope.curUpload = {};
        $rootScope.curUpload.lFileIndex = filesUpload.lastProgressIndex;
        $rootScope.curUpload.cFileIndex = filesUpload.currentProgressIndex;
        $rootScope.curUpload.title = evt.config.file.name;
        $rootScope.curUpload.progress = parseInt(100.0 * evt.loaded / evt.total);
        $rootScope.curUpload.status = 'uploading';
      },
      // 하나의 file upload 완료
      onSuccess: function(response) {
        $rootScope.curUpload.status = 'done';
        fileAPIservice.broadcastChangeShared();

        // analytics
        var share_target = "";
        switch ($scope.currentEntity.type) {
          case 'channel':
            share_target = "topic";
            break;
          case 'privateGroup':
            share_target = "private group";
            break;
          case 'user':
            share_target = "direct message";
            break;
          default:
            share_target = "invalid";
            break;
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
      // confirm 창에서 upload 선택
      onConfirmDone: function() {
        // progress bar 100% 상태에서 다음 file을 upload 위해 progress bar 0%로 변경시
        // transition style 적용되어 animation 들어가는 것을 방지 하기위해 confirm done
        // 일때 transition 적용을 잠시 해제함.
        $('.progress-striped').children().removeClass('progress-bar');
      },
      // 하나의 file upload error
      onError: function() {
        $rootScope.curUpload.status = 'error';
        $rootScope.curUpload.hasError = true;
        $rootScope.curUpload.progress = 0;
      },
      // upload confirm end
      onConfirmEnd: function() {
        $modalInstance.dismiss('cancel');
      },
      // upload sequence end
      onEnd: function() {
        $('.progress-striped').children().addClass('progress-bar');

        // hide progress bar
        $timeout(function() {
          $('.file-upload-progress-container').animate( {'opacity': 0 }, 500, function() {
            fileAPIservice.clearCurUpload();
          });
        }, 2000);
      }
    });

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
      var modalUploadImg = $('.modal-upload-img');

      if (modalUploadImg.length) {
        modalUploadImg.prop('src', newValue);
      }
    });

  }
}());
