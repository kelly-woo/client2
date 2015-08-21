/**
 * @fileoverview Renderer 에서 필요한 유틸리티 함수
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('RendererUtil', RendererUtil);

  /* @ngInject */
  function RendererUtil(publicService, currentSessionHelper, memberService) {
    this.hasMore = hasMore;
    this.hasStar = hasStar;
    this.isSticker = isSticker;
    this.isDisabledMember = isDisabledMember;
    this.isMyMessage = isMyMessage;
    this.getStarCssClass = getStarCssClass;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
    }

    /**
     * star 에 필요한 css 클래스 문자열을 반환한다.
     * @param {object} msg
     * @returns {string}
     */
    function getStarCssClass(msg) {
      return msg.message.isStarred ? '' : 'off msg-item__action';
    }

    /**
     * sticker 인지 여부를 반환한다.
     * @param {object} msg
     * @returns {boolean}
     */
    function isSticker(msg) {
      return msg.message.contentType.indexOf('sticker') !== -1;
    }

    /**
     * more (...) 버튼의 존재 여부를 반환한다.
     * @param {object} msg
     * @returns {boolean|*}
    */
    function hasMore(msg) {
      return isSticker(msg) || isMyMessage(msg) || memberService.isAdmin();
    }

    /**
     * star 를 사용할 수 있는 메세지인지 여부를 반환한다.
     * @param {object} msg
     * @returns {boolean}
     */
    function hasStar(msg) {
      return !isSticker(msg);
    }

    /**
     * 현재 사용자의 메세지인지 여부를 반환한다.
     * @param {object} msg
     * @returns {boolean}
     */
    function isMyMessage(msg) {
      return (memberService.getMemberId() === msg.fromEntity);
    }

    /**
     * disable 사용자인지 여부를 반환한다.
     * @param {object} msg
     * @returns {*|*|boolean|*|boolean|*}
     */
    function isDisabledMember(msg) {
      var currentEntity = (msg.fromEntity) || currentSessionHelper.getCurrentEntity();
      return publicService.isDisabledMember(currentEntity);
    }
  }
})();
