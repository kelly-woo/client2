(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MessageText', MessageText);

  /* @ngInject */
  function MessageText(centerService) {
    this.isChild = isChild;


    /**
     * 메세지가 child text 인지 여부를 반환한다.
     * @param {number} index 확인할 대상 메세지 인덱스
     * @returns {boolean} child text 인지 여부
     * @private
     */
    function isChild(index, list) {
      var messages = list;
      if (messages[index]) {
        var msg = messages[index].message;
        var prevMsg = messages[index - 1] && messages[index - 1].message;

        if (prevMsg) {
          if (_isSameWriter(msg, prevMsg) && !centerService.isElapsed(messages[index - 1].time, messages[index].time)) {
            return true;
          }
        }
      }
      return false;
    }

    /**
     * 같은 사람이 보낸 메세지인지 여부를 반환한다
     * @param {object} msg 메세지
     * @param {object} prevMsg 이전 메세지
     * @returns {boolean}
     * @private
     */
    function _isSameWriter(msg, prevMsg) {
      if (centerService.isTextType(msg.contentType) && centerService.isTextType(prevMsg.contentType) &&
        msg.writerId  === prevMsg.writerId) {
        return true;
      } else {
        return false;
      }
    }


  }
})();