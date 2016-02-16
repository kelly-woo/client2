/**
 * @fileoverview Comment Message 서비스
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MessageComment', MessageComment);

  /* @ngInject */
  function MessageComment(centerService) {
    this.isChild = isChild;
    this.isTitle = isTitle;

    /**
     *
     * @param index
     * @returns {boolean}
     */
    function isTitle(index, list) {
      var messages = list;
      var message = messages[index];
      var prevMessage;
      var feedbackId;

      if (index > 0) {
        prevMessage = messages[index - 1];
        feedbackId = message.feedbackId;
        if (prevMessage &&
          (prevMessage.messageId == feedbackId || prevMessage.feedbackId === feedbackId)) {
          return false;
        }
      }
      return true;
    }

    /**
     *
     * @param index
     * @returns {boolean}
     */
    function isChild(index, list) {
      var messages = list;
      var message = messages[index];
      var prevMessage = messages[index - 1];
      var writerId = message.message.writerId;

      if (!isTitle(index, list) &&
        prevMessage.message.contentType === 'comment' &&
        prevMessage.message.writerId === writerId &&
        !centerService.isElapsed(prevMessage.time, message.time)) {
        return true;
      } else {
        return false;
      }
    }
  }
})();
