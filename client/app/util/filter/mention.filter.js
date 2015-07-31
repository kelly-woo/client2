/**
 * @fileoverview 사용자가 입력한 text를 수정하여 center chat에 출력함.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .filter('mention', mention);

  function mention() {
    return function(text, mentions, hasEventHandler) {
      return convert(text, mentions, hasEventHandler);
    };


    /**
     * text 에서 mention 마크업으로 변환이 필요한 부분은 변환하여 변환된 문자열을 반환한다.
     * @param {String} text - 원본 text
     * @param {Array} mentions - 멘션 정보 배열
     * @param {boolean} [hasEventHandler=true] - 이벤트 핸들러를 바인딩 할지 여부
     * @returns {String}
     */
    function convert(text, mentions, hasEventHandler) {
      hasEventHandler = _.isBoolean(hasEventHandler) ? hasEventHandler : true;

      var htmlStr = text;
      var htmlList = [];
      var ptr = 0;
      if (mentions && mentions.length) {
        mentions = _.sortBy(mentions, 'offset');
        _.forEach(mentions, function(mention) {
          htmlList.push(text.substring(ptr, mention.offset));
          ptr = mention.offset;
          htmlList.push(_toMention(text.substr(ptr, mention.length), mention, hasEventHandler));
          ptr += mention.length;
        });
        htmlList.push(text.substring(ptr));
        htmlStr = htmlList.join('');
      }
      return htmlStr;
    }

    /**
     * mention 마크업 문자열을 반환한다.
     * @param {String} text - 원본 text
     * @param {Object} mention - 멘션 정보
     * @param {boolean} [hasEventHandler=true] - 이벤트 핸들러를 바인딩 할지 여부
     * @returns {string}
     * @private
     */
    function _toMention(text, mention, hasEventHandler) {
      hasEventHandler = _.isBoolean(hasEventHandler) ? hasEventHandler : true;
      var activeStatus = hasEventHandler ? 'on' : 'off';
      var mentionStr = '<a mention-view="' + mention.id + '" mention-type="' + mention.type + '"';
      mentionStr += ' mention-active="' + activeStatus + '">';
      mentionStr += text + '</a>';

      return mentionStr;
    }
  }
})();
