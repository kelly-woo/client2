/**
 * @fileoverview file controller에서 사용가능하도록 file data convert
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('RightFile', RightFile);

  /* @ngInject */
  function RightFile($filter, fileAPIservice) {
    var that = this;

    that.convert = convert;

    function convert(type, fileData) {
      var data = {};

      if (type === 'file') {
        data.type = 'file';
        data.id = fileData.id;

        data.isIntegrateFile = fileAPIservice.isIntegrateFile(fileData.content.serverUrl);

        data.mustPreview = $filter('mustPreview')(fileData.content);
        if (!data.mustPreview) {
          data.icon = $filter('fileIcon')(fileData.content);
        }

        data.hasPreview = $filter('hasPreview')(fileData.content);
        if (data.hasPreview) {
          data.imageUrl = $filter('getPreview')(fileData.content, 'small');
        }

        data.writerId = fileData.writerId;
        data.createdAt = fileData.createTime;
        data.contentTitle = fileData.content.title || fileData.content.name;
        data.contentFileUrl = fileData.content.fileUrl;

        data.content = fileData.content;
        data.shareEntities = fileData.shareEntities;
        data.createTime = data.createdAt;

        // static comment count
        fileData.message = {
          commentCount: fileData.commentCount
        };

        // file type인 경우 starred 상태 설정
        data.isStarred = fileData.isStarred;
      } else if (type === 'star') {
        data.type = 'star';
        data.id = fileData.message.id;

        data.isIntegrateFile = fileAPIservice.isIntegrateFile(fileData.message.content.serverUrl);

        data.mustPreview = $filter('mustPreview')(fileData.message.content);
        if (!data.mustPreview) {
          data.icon = $filter('fileIcon')(fileData.message.content);
        }

        data.hasPreview = $filter('hasPreview')(fileData.message.content);
        if (data.hasPreview) {
          data.imageUrl = $filter('getPreview')(fileData.message.content, 'small');
        }

        data.writerId = fileData.message.writerId;
        data.createdAt = fileData.message.createdAt;
        data.contentTitle = fileData.message.content.title;
        data.contentFileUrl = '';

        data.shareEntities = fileData.message.shareEntities;
        data.createTime = data.createdAt;

        // star type 경우 항상 starred 상태
        data.isStarred = true;
      }

      return data;
    }
  }
})();
