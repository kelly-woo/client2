/**
 * @fileoverview image carousel controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('ImageCarouselCtrl', imageCarouselCtrl);

  /* @ngInject */
  function imageCarouselCtrl($scope, $filter, modalHelper, ImageCarousel, data) {

    $scope.init = init;

    function init() {
      $scope.hasNext = false;
      $scope.hasPrev = false;

      ImageCarousel.init({
          userName: data.userName,
          uploadDate: data.uploadDate,
          fileTitle: data.fileTitle,
          fileUrl: data.fileUrl,
          imageUrl: $scope.server_uploaded + data.fileUrl
        },
        {
          messageId: data.messageId,

          roomId: data.roomId,
          writerId: data.writerId,
          keyword: data.keyword,

          count: 10,

          getImage: data.getImage,

          onHide: function() {
            $scope.close();
          },
          onLookUp: function(data) {
            $scope.userName = data.userName;
            $scope.uploadDate = $filter('getyyyyMMddformat')(data.uploadDate);
            $scope.fileTitle = data.fileTitle;
            $scope.fileUrl = data.fileUrl;
          },
          onButtonStatusChange: function(status) {
            $scope.hasPrev = status.hasPrev;
            $scope.hasNext = status.hasNext;
          }
      });
    }

    $scope.close = close;
    function close() {
      modalHelper.closeModal();
    }
  }
})();
