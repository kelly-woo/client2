(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileUploaded', FileUploaded);

  /* @ngInject */
  function FileUploaded() {
    this.getSmallThumbnailUrl = getSmallThumbnailUrl;
    this.getLargeThumbnailUrl = getLargeThumbnailUrl;

    function getSmallThumbnailUrl(content) {
      return content.extraInfo.smallThumbnailUrl;
    }
    function getLargeThumbnailUrl(content) {
      return content.extraInfo.largeThumbnailUrl;
    }
  }
})();
