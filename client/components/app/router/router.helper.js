/**
 * @fileoverview route 이동간에 전달되어져야할 global한 data들을 관리하는 service
 */
(function() {
  'use strict';

  angular
    .module('app.router')
    .service('RouterHelper', RouterHelper);

  /* @ngInject */
  function RouterHelper() {
    var _scrollToCommentId;
    var rightPanelTail;

    this.setCommentToScroll = setCommentToScroll;
    this.getCommentIdToScroll = getCommentIdToScroll;
    this.hasCommentToScroll = hasCommentToScroll;
    this.resetCommentIdToScroll = resetCommentIdToScroll;

    this.getRightPanelTail = getRightPanelTail;
    this.setRightPanelTail = setRightPanelTail;

    function setCommentToScroll(commentId) {
      _scrollToCommentId = commentId;
    }


    function getCommentIdToScroll() {
      return _scrollToCommentId;
    }

    function hasCommentToScroll() {
      return !!_scrollToCommentId && _scrollToCommentId > 0;
    }

    function resetCommentIdToScroll() {
      _scrollToCommentId = -1;
    }

    /**
     * right panel back tail 전달
     * @returns {*}
     */
    function getRightPanelTail() {
      return rightPanelTail;
    }

    /**
     * * right panel back tail 설정
     * @param value
     */
    function setRightPanelTail(value) {
      rightPanelTail = value;
    }
  }
})();
