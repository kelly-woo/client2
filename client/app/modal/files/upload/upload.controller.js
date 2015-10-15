(function(){
  'use strict';

  // FILE UPLOAD controller
  angular
    .module('jandiApp')
    .controller('FileUploadModalCtrl', FileUploadModalCtrl);

  /* @ngInject */
  function FileUploadModalCtrl($scope, $modalInstance, currentSessionHelper, fileAPIservice, TopicFolderModel,
                               fileUploadOptions, ImagesHelper, memberService, entityAPIservice, EntityMapManager) {
    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.selectedEntity = currentSessionHelper.getCurrentEntity();
      $scope.isLoading = false;

      $scope.selectOptions = TopicFolderModel.getNgOptions(fileAPIservice.getShareOptionsWithoutMe($scope.joinedEntities, $scope.memberList));

      $scope.fileUploadOptions = fileUploadOptions;
      $scope.setMemberListForMention = setMemberListForMention;
      $modalInstance.result.then(_clearFileUploader, _clearFileUploader);

      _on();
    }

    /**
     * on listeners
     * @private
     */
    function _on() {
      $scope.$watch('dataUrl', _onDataUrlChange);
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
     * mention 입력을 위한 member list를 설정한다.
     * @param {object} $mentionScope
     * @param {object} $mentionCtrl
     */
    function setMemberListForMention($mentionScope, $mentionCtrl) {
      var currentMemberId = memberService.getMemberId();

      $scope.$watch('selectedEntity', function(entity) {
        var mentionList = [];
        var members;

        if (entity && /channels|privategroups/.test(entity.type)) {
          members = entityAPIservice.getMemberList(entity);
          _.forEach(members, function(memberId) {
            var member = EntityMapManager.get('total', memberId);
            if (member && currentMemberId !== member.id && member.status === 'enabled') {
              member.extViewName = '[@' + member.name + ']';
              member.extSearchName = member.name;
              mentionList.push(member);
            }
          });
        }

        $mentionCtrl.setMentions(_.chain(mentionList).uniq('id').sortBy(function (item) {
          return item.name.toLowerCase();
        }).value());
      });
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
