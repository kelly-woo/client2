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
      bolditalic: /([\*~]{1,3})([^\1].*)\1/g,
      anchor: /<a.*?<\/a>/g
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
            resultArr.push(_parseText(token));
          } else {
            resultArr.push(token);
          }
        }
      }

      return resultArr.join('\n');
    }

    /**
     * text markdown 을 파싱한다
     * @param {string} string
     * @returns {string|*}
     * @private
     */
    function _parseText(string) {
      var marker = '§§§anchorMarker§§§';
      var regxMarker = /§§§anchorMarker§§§/g;
      var anchorList = [];
      var parsedText;
      var index = 0;

      /*
        anchor 에 _ 가 들어갔을 경우 bold italic parser 가 정상동작 하지 않기 때문에, marker 로 표시한 뒤
        다시 replace 하는 로직을 추가한다.
       */
      string = string.replace(_regx.anchor, function(matchText) {
        anchorList.push(matchText);
        return marker;
      });
      parsedText = _parseBoldItalic(string);
      parsedText = parsedText.replace(regxMarker, function(matchText) {
        return anchorList[index++];
      });
      return parsedText;
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
     * @history
     *   - 2015.10.15
     *    현재 파싱 로직 거의 대부분을 변경 하였음.
     */
    function _parseBoldItalic(str) {
      var repstr;
      var stra;
      var count;
      /* bold and italic */
      for (var i = 0; i < 3; i++) {
        count = 0;
        while ((stra = (new RegExp(_regx.bolditalic)).exec(str)) !== null) {
          if (count === 0 && stra[0] === '>') {
            break;
          } else {
            repstr = [];
            if (stra[1] === '~~') {
              str = str.replace(stra[0], '<del>' + stra[2] + '</del>');
            } else {
              if (stra[1].indexOf('~') === -1) {
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
            count++;
          }
        }
      }
      return str;
    }
  }
})();
