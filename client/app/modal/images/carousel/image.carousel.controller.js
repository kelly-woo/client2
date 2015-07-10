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
          fileUrl: data.fileUrl
        },
        {
          preloadContainer: '#preload_container_carousel',

          messageId: data.messageId,

          roomId: data.roomId,
          writerId: data.writerId,
          keyword: data.keyword,

          getImage: data.getImage,

          onHide: function() {
            $scope.close();
          },
          onLookUp: function(data) {
            $scope.$apply(function() {
              $scope.userName = data.userName;
              $scope.uploadDate = $filter('getyyyyMMddformat')(data.uploadDate);
              $scope.fileTitle = data.fileTitle;
              $scope.fileUrl = data.fileUrl;
            });
          },
          onButtonStatus: function(status) {
            // 즉각 처리위해 class 수정
            var jqPrevBtn = $('#viewer_prev_btn');
            var jqNextBtn = $('#viewer_next_btn');

            status.hasPrev ? jqPrevBtn.addClass('has-prev') : jqPrevBtn.removeClass('has-prev');
            status.hasNext ? jqNextBtn.addClass('has-next') : jqNextBtn.removeClass('has-next');
          }
      });
    }

    $scope.close = close;
    function close() {
      modalHelper.closeModal();
    }
  }
})();
