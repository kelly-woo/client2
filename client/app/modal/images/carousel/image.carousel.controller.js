/**
 * @fileoverview image carousel controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('ImageCarouselCtrl', imageCarouselCtrl);

  var IMAGE_CAROUSEL_TEMPLATE_URL = 'app/modal/images/carousel/image.carousel.content.html';
  var _imageCarouselTemplate;

  /* @ngInject */
  function imageCarouselCtrl($scope, $templateRequest, $state, $filter, modalHelper, ImageCarousel, data) {
    $scope.hasNext = false;
    $scope.hasPrev = false;

    $scope.onload = onload;

    /**
     * image carousel modal의 dom load callback
     */
    function onload() {
      if (_imageCarouselTemplate) {
        _setImageCarousel(_imageCarouselTemplate);
      } else {
        $templateRequest(IMAGE_CAROUSEL_TEMPLATE_URL)
          .then(function(template) {
            _setImageCarousel(_imageCarouselTemplate = template);
          });
      }
    }

    $scope.close = close;

    /**
     * modal close
     */
    function close() {
      modalHelper.closeModal();
    }

    /**
     * image caoursel 설정
     * @param {string} imageItemTemplate - image item template
     * @private
     */
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
          // is single
          isSingle: data.isSingle,
          // image carousel close callback
          onClose: function() {
            $scope.close();
          },
          // image item render callback
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
          // image carousel button status callback
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
