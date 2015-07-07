/**
 * @fileoverview JANDI run 파일
 */
'use strict';
(function() {
  var JND = window.JND = window.JND || {};
  console.log(JND);
  /**
   * 수행
   */
  function run() {
    var lang = getLanguage();
    $('body').html(template($('#disconnect').html(), JND.L10N[lang]));
  }

  /**
   * language 설정을 반환한다.
   * @returns {*}
   */
  function getLanguage() {
    var url = location.href;
    var token = url.split('#');
    return token[1] && JND.L10N[token[1]] ? token[1] : 'ko';
  }

  /**
   * 템플릿 utility 메서드
   * @param {String} templateStr
   * @param {Object} mapper
   * @returns {Array}
   */
  function template(templateStr, mapper) {
    var totalReplaced = [];
    var replaced;
    var mapData;
    var i;

    if(!$.isArray(mapper)){
      mapper = [mapper];
    }
    for (i = 0; i < mapper.length; i++) {
      mapData = mapper[i];
      replaced = templateStr.replace(/@([^\s<]+)/g, function(matchedString, name) {
        return mapData[name] ? mapData[name].toString() : '';
      });
      totalReplaced.push(replaced);
    }
    return totalReplaced;
  }

  JND.run = run;
})();
