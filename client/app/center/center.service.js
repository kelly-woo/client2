/**
 * A service that helps center controller.
 *
 * No http request is made from this service.
 *
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('centerService', centerService);

  /* @ngInject */
  function centerService(memberService, publicService, currentSessionHelper) {

    var SCROLL_BOTTOM_THRESHOLD = 700;    // threshold value to show 'scroll to bottom' icon on center panel.
    var hasBrowserFocus = true;           // indicator whether current browser has focus or not.


    this.preventChatWithMyself  = preventChatWithMyself;
    this.isIE9  = isIE9;
    this.isChat  = isChat;

    this.hasBottomReached = hasBottomReached;
    this.isBrowserHidden = isBrowserHidden;

    this.setBrowserFocue = setBrowserFocus;
    this.resetBrowserFocus = resetBrowserFocus;

    this.isMessageFromMe = isMessageFromMe;



    /**
     * Check entityId of entity to be directed to currently signed in member's id.
     * If user is trying to reach himself, re-direct user back to default topic.
     *
     * @param entityId
     */
    function preventChatWithMyself(entityId) {
      entityId = parseInt(entityId);
      if (entityId === memberService.getMemberId()) {
        publicService.goToDefaultTopic();
      }
    }

    /**
     * Check if current browser is internet explorer 0.
     *
     * @returns {boolean}
     */
    function isIE9() {
      if (angular.isDefined(FileAPI.support)) {
        if (!FileAPI.support.html5)
          return true;
      }
      return false;
    }

    /**
     * Is Current entity chat(DM)?
     *
     * @returns {boolean}
     */
    function isChat() {
      return currentSessionHelper.getCurrentEntityType() === 'users';
    }

    /**
     * Has scroll reached bottom?? or Do I have more room to go down???
     *
     * @returns {boolean}
     */
    function hasBottomReached() {
      var element = document.getElementById('msgs-container');
      var scrollHeight = element.scrollHeight;
      element = angular.element(element);

      return scrollHeight - (element.outerHeight() + element.scrollTop()) < SCROLL_BOTTOM_THRESHOLD;
    }

    /**
     * Set browser indicator to 'true'
     */
    function setBrowserFocus() { hasBrowserFocus = true; }
    /**
     *  Reset browser indicator back to 'false'
     */
    function resetBrowserFocus() { hasBrowserFocus = false; }
    /**
     * Check if current browser has focus or not.
     *
     * @returns {boolean|*}
     */
    function isBrowserHidden() {
      return !hasBrowserFocus || document.hidden;
    }

    /**
     * Check whether msg is from myself.
     * True msg is written by me.
     *
     * @param msg
     * @returns {boolean}
     * @private
     */
    function isMessageFromMe(message) {
      return message.fromEntity === memberService.getMemberId();
    }
  }
})();