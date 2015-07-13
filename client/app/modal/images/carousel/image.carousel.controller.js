/**
 * @fileoverview image carousel controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('ImageCarouselCtrl', imageCarouselCtrl);

  var templateUrl = 'app/modal/images/carousel/image.carousel.content.html';
  var imageCarouselTemplate;

  /* @ngInject */
  function imageCarouselCtrl($scope, $templateRequest, $state, $filter, modalHelper, ImageCarousel, data) {
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

          entityId: data.entityId,
          writerId: data.writerId,
          keyword: data.keyword,

          // server api
          getImage: data.getImage,

          onClose: function() {
            $scope.close();
          },
          onRender: function($itemScope, messageId, data) {
            $itemScope.messageId = messageId;

            $itemScope.userName = data.userName;
            $itemScope.uploadDate = $filter('getyyyyMMddformat')(data.uploadDate);
            $itemScope.fileTitle = data.fileTitle;
            $itemScope.fileUrl = data.fileUrl;

            // fileDetail 수행
            $itemScope.fileDetail = function(messageId, userName) {
              // ImageCarousel 닫고 fileDetail 열기

              ImageCarousel.close();
              $state.go('messages.detail.files.redirect', {itemId: messageId + '', userName: userName});
            };
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
