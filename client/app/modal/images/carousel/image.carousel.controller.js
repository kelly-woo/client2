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
      ImageCarousel.init({
        pivot: {
          messageId: data.messageId,

          userName: data.userName,
          uploadDate: data.uploadDate,
          fileTitle: data.fileTitle,
          fileUrl: data.fileUrl,
          imageUrl: data.imageUrl
        },

        roomId: data.roomId,
        writerId: data.writerId,
        keyword: data.keyword,

        onHide: function() {
          $scope.close();
        },
        onLookUp: function(data) {
          $scope.userName = data.userName;
          $scope.uploadDate = $filter('getyyyyMMddformat')(data.uploadDate);
          $scope.fileTitle = data.fileTitle;
          $scope.fileUrl = data.fileUrl;
        }
      });
    }

    $scope.close = close;

    function close() {
      modalHelper.closeModal();
    }

    // title
    // imageUrl
    // hasPrev
    // hasNext

  	console.log('image carousel controller loaded ::: ');
    // $scope.photoUrl = 'http://i1.jandi.io:8888/files-private/279/39aa24da719305381c7e7e10e8eda21f.jpg';
  }
})();
