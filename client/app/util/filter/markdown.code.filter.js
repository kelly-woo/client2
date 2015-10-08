/**
 * @fileoverview 마크다운을 파싱한다
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .filter('markdown', markdown);

  function markdown($filter) {
    var _regx = {
      isCode: /^`{3,}/,
      bolditalic: /(?:([\*_~]{1,3}))([^\*_~\n]*[^\*_~\s])\1/g
    };

    return function(text) {
      return convert(text);
    };

    /**
     * 마크다운 형식을 변환한다
     * @param {string} text
     * @returns {string}
     */
    function convert(text) {
      text = text || '';
      var textArr = text.split('\n');
      var length = textArr.length;
      var token;
      var resultArr = [];
      var i = 0;

      for (; i < length; i++) {
        token = textArr[i];
        if (_regx.isCode.test(token)) {
          i++;
          resultArr.push('<jnd-code-prettify>');
          while (i < length && !_regx.isCode.test(textArr[i])) {
            resultArr.push(textArr[i]);
            i++;
          }
          resultArr.push('</jnd-code-prettify>');
        } else {
          resultArr.push(_parseBoldItalic(token));
        }
      }

      return resultArr.join('\n');
    }

    /**
     * bold, italic 파서
     * micromarkdown 에서 필요한 로직만 추출하여 활용 함.
     * (향후 markdown 확장 필요시 라이브러리 사용을 권장함)
     *
     * @param {string} str
     * @returns {string}
     * @private
     * @see https://github.com/SimonWaldherr/micromarkdown.js
     */
    function _parseBoldItalic(str) {
      var repstr;
      var stra;

      /* bold and italic */
      for (var i = 0; i < 3; i++) {
        while ((stra = _regx.bolditalic.exec(str)) !== null) {
          repstr = [];
          if (stra[1] === '~~') {
            str = str.replace(stra[0], '<del>' + stra[2] + '</del>');
          } else {
            switch (stra[1].length) {
              case 1:
                repstr = ['<i>', '</i>'];
                break;
              case 2:
                repstr = ['<b>', '</b>'];
                break;
              case 3:
                repstr = ['<i><b>', '</b></i>'];
                break;
            }
            str = str.replace(stra[0], repstr[0] + stra[2] + repstr[1]);
          }
        }
      }

      return str;
    }
  }
})();
