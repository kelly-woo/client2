/**
 * @fileoverview 이미지들을 위한 공통된 로직 집합.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ImagesHelper', ImagesHelper);

  function ImagesHelper() {
    var that = this;

    that.hideImageElement = hideImageElement;
    that.showImageElement = showImageElement;


    /**
     * 이미지 엘레멘트를 화면에서 숨긴다.
     * @param {jQueryElement} imageElement - 화면에서 숨길 이미지 엘레멘트
     */
    function hideImageElement(imageElement) {
      // hide image while rotating.
      imageElement.css('display', 'hidden');
    }

    /**
     * 이미지 엘레멘트를 화면에 보여준다.
     * @param {jQueryElement} imageElement - 화면에 보여줄 이미지 엘레멘트
     * @param {object} displayProperty - 본래 엘레멘트가 가지고 있었던 display properties
     */
    function showImageElement(imageElement, displayProperty) {
      imageElement.addClass('opac-in-fast');
      imageElement.css(displayProperty);
    }
  }
})();