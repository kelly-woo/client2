/**
 * @fileoverview 네트워크 Interceptor
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.keyCode')
    .service('jndKeyCode', jndKeyCode);

  function jndKeyCode() {
    var keyCodeMap = {
      'ESC': 27,
      'TAB': 9,
      'ENTER': 13,
      'CTRL': 17,
      'LEFT_ARROW': 37,
      'UP_ARROW': 38,
      'RIGHT_ARROW': 39,
      'DOWN_ARROW': 40,
      'NUM_1': 49,
      'NUM_2': 50,
      'NUM_3': 51,
      'NUM_4': 52,
      'CHAR_A': 65,
      'CHAR_C': 67,
      'CHAR_E': 69,
      'CHAR_F': 70,
      'CHAR_G': 71,
      'CHAR_J': 74,
      'CHAR_K': 75,
      'CHAR_L': 76,
      'CHAR_M': 77,
      'CHAR_S': 83,
      'CHAR_T': 84,
      'CHAR_Q': 81,
      'CHAR_R': 82,
      'CHAR_V': 86,
      'CHAR_U': 85,
      'CHAR_COMMA': 188,
      '[': 219,
      'PLUS': 187,
      'MINUS': 189,
      'SLASH': 191,
      'LEFT_WINDOW_KEY': 91,
      'F5': 116,
      'BACKSPACE': 8,
      'SPACE': 32,
      'PAGE_UP': 33,
      'PAGE_DOWN': 34,
      'HOME': 36,
      'END': 35,
      'DEL': 46,
      'UNDEFINED': 229
    };
    this.keyCodeMap = keyCodeMap;
    this.match = match;
    this.getName = getName;

    function match(keyName, keyCode) {
      return keyCodeMap[keyName] === keyCode;
    }

    function getName(keyCode) {
      var keyName = null;
      _.each(keyCodeMap, function(code, name) {
        if (keyCode === code) {
          keyName = name;
          return false;
        }
      });
      return keyName;
    }
  }

})();