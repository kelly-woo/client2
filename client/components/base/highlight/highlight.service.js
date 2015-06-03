/**
 * @fileoverview
 *  Service wrapper for text highlighting.
 *  'app/assets/javascripts/jquery.highlight.js' is original external library that is currently used in jandi application.
 *  This service is a basic wrapper of external library.
 *
 *  CURRENTLY NOT USED. BUT TO BE USED IN VERY NEAR FUTURE.
 *
 *
 * @author JiHoon Kim <jihoonk@tosslab.com>
 *
 */
(function() {
  'use strict';

  angular
    .module('base.highlight')
    .service('highlighter', highlighter);

  function highlighter() {
    this.hightlight = highlight;

    var DEFAULT_COLOR = '#FFFF00';
    var DEFAULT_CASE_SENSITIVE = false;
    var DEFAULT_WORDS_ONLY = false;


    /**
     * Highlight text.
     *
     * @param element {jQueryElement} element to be highlighted
     * @param text {string} string to look for in element
     * @param color {HEX color code} color code to be used when highlighting
     * @param caseSensitive {boolean} true if case sensitive when searching for a 'text'
     * @param wordsOnly {boolean} true if whole word must be matched when searching
     */
    function highlight(element, text, color, caseSensitive, wordsOnly) {
      color = color || DEFAULT_COLOR;
      caseSensitive = caseSensitive || DEFAULT_CASE_SENSITIVE;
      wordsOnly = wordsOnly || DEFAULT_WORDS_ONLY;

      element.hightlight(text, color, {wordsOnly: wordsOnly, caseSensitive: caseSensitive});
    }
  }

})();