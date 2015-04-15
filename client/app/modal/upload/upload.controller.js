(function(){
  'use strict';

  // FILE UPLOAD controller
  angular
    .module('jandiApp')
    .controller('fileUploadModalCtrl', function($rootScope, $scope, $modalInstance, $window, fileAPIservice, analyticsService, $timeout) {
      var PRIVATE_FILE = 740,
          PUBLIC_FILE = 744,
          currentEntity,
          fileObject,
          iterator,
          fileUploadQueue,
          fileUploadIndex,
          lock;

      $scope.isLoading = false;

      // $scope.joinedChannelList 는 어차피 parent scope 에 없기때문에 rootScope까지 가서 찾는다. 그렇기에 left와 right panel 사이에 sync가 맞는다.
      $scope.selectOptions = fileAPIservice.getShareOptions($scope.joinEntities, $scope.memberList);

      currentEntity = $scope.currentEntity;
      fileObject = $scope.fileObject;

      iterator = fileObject.iterator();

      $scope.currentIndex = 1;
      $scope.lastIndex = fileObject.size();
      $scope.eventHandler = eventHandler;

      $scope.file = iterator.next();
      $scope.fileInfo = createFileInfo($scope, $scope.file);

      fileUploadQueue = [];
      fileUploadIndex = 0;
      lock = false;

      function eventHandler(btnType) {
        if (btnType === 'upload') {
          fileUploadQueue.push((function($tScope, $cScope, currentIndex, file, fileInfo) {
            return function(callback) {
              lock = true;

              // progress bar 초기화
              $tScope.curUpload = {}
              $tScope.curUpload.progress = 0;

              $tScope.fileQueue = fileAPIservice.upload(file, fileInfo, $scope.supportHtml5);
              $tScope.fileQueue.then(
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

                  console.log('done', arguments);
                  callback();
                },
                function(error) {
                  uploadErrorHandler($tScope);

                  console.log('error', arguments);
                  callback();
                },
                function(evt) {
                  $tScope.curUpload = {};
                  $tScope.curUpload.lFileIndex = $cScope.lastIndex;
                  $tScope.curUpload.cFileIndex = currentIndex;
                  $tScope.curUpload.title = evt.config.file.name;
                  $tScope.curUpload.progress = parseInt(100.0 * evt.loaded / evt.total);
                  $tScope.curUpload.status = 'uploading';
                }
              );
            };
          }($rootScope, $scope, $scope.currentIndex, $scope.file, $scope.fileInfo)));

          if (!lock) {
            fileUploadShifting();
          }
        }

        if ($scope.lastIndex > $scope.currentIndex) {
          $scope.currentIndex = $scope.currentIndex + 1;
        }
        $scope.file = iterator.next();

        // console.log('current file ::: ', $scope.file);
        if ($scope.file) {
          $scope.fileInfo = createFileInfo($scope, $scope.file);
        } else {
          $modalInstance.dismiss('cancel');
        }
      }

      function fileUploadShifting() {
        var fileUpload;

        if (fileUpload = fileUploadQueue.shift()) {
          fileUpload(function () {
            fileUploadShifting();
            lock = false;
            fileUploadIndex++;

            if ($scope.lastIndex === fileUploadIndex) {
              closeProgressBar();
            } else {
              // $('.progress-bar').addClass('none-transition').css({width: '0%'}).removeClass('none-transition');
            }
          });
        }
      }

      function createFileInfo($scope, file) {
        var fileInfo;

        if (file.isImage) {
          createImgEle($scope, file);
        }

        fileInfo = {
          title: file.name,
          isPrivateFile: false,
          currentEntity: currentEntity
        };

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

      function uploadErrorHandler($scope) {
        $scope.curUpload.status = 'error';
        $scope.curUpload.hasError = true;
        $scope.curUpload.progress = 0;
      }

      function closeProgressBar() {
        $timeout(function() {
          $('.file-upload-progress-container').animate( {'opacity': 0 }, 500, function() {
            fileAPIservice.clearCurUpload();
          });
        }, 2000);
      }

      function createImgEle($scope, file) {
        var fileReader;

        fileReader = new window.FileReader();
        fileReader.readAsDataURL(file);

        $scope.dataUrl = '';
        fileReader.onload = function(e) {
            $scope.dataUrl = e.target.result;
        };
      }

      // // html5 spec fileApi 제공하지 않는 browser에 대한 image를 flash로 처리한다(IE9>).
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
