/**
 * @fileoverview Center renderer 서비스
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

    function _init() {

    }

    function getStarCssClass(msg) {
      return msg.message.isStarred ? '' : 'off msg-item__action';
    }

    function isSticker(msg) {
      return msg.message.contentType.indexOf('sticker') !== -1;
    }

    function hasMore(msg) {
      return isSticker(msg) || isMyMessage(msg);
    }

    function hasStar(msg) {
      return !isSticker(msg);
    }

    function isMyMessage(msg) {
      return (memberService.getMemberId() === msg.fromEntity);
    }

    function isDisabledMember(msg) {
      var currentEntity = (msg.fromEntity) || currentSessionHelper.getCurrentEntity();
      return publicService.isDisabledMember(currentEntity);
    }
  }
})();
