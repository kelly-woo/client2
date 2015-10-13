/**
 * @fileoverview 마크다운을 파싱한다
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .filter('markdown', markdown);

  function markdown() {
    var _regx = {
      isCode: /^`{3,}/,
      bolditalic: /(?:([\*_~]{1,3}))([^\*_~\n]*[^\*_~\s])\1/g
    };

    return function(text, allowList) {
      return convert(text, allowList);
    };

    /**
     * 마크다운 형식을 변환한다
     * @param {string} text
     * @param {Array} [allowList] - 허용할 마크다운 파싱 범위. 생략할 경우 모두 파싱. (bolditalic, code)
     * @returns {string}
     */
    function convert(text, allowList) {
      text = text || '';
      var allowMap = {
        bolditalic: true,
        code: true
      };
      var textArr = text.split('\n');
      var length = textArr.length;
      var token;
      var resultArr = [];
      var i = 0;

      if (_.isArray(allowList)) {
        _.each(allowMap, function(isAllowed, parserName) {
          allowMap[parserName] = (allowList.indexOf(parserName) !== -1);
        });
      }

      for (; i < length; i++) {
        token = textArr[i];
        if (_regx.isCode.test(token)) {
          i++;

          resultArr.push(allowMap.code ? '<jnd-code-prettify>' : token);
          while (i < length && !_regx.isCode.test(textArr[i])) {
            resultArr.push(textArr[i]);
            i++;
          }
          if (allowMap.code) {
            resultArr.push('</jnd-code-prettify>');
          } else if (i < length) {
            resultArr.push(textArr[i]);
          }
        } else {
          if (allowMap.bolditalic) {
            resultArr.push(_parseBoldItalic(token));
          } else {
            resultArr.push(token);
          }
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
