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
        data.id = fileData.id;

        data.hasPreview = $filter('hasPreview')(fileData.content);
        if (data.hasPreview) {
          data.imageUrl = configuration.server_uploaded + fileData.content.extraInfo.smallThumbnailUrl;
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
      } else if (type === 'star') {

      }

      return data;
    }
  }
})();
