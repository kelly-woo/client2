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

    this.setCommentToScroll = setCommentToScroll;
    this.getCommentIdToScroll = getCommentIdToScroll;
    this.hasCommentToScroll = hasCommentToScroll;
    this.resetCommentIdToScroll = resetCommentIdToScroll;

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
  }
})();
