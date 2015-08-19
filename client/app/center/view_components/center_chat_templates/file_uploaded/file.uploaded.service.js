/**
 * @fileoverview content 의 type 이 file 일 경우에한해서 thumbnail 정보를 리턴한다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileUploaded', FileUploaded);

  /* @ngInject */
  function FileUploaded($filter) {
    this.getSmallThumbnailUrl = getSmallThumbnailUrl;
    this.getLargeThumbnailUrl = getLargeThumbnailUrl;

    /**
     * 작은 thumbnail 주소를 리턴한다.
     * @param {object} content - type 이 file 인 message
     * @returns {*}
     */
    function getSmallThumbnailUrl(content) {
      return $filter('getFileUrl')(content.extraInfo.smallThumbnailUrl);
    }

    /**
     * 큰 thumbnail 주소를 리턴한다.
     * @param {object} content - type 이 file 인 message
     * @returns {*}
     */
    function getLargeThumbnailUrl(content) {
      return $filter('getFileUrl')(content.extraInfo.largeThumbnailUrl);
    }
  }
})();
