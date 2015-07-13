/**
 * @fileoverview image carousel controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('ImageCarouselCtrl', imageCarouselCtrl);

  /* @ngInject */
  function imageCarouselCtrl($scope, $templateRequest, $filter, modalHelper, ImageCarousel, data) {
    var templateUrl = 'app/modal/images/carousel/image.carousel.content.html';
    var imageCarouselTemplate;

    $scope.onload = onload;

    function onload() {
      $scope.hasNext = false;
      $scope.hasPrev = false;

      if (imageCarouselTemplate) {
        _setImageCarousel(imageCarouselTemplate);
      } else {
        $templateRequest(templateUrl)
          .then(function(template) {
            _setImageCarousel(imageCarouselTemplate = template);
          });
      }
    }

    $scope.close = close;
    function close() {
      modalHelper.closeModal();
    }

    function _setImageCarousel(imageItemTemplate) {
      ImageCarousel.init({
          userName: data.userName,
          uploadDate: data.uploadDate,
          fileTitle: data.fileTitle,
          fileUrl: data.fileUrl
        },
        {
          imageItemTemplate: imageItemTemplate,

          messageId: data.messageId,

          roomId: data.roomId,
          writerId: data.writerId,
          keyword: data.keyword,

          // server api
          getImage: data.getImage,

          onHide: function() {
            $scope.close();
          },
          onRender: function($itemScope, data) {
            $itemScope.userName = data.userName;
            $itemScope.uploadDate = $filter('getyyyyMMddformat')(data.uploadDate);
            $itemScope.fileTitle = data.fileTitle;
            $itemScope.fileUrl = data.fileUrl;
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
  }
})();
