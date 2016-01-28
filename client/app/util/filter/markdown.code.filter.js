/**
 * @fileoverview 마크다운을 파싱한다
 * @see 마크댜운 공식 정규식
 * https://code.google.com/p/pagedown/source/browse/Markdown.Converter.js?r=e316af145b6c3c9721e89dc144d79025a754be0a
 * !!!important
 * 해당 소스의 수정시 반드시 markdown.code.filter.spec.js 의 karma 테스트 결과를 확인한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .filter('markdown', markdown);

  function markdown(Markdown) {
    var _regx = {
      isCode: /^`{3,}/,
      anchor: /<a.*?<\/a>/g,
      marker: /(<(a|img)\s(?!mention-view).*?)?(§§§anchorMarker(\d+)?§§§)(.*?<\/a>)?/g
      //links: /!?\[([^\]<>]+)\]\(<?([^ \)<>]+)( "[^\(\)\"]+")?>?\)/g  //TODO: IMG link 지원하게 될 경우 이 정규식을 사용해야 함.
    };

    _.extend(_regx, Markdown.getRegexMap());

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
      var anchorList = [];
      var parsedText;
      var index = 0;
      var stra;
      /*
        anchor 에 _ 가 들어갔을 경우 bold italic parser 가 정상동작 하지 않기 때문에, marker 로 표시한 뒤
        다시 replace 하는 로직을 추가한다.
       */
      string = string.replace(_regx.anchor, function(matchText) {
        index++;
        anchorList.push(matchText);
        return _getAnchorMarker(index -1);
      });
      index = 0;
      parsedText = _parseBoldItalic(string);
      parsedText = _parseStrikeThrough(parsedText);
      parsedText = _parseLinks(parsedText, anchorList);

      while ((stra = _regx.marker.exec(parsedText)) !== null) {
        _regx.marker.lastIndex = 0;
        //선 수행된 url 파서로 인해 <a> 혹은 <img> 태그 안에 중첩되어 <a> 태그가 정의 된 경우, url parser 로 적용된 태그는 제거한다.
        //아래와 같은 경우를 말한다.
        //<a href="<a href="http://naver.com">http://naver.com</a>">네이버</a>

        if (stra[1] && stra[5]) {
          parsedText = parsedText.replace(stra[0], stra[1] + _getTextFromAnchor(anchorList[stra[4]]) + (stra[5]||''));
        } else if(stra[1]) {
          parsedText = parsedText.replace(stra[0], stra[1] + anchorList[stra[4]] + (stra[5]||''));
        } else {
          parsedText = parsedText.replace(stra[0], anchorList[stra[4]] + (stra[5]||''));
        }
      }
      return parsedText;
    }

    function _getAnchorMarker(index) {
      return '§§§anchorMarker' + index + '§§§';
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
      var stra;
      while ((stra = (new RegExp(_regx.bolditalic)).exec(str)) !== null) {
        str = str.replace(stra[0], '<i><b>' + stra[2] + '</b></i>');
      }

      while ((stra = (new RegExp(_regx.bold)).exec(str)) !== null) {
        str = str.replace(stra[0], '<b>' + stra[2] + '</b>');
      }

      while ((stra = (new RegExp(_regx.italic)).exec(str)) !== null) {
        str = str.replace(stra[0], '<i>' + stra[2] + '</i>');
      }

      return str;
    }

    /**
     * strike through 를 파싱한다.
     * @param {string} str
     * @returns {string}
     * @private
     */
    function _parseStrikeThrough(str) {
      var stra;
      while ((stra = (new RegExp(_regx.strikethrough)).exec(str)) !== null) {
        str = str.replace(stra[0], '<del>' + stra[2] + '</del>');
      }
      return str;
    }

    /**
     * link 형태의 마크다운을 파싱한다.
     * @param {string} str
     * @param {array} anchorList
     * @returns {string}
     * @private
     */
    function _parseLinks(str, anchorList) {
      var stra;
      var anchorText;
      while ((stra = _regx.marker.exec(str)) !== null) {
        _regx.marker.lastIndex = 0;
        str = str.replace(stra[0], (stra[1]||'') + _getTextFromAnchor(anchorList[stra[4]]) + (stra[5]||''));
      }

      /* links */
      while ((stra = (new RegExp(_regx.links)).exec(str)) !== null) {
        if (stra[0].substr(0, 1) === '!') {
          str = str.replace(stra[0], '<img src="' + stra[4] + '" style="max-width:100%" alt="' + stra[2] + '" title="' + stra[1] + '" />\n');
        } else {
          str = str.replace(stra[0], '<a href="' + stra[4] + '" target="_blank" rel="nofollow">' + stra[2] + '</a>');
        }
      }
      _.forEach(anchorList, function(anchor, index) {
        anchorText = _getTextFromAnchor(anchor);
        str = str.replace(anchorText, _getAnchorMarker(index));
      });
      return str;
    }

    /**
     * Tag 로 부터 url 을 반환한다. (IMG 지원시 활성화 필요)
     * @param {string} tagStr - 태그 스트링 ('<a href="http://jandi.com">잔디</a>' | '<img src="http://www.jandi.com/img.jpg">'
     * @returns {string} 'http://jandi.com' | 'http://www.jandi.com/img.jpg'
     * @private
     */
    function _getLinkUrlFromTag(tagStr) {
      var stra = /(href|src)=(['"]{1})(.*?)\2/g.exec(tagStr);
      return stra ? stra[3] : tagStr;
    }

    /**
     * Anchor Tag 의 text 를 반홚나다
     * @param {string} tagStr - 태그 스트링 ('<a href="http://jandi.com">잔디</a>'
     * @returns {string} 잔디
     * @private
     */
    function _getTextFromAnchor(tagStr) {
      var stra = /<a[^>]*?>(.*)<\s?\/a>/g.exec(tagStr);
      return stra ? stra[1] : tagStr;
    }
  }
})();
