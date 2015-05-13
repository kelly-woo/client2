(function(){
  'use strict';

  // FILE UPLOAD controller
  angular
    .module('jandiApp')
    .controller('fileUploadModalCtrl', function($rootScope, $scope, $modalInstance, fileAPIservice, analyticsService, $timeout) {
      var PRIVATE_FILE = 740,   // PRIVATE_FILE code
          PUBLIC_FILE = 744,    // PUBLIC_FILE code
          currentEntity,        // 현재 file upload를 수행하는 사용자의 entity
          fileObject,
          it,
          fileUploadQueue,
          fileUploadIndex,
          lock,
          lProgressBarIndex,
          cProgressBarIndex;

      $scope.isLoading = false;

      // $scope.joinedChannelList 는 어차피 parent scope 에 없기때문에 rootScope까지 가서 찾는다. 그렇기에 left와 right panel 사이에 sync가 맞는다.
      $scope.selectOptions = fileAPIservice.getShareOptions($scope.joinEntities, $scope.memberList);

      currentEntity = $scope.currentEntity;
      fileObject = $scope.fileObject;

      // file object 반복자
      it = fileObject.iterator();

      $scope.currentIndex = 1;                // 현재 file index
      $scope.lastIndex = fileObject.size();   // 마지막 file index
      $scope.eventHandler = eventHandler;     // file upload btn handler

      $scope.file = it.next();                                  // 첫 file
      $scope.fileInfo = createFileInfo($scope, $scope.file);    // 첫 file에 대한 file 정보

      fileUploadQueue = [];                   // file upload queue
      fileUploadIndex = 0;                    // file upload queue index
      lock = false;                           // file upload queue locker(순차 upload를 위함)

      lProgressBarIndex = cProgressBarIndex = 0;

      function eventHandler(btnType) {

        // upload event 처리
        if (btnType === 'upload') {
          // upload 수행 해야할 file이 존재한다면 file에 대한 file 정보 생성
          // $scope.fileInfo = createFileInfo($scope, $scope.file, $scope.fileInfo.currentEntity);

          lProgressBarIndex++;

          fileUploadQueue.push((function($tScope, $cScope, currentIndex, file, fileInfo) {
            fileInfo.share = $scope.fileInfo.currentEntity.id;    // 공유 대화방 id
            fileInfo.comment = $scope.comment;                    // file upload message에 대한 comment
            $cScope.comment = '';

            return function(callback) {
              var tmpFileInfo = angular.extend({}, fileInfo);

              delete tmpFileInfo.currentEntity;

              lock = true;

              cProgressBarIndex++;

              // progress bar 초기화
              $tScope.curUpload = {};
              $tScope.curUpload.progress = 0;

              $tScope.fileQueue = fileAPIservice.upload({
                files: file,
                fileInfo: tmpFileInfo,
                supportHTML: $scope.supportHtml5,
                uploadType: tmpFileInfo.uploadType
              });
              $tScope.fileQueue.then(   // success
                function(response) {
                  if (response == null) {
                    uploadErrorHandler($tScope);
                  } else {
                    $tScope.curUpload.status = 'done';
                    fileAPIservice.broadcastChangeShared();

                    // analytics
                    var share_target = "";
                    switch (currentEntity.type) {
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
                  }

                  // console.log('done', arguments);
                  callback();         // upload success 후 callback 수행
                },
                function(error) {     // error
                  uploadErrorHandler($tScope);

                  // console.log('error', arguments);
                  callback();         // upload error 후 callback 수행
                },
                function(evt) {       // progress
                  // center.html에 표현되는 progress bar의 상태 변경
                  $tScope.curUpload = {};
                  // $tScope.curUpload.lFileIndex = $cScope.lastIndex;
                  // $tScope.curUpload.cFileIndex = currentIndex;

                  $tScope.curUpload.lFileIndex = lProgressBarIndex;
                  $tScope.curUpload.cFileIndex = cProgressBarIndex;

                  $tScope.curUpload.title = evt.config.file.name;
                  $tScope.curUpload.progress = parseInt(100.0 * evt.loaded / evt.total);
                  $tScope.curUpload.status = 'uploading';
                }
              );
            };
          }($rootScope, $scope, $scope.currentIndex, $scope.file, $scope.fileInfo)));

          // lock이 풀려 있다면 다음 file을 upload 시작
          if (!lock) {
            fileUploadShifting();
          }
        } else {
          fileUploadIndex++;  // fileUploadQueue index 증가

          // 모든 작업이 마무리 되었다면 progress bar 숨기기
          $scope.lastIndex === fileUploadIndex && closeProgressBar();
        }

        // upload modal의 현재 진행중인 file의 index 갱신
        if ($scope.lastIndex > $scope.currentIndex) {
          $scope.currentIndex = $scope.currentIndex + 1;
        }

        $scope.file = it.next();

        if ($scope.file) {
          // upload 수행 해야할 file이 존재한다면 file에 대한 file 정보 생성
          $scope.fileInfo = createFileInfo($scope, $scope.file, $scope.fileInfo.currentEntity);
        } else {
          // upload 수행 해야할 file이 존재하지 않는다면 upload modal 숨김
          $modalInstance.dismiss('cancel');
        }
      }

      /**
       * fileUploadQueue에서 upload 해야할 file shift
       */
      function fileUploadShifting() {
        var fileUpload;

        if (fileUpload = fileUploadQueue.shift()) {
          // fileUploadQueue에 upload해야할 file이 존재한다면 file upload 시작
          fileUpload(function () {
            fileUploadShifting(); // 다음 file upload 수행
            lock = false;         // lock 풀기
            fileUploadIndex++;    // fileUploadQueue index 증가

            // 모든 작업이 마무리 되었다면 progress bar 숨기기
            $scope.lastIndex === fileUploadIndex && closeProgressBar();
          });
        }
      }

      /**
       * file에 대한 file 정보(request parameter) object 생성
       */
      function createFileInfo($scope, file, entity) {
        var fileInfo;

        if (file.isImage) {
          createImgEle($scope, file);
        }

        fileInfo = {
          title: file.name,
          isPrivateFile: false,
          currentEntity: entity || currentEntity,
          comment: $scope.comment
        };

        // integration upload에 사용되는 fileInfo Object 생성
        if (file._fileInfo) {
          angular.extend(fileInfo, file._fileInfo);
          delete file._fileInfo;
        }

        if (fileInfo.isPrivateFile) {   // privategroups
          fileInfo.permission = PRIVATE_FILE;
          fileInfo.share = '';
        } else {                        // channel
          fileInfo.permission = PUBLIC_FILE;
          fileInfo.share = fileInfo.currentEntity.id;
        }

        $('#file_upload_comment').focus();

        return fileInfo;
      }

      /**
       * file upload시 error 발생 처리
       */
      function uploadErrorHandler($scope) {
        $scope.curUpload.status = 'error';
        $scope.curUpload.hasError = true;
        $scope.curUpload.progress = 0;
      }

      /**
       * file upload 완료 후 progress bar 닫음
       */
      function closeProgressBar() {
        $timeout(function() {
          $('.file-upload-progress-container').animate( {'opacity': 0 }, 500, function() {
            fileAPIservice.clearCurUpload();
          });
        }, 2000);
      }

      /**
       * image파일 upload시 upload modal에 보여지는 미리보기 용 dataUrl 생성
       */
      function createImgEle($scope, file) {
        var fileReader;
        var index;

        fileReader = new window.FileReader();

        $scope.dataUrl = '';
        fileReader.onload = function(e) {
            $scope.dataUrl = e.target.result;
        };
        fileReader.readAsDataURL(file);
      }

      $scope.$watch('dataUrl', function(newValue, oldValue){
        var modalUploadImg;

        if (modalUploadImg = $('.modal-upload-img')) {
          modalUploadImg.prop('src', newValue);
        }
      });

      // $scope.$watch('file', function(cur) {
      //   // uploading image file.
      //   var image_container = document.getElementById('file_preview_container');

      //   if (!$scope.supportHtml5 && angular.isDefined(cur)){
      //     // not supporting html5.
      //     FileAPI.Image(cur)
      //       .preview(464, 224)
      //       .get(function (err, img) {
      //         if( !err ) {
      //           // if there is any element other than flashimage div, remove it from parent including old flash image div.
      //           image_container.innerHTML = '';

      //           // append new flash image div.
      //           image_container.appendChild(img);
      //         }
      //         else {
      //           //console.log(err);
      //           alert('failed to load file. please try again.');
      //           $scope.cancel();
      //         }
      //       });
      //   }
      // });
  });
}());
