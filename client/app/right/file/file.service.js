/**
 * @fileoverview file controller에서 사용가능하도록 file data convert
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileData', FileData);

  /* @ngInject */
  function FileData($filter, configuration) {
    var that = this;

    that.convert = convert;

    function convert(type, fileData) {
      var data = {};

      if (type === 'file') {
        data.type = 'file';
        data.id = fileData.id;

        data.hasPreview = $filter('hasPreview')(fileData.content);
        if (data.hasPreview) {
          data.imageUrl = _getThumbnailUrl(fileData.content.extraInfo.smallThumbnailUrl);
        } else {
          data.icon = $filter('fileIcon')(fileData.content);
        }

        data.writerId = fileData.writerId;
        data.createdAt = fileData.createTime;
        data.commentCount = fileData.commentCount;
        data.contentTitle = fileData.content.title || fileData.content.name;
        data.contentFileUrl = fileData.content.fileUrl;

        data.content = fileData.content;
        data.shareEntities = fileData.shareEntities;
        data.createTime = data.createdAt;

        data.isStarred = fileData.isStarred;
      } else if (type === 'star') {
        data.type = 'star';
        data.id = fileData.message.id;

        data.hasPreview = $filter('hasPreview')(fileData.message.content);
        if (data.hasPreview) {
          data.imageUrl = _getThumbnailUrl(fileData.message.content.extraInfo.smallThumbnailUrl);
        } else {
          data.icon = $filter('fileIcon')(fileData.message.content);
        }

        data.writerId = fileData.message.writerId;
        data.createdAt = fileData.message.createdAt;
        data.commentCount = fileData.message.commentCount;
        data.contentTitle = fileData.message.content.title;
        data.contentFileUrl = '';

        data.shareEntities = fileData.message.shareEntities;
        data.createTime = data.createdAt;

        data.isStarred = true;
      }

      return data;
    }

    function _getThumbnailUrl(url) {
      return (/^http/.test(url) ? '' : configuration.server_uploaded) + url;
    }
  }
})();
