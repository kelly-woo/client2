(function() {
  'use strict';

  angular
    .module('app.config')
    .service('highlighter', highlighter);

  /* @ngInject */
  function highlighter() {
    this.hightlight = highlight;

    var DEFAULT_COLOR = '#FFFF00';
    var DEAFAULT_CASESENSITIVE = false;
    var DEFAULT_WORDSONLY = false;

    function highlight(element, text, color, caseSensitive, wordsOnly) {
      color = color || DEFAULT_COLOR;
      caseSensitive = caseSensitive || DEAFAULT_CASESENSITIVE;
      wordsOnly = wordsOnly || DEFAULT_WORDSONLY;

      element.hightlight(text, color, {wordsOnly: wordsOnly, caseSensitive: caseSensitive});
    }
  }

})();