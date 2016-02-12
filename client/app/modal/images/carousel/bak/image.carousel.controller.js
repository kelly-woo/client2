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

    _init();

    function _init() {
      $scope.hasNext = false;
      $scope.hasPrev = false;

      $scope.onload = onload;
      $scope.close = close;
    }

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
          fileUrl: data.fileUrl,
          extraInfo: data.extraInfo
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
            $itemScope.downloadUrl = $filter('downloadFile')(false, data.fileTitle, data.fileUrl).downloadUrl;

            $itemScope.fileDetail = _fileDetail;
            $itemScope.imageRotate = _imageRotate;
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

    /**
     * fileDetail 수행
     * @param {string} messageId
     * @param {string} userName
     * @private
     */
    function _fileDetail(messageId, userName) {
      // ImageCarousel 닫고 fileDetail 열기
      ImageCarousel.close();

      if ($state.params.itemId !== messageId) {
        $state.go('files', {itemId: messageId + '', userName: userName});
      }
    }

    /**
     * image rotate
     * @param {object} $event
     * @private
     */
    function _imageRotate($event) {
      var target =  $($event.currentTarget).parent().children('img,canvas');
      var targetClass = target.attr('class') || '';

      if (targetClass.indexOf('rotate-90') > -1) {
        target.removeClass('vertical-image rotate-90');
        target.addClass('rotate-180');
      }
      else if(targetClass.indexOf('rotate-180') > -1) {
        target.removeClass('rotate-180');
        target.addClass('vertical-image rotate-270');
      }
      else if(targetClass.indexOf('rotate-270') > -1) {
        target.removeClass('vertical-image rotate-270');
      }
      else {
        target.addClass('vertical-image rotate-90');
      }

      ImageCarousel.resetPosition();
    }
  }
})();
