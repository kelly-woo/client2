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
    var _regxPreviewThumbnail = /linkpreview-thumb/;
    var _thumbnailTracker = [];


    this.hasMore = hasMore;
    this.hasStar = hasStar;
    this.isSticker = isSticker;
    this.isDisabledMember = isDisabledMember;
    this.isMyMessage = isMyMessage;
    this.getStarCssClass = getStarCssClass;
    this.getDisabledMemberCssClass = getDisabledMemberCssClass;

    this.hasThumbnailCreated = hasThumbnailCreated;
    this.addToThumbnailTracker = addToThumbnailTracker;
    this.cancelThumbnailTracker = cancelThumbnailTracker;

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
      return !isSticker(msg) || isMyMessage(msg) || memberService.isAdmin();
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
      var currentEntity = (msg && msg.fromEntity) || currentSessionHelper.getCurrentEntity();
      return publicService.isDisabledMember(currentEntity);
    }

    function getDisabledMemberCssClass(msg) {
      return isDisabledMember(msg) ? ' center-panel-disabled-member' : '';
    }

    /**
     * linkPreview 에 thumbnail이 생성되었는지 안되었는지 확인한다.
     * @param {object} linkPreview - link preview object to check
     * @returns {boolean}
     * @private
     */
    function hasThumbnailCreated(linkPreview) {
      return _regxPreviewThumbnail.test(linkPreview.imageUrl);
    }

    function addToThumbnailTracker(messageId, timeout) {
      _thumbnailTracker[messageId] = timeout;
    }

    function cancelThumbnailTracker(messageId) {
      !_thumbnailTracker[messageId] && _thumbnailTracker[messageId].cancel();
      delete _thumbnailTracker[messageId];
    }

  }
})();
