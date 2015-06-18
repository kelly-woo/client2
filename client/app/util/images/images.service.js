/**
 * @fileoverview 이미지들을 위한 공통된 로직 집합.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ImagesHelper', ImagesHelper);

  /* @ngInject */
  function ImagesHelper($compile) {
    var that = this;

    // 현재 사용하고 있는 모달에서 원래 가지고 있는 margin-top 의 값 * 2 에 10을 그냥 더한 값
    var HEIGHT_OFFSET = 50;
    // 화면에 꽉 찰 수도 있으니 양 옆에 남겨두고 싶은 공간
    var WIDTH_OFFSET = 40;

    that.compileImageElementWithScope = compileImageElementWithScope;

    that.getImageLoaderLoadingElement = getImageLoaderLoadingElement;
    that.getImageLoaderElement = getImageLoaderElement;

    that.hideImageElement = hideImageElement;
    that.showImageElement = showImageElement;

    that.setVerticalCenter = setVerticalCenter;

    that.getImageOptionForFullScreen = getImageOptionForFullScreen;

    /**
     * 엘레멘트와 스코프를 바인딩시킨다.
     * @param {HTMLElement|jQueryElement} element - 바인딩 시킬 엘레멘트
     * @param {scope} scope - 바인딩시킬 스코프
     */
    function compileImageElementWithScope(element, scope) {
      $compile(element)(scope);
    }

    /**
     * background 없는 loading element 를 리턴한다.
     * @returns {jQueryElement} loadingElement
     */
    function getImageLoaderLoadingElement() {
      var loadingMarkUp = '<div class="loading_bar icon-loading"></div>';

      return angular.element(loadingMarkUp);
    }

    /**
     * image-loader directive 를 사용할 수 있는 dom element를 생성 리턴한다.
     * @param {jQueryElementt} newThumbnail - image-loader directive 를 사용하는 element
     * @returns {jQueryElement}
     */
    function getImageLoaderElement(newThumbnail) {
      newThumbnail = !!newThumbnail ? newThumbnail : '';
      var newImageLoader = '<div class="cursor_pointer opac-zero"' +
        'image-loader="' + newThumbnail + '"></div>';

      return angular.element(newImageLoader);
    }

    /**
     * 이미지 엘레멘트를 화면에서 숨긴다.
     * @param {HTMLElement} imageElement - 화면에서 숨길 이미지 엘레멘트
     */
    function hideImageElement(imageElement) {
      // hide image while rotating.
      imageElement.css('display', 'hidden');
    }

    /**
     * 이미지 엘레멘트를 화면에 보여준다.
     * @param {HTMLElement} imageElement - 화면에 보여줄 이미지 엘레멘트
     * @param {object} displayProperty - 본래 엘레멘트가 가지고 있었던 display properties
     */
    function showImageElement(imageElement, displayProperty) {
      imageElement.addClass('opac-in-fast');
      imageElement.css(displayProperty);
    }

    /**
     * imageElement 를 중앙에 위치시킨다.
     * 만약 full screen 이라면 window에 기준을 마추고 중앙정렬시킨다.
     * full screen이 아니라면 jqParentElement에 기준을 두고 중앙정렬시킨다.
     * @param {HTMLElement} imageElement - 중앙정렬 될 엘레멘트
     * @param {jQueryElement} jqParentElement - 기준이 될 엘레멘트, 이미지를 감싸고 있는 엘레멘트
     * @param {boolean} isFullScreen - full screen이어야 하는지 아닌지 알려주는 flag
     */
    function setVerticalCenter(imageElement, jqParentElement, isFullScreen) {
      var imageHeight = _getHeightOfElement(imageElement);

      if (isFullScreen) {
        var jqFullScreenImageWrapper = $('.modal-full .modal-dialog') || jqParentElement;
        _setVertical(imageHeight, $(window).height(), jqFullScreenImageWrapper, HEIGHT_OFFSET);
      } else {
        _setVertical(imageHeight, jqParentElement.height(), $(imageElement), 0);
      }
    }

    /**
     * 내용의 높이와 컨테이너의 높이를 계산해 중앙 정렬이 필요하면 elementToBeMove를 중앙에 위치시킨다.
     * @param {number} contentHeight - 중앙에 위치 될 내용물의 높이
     * @param {number} containerHeight - 기준이 될 컨테이너의 높이
     * @param {jQueryElement} elementToBeMoved - 중앙에 위치될 엘레멘트
     * @param {number} heightOffset - elementToBeMove 주위에 여백으로 있어야 할 공간
     * @private
     */
    function _setVertical(contentHeight, containerHeight, elementToBeMoved, heightOffset) {
      var heightDiff = containerHeight - contentHeight - heightOffset;
      if (heightDiff > 0) {
        elementToBeMoved.css('marginTop', (containerHeight - contentHeight) / 2 + 'px');
      }
    }

    /**
     * element 의 높이값을 리턴한다.
     * @param {domElement} element - 높이를 추출해낼 엘레멘트
     * @returns {Number} height - elementt 의 높이
     * @private
     */
    function _getHeightOfElement(element) {
      if (element instanceof jQuery) {
        return element.height();
      }
      return parseInt(element.getAttribute('height'), 10) ;
    }

    function getImageOptionForFullScreen() {
      return {
        maxWidth: $(window).width() - WIDTH_OFFSET,
        maxHeight: $(window).height() - HEIGHT_OFFSET
      };
    }
  }
})();
