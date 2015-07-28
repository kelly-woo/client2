/**
 * @fileoverview 사용자가 입력한 text를 수정하여 center chat에 출력함.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .filter('mention', mention);

  function mention() {
    return function(text, mentions) {
      return convert(text, mentions);
    };


    /**
     *
     * @param {String} text
     * @param {Array} mentions
     * @returns {*}
     */
    function convert(text, mentions) {
      var htmlStr = text;
      var htmlList = [];
      var ptr = 0;
      if (mentions && mentions.length) {
        mentions = _.sortBy(mentions, 'offset');
        _.forEach(mentions, function(mention) {
          htmlList.push(text.substring(ptr, mention.offset));
          ptr = mention.offset;
          htmlList.push(_toMention(text.substr(ptr, mention.length), mention));
          ptr += mention.length;
        });
        htmlList.push(text.substring(ptr));
        htmlStr = htmlList.join('');
      }
      return htmlStr;
    }

    /**
     *
     * @param {String} text
     * @param {Object} mention
     * @returns {string}
     * @private
     */
    function _toMention(text, mention) {
      return '<a mention-view="' + mention.id + '" mention-type="' + mention.type + '">' + text + '</a>';
    }
  }
})();
