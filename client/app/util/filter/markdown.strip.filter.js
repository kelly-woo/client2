/**
 * @fileoverview markdown strip filter
 * !!!important
 * 해당 소스의 수정시 반드시 markdown.strip.filter.spec.js 의 karma 테스트 결과를 확인한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .filter('stripMarkdown', stripMarkdown);

  function stripMarkdown(Markdown) {
    var regexMap = Markdown.getRegexMap();

    return function(text) {
      //TODO 각 markdown 정규식을 하나의 정규식으로 만든뒤 하나의 loop로 처리하도록 해야함. 그렇게 되면 markdown.code도 수정해야됨

      text = _stripBoldItalic(text);
      text =_stripStrikeThrough(text);
      text = _stripLink(text);

      return text;
    };

    /**
     * strip bold & italic
     * @param {string} text
     * @returns {*}
     * @private
     */
    function _stripBoldItalic(text) {
      var match;

      while(match = new RegExp(regexMap.bolditalic.source, 'g').exec(text)) {
        text = text.replace(match[0], match[2]);
      }

      while(match = new RegExp(regexMap.bold.source, 'g').exec(text)) {
        text = text.replace(match[0], match[2]);
      }

      while(match = new RegExp(regexMap.italic.source, 'g').exec(text)) {
        text = text.replace(match[0], match[2]);
      }

      return text;
    }

    /**
     * strip strikethrough
     * @param {string} text
     * @returns {*}
     * @private
     */
    function _stripStrikeThrough(text) {
      var match;

      while (match = new RegExp(regexMap.strikethrough.source, 'g').exec(text)) {
        text = text.replace(match[0], match[2]);
      }

      return text;
    }

    /**
     * strip link
     * @param {string} text
     * @returns {*}
     * @private
     */
    function _stripLink(text) {
      var match;

      while(match = new RegExp(regexMap.links.source, 'g').exec(text)) {
        text = text.replace(match[0], match[2]);
      }

      return text;
    }
  }
})();
