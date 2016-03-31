/**
 * @fileoverview file controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightFileCtrl', RightFileCtrl);

  /* @ngInject */
  function RightFileCtrl($scope, $filter, Loading, memberService, publicService, RightFile, Tutorial, UserList) {

    _init();

    // First function to be called.
    function _init() {
      // file controller에 전달되는 data가 tab(file, star, mention)마다 각각 다르므로 message data를
      // file controller에서 사용가능한 data format으로 convert함
      var file = $scope.file = RightFile.convert($scope.fileType, $scope.fileData);

      $scope.file.extWriter = $scope.writer = UserList.get(file.writerId);

      // file tab에서 사용되는 file controller
      $scope.isFileTab = file.type === 'file';

      $scope.writerName = $scope.writer.name;
      $scope.profileImage = memberService.getProfileImage($scope.writer.id, 'small');
      $scope.createDate = $filter('getyyyyMMddformat')(file.createdAt);
      $scope.contentTitle = file.contentTitle;

      $scope.isStarred = file.isStarred || false;
      if (file.content) {
        $scope.isExternalShared = file.content.externalShared;
      }

      $scope.getExternalShare = getExternalShare;
      $scope.setExternalShare = setExternalShare;

      $scope.isDisabledMember = isDisabledMember;
      $scope.isFileOwner = $filter('isFileWriter')(file);
      $scope.isAdmin = memberService.isAdmin();

      $scope.loadingBar = Loading.getTemplate();
      if (file.contentFileUrl) {
        _setFileDownLoad(file.isIntegrateFile, file.contentTitle, file.contentFileUrl);
      }

      // dropdown menu on/off status
      $scope.status = {
        isOpen: false
      };

      Tutorial.hideTooltip('filetab');
    }

    /**
     * disabled member 여부
     * @returns {*|boolean|*}
     */
    function isDisabledMember() {
      return publicService.isDisabledMember($scope.file.extWriter);
    }

    /**
     * file download 설정
     * @param {boolean} isIntegrateFile
     * @param {string} contentTitle
     * @param {string} contentFileUrl
     * @private
     */
    function _setFileDownLoad(isIntegrateFile, contentTitle, contentFileUrl) {
      var value;

      $scope.isIntegrateFile = isIntegrateFile;
      value = $filter('downloadFile')(isIntegrateFile, contentTitle, contentFileUrl);

      $scope.downloadUrl = value.downloadUrl;
      $scope.originalUrl = value.originalUrl;
    }

    /**
     * external share 전달한다.
     * @returns {string}
     */
    function getExternalShare() {
      return $scope.isExternalShared;
    }

    /**
     * external share 설정한다.
     * @param {boolean} isExternalShared
     */
    function setExternalShare(isExternalShared) {
      $scope.isExternalShared = isExternalShared;
    }
  }
})();
