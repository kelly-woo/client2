(function(){
  'use strict';

  // FILE UPLOAD controller
  angular
    .module('jandiApp')
    .controller('FileUploadModalCtrl', FileUploadModalCtrl);

  /* @ngInject */
  function FileUploadModalCtrl($scope, $modalInstance, currentSessionHelper, fileAPIservice, TopicFolderModel,
                               fileUploadOptions, ImagesHelper, Mentionahead, jndPubSub, RoomTopicList) {
    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.mentionahead = {
        status: Mentionahead.CLOSE,
        list: []
      };

      $scope.selectedEntity = currentSessionHelper.getCurrentEntity();
      $scope.selectedEntityId = $scope.selectedEntity.id;
      $scope.isLoading = false;

      $scope.selectOptions = TopicFolderModel.getNgOptions(
        fileAPIservice.getShareOptionsWithoutMe(RoomTopicList.toJSON(true), currentSessionHelper.getCurrentTeamUserList())
      );

      $scope.fileUploadOptions = fileUploadOptions;
      $modalInstance.result.then(_clearFileUploader, _clearFileUploader);

      _attachEvent();
    }

    /**
     * on listeners
     * @private
     */
    function _attachEvent() {
      $scope.$watch('dataUrl', _onDataUrlChange);
      $scope.$watch('selectedEntityId', _onSelectedEntityIdChange);
    }

    /**
     * data url change handler
     * @param newValue
     * @private
     */
    function _onDataUrlChange(newValue) {
      if (!!newValue) {
        _onNewDataUrl(newValue);
      }
    }

    /**
     * 공유 entityid 변경 핸들러
     * @private
     */
    function _onSelectedEntityIdChange(entityId) {
      $scope.mentionahead.list = Mentionahead.getMentionListForUploading(entityId);
    }

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
     * clear fileuploader
     * @private
     */
    function _clearFileUploader() {
      if (!fileUploadOptions.fileUploader.isUploadingStatus()) {
        fileAPIservice.clearUploader();
        fileAPIservice.clearCurUpload();
      }
    }
  }
}());
