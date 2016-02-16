/**
 * @fileoverview
 * @author Soonyoung Park <young.park@tosslab.com>
 * @fixme:

 1. FileUpload 서비스에도 사용하고 있는 $rootScope 의 아래와 같은 요소들을 현재 $scope 로 이관해야 함

 $rootScope.fileQueue.abort('abort');
 $rootScope.curUpload.progress = 0;
 $rootScope.curUpload.isAborted = true;

 2. center 의
 "file-upload-progress-container" css 클래스를 가진 DIV 의 하위 요소들도
 해당 $scope 의 자식 디렉티브로 이관하여 한 곳에서 관리하도록 refactoring 필요
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndFileDropCtrl', JndFileDropCtrl);

  /* @ngInject */
  function JndFileDropCtrl($scope, $rootScope, currentSessionHelper, fileAPIservice, FilesUpload, modalHelper) {
    $scope.onFileSelect = onFileSelect;
    $scope.onFileUploadAbortClick = onFileUploadAbortClick;
    $scope.onFileIconCloseClick = onFileIconCloseClick;

    _init();

    /**
     * 초기화 한다.
     * @private
     */
    function _init() {
      _attachEvents();
    }

    /**
     * 이벤트 핸들러를 attach 한다.
     * @private
     */
    function _attachEvents() {
      $scope.$on('onFileUploadAllClear', _fileUploadAllClear);
    }

    /**
     * Callback function from file finder(navigation) for uploading a file.
     * @param {Array} $files
     * @param {Object} options
     */
    function onFileSelect($files, options) {
      var currentEntity = currentSessionHelper.getCurrentEntity();
      var fileUploader;
      var jqMessageInput;
      var messageInputValue;

      if ($rootScope.fileUploader) {
        fileUploader = $rootScope.fileUploader;

        if (fileUploader.currentEntity.id !== currentEntity.id) {
          // 다른 topic에서 upload를 시도함
          $rootScope.fileUploader.clear();
          $scope.onFileUploadAbortClick();

          fileAPIservice.clearUploader();
          $rootScope.curUpload = {};

          fileUploader = undefined;
        }
      }

      fileAPIservice.cancelClearCurUpload();

      fileUploader = fileUploader || FilesUpload.createInstance();
      fileUploader.currentEntity = currentEntity;

      if (options == null) {
        jqMessageInput = $('#message-input');
        messageInputValue = jqMessageInput.val();
        jqMessageInput.val('').trigger('change');

        options = {
          createFileObject: function(file) {
            file.comment = messageInputValue;
            return file;
          }
        };
      }

      fileUploader
        .setFiles($files, options)
        .then(function() {
          if (fileUploader.fileLength() > 0) {
            $rootScope.fileUploader = fileUploader;
            modalHelper.openFileUploadModal($scope, {
              fileUploader: fileUploader,
              onEnd: function () {
                fileAPIservice.clearUploader();
                fileAPIservice.clearCurUpload();
              }
            });
          }
        });
    }

    /**
     * 모든 file upload를 취소한다.
     * @private
     */
    function _fileUploadAllClear() {
      var currentEntity = currentSessionHelper.getCurrentEntity();

      if ($rootScope.fileUploader) {
        if ($rootScope.fileUploader.currentEntity.id === currentEntity.id) {
          $rootScope.fileUploader.clear();
          $scope.onFileUploadAbortClick();

          fileAPIservice.clearUploader();
          fileAPIservice.clearCurUpload();
        }
      }
    }

    /**
     * file 취소 버튼 클릭시 이벤트 핸들러
     */
    function onFileUploadAbortClick() {
      if (_.isUndefined($rootScope.fileQueue)) return;
      $rootScope.fileQueue.abort('abort');
      $rootScope.curUpload.progress = 0;
      $rootScope.curUpload.isAborted = true;
    }

    /**
     * 업로드 close 버튼 클릭시 이벤트 핸들러
     */
    function onFileIconCloseClick() {
      $('.file-upload-progress-container').animate( {'opacity': 0 }, 500,
        function() {
          $rootScope.curUpload = {};
        }
      );
    }
  }
})();
