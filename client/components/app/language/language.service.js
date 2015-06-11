/**
 * @fileoverview 언어 관련된 모든 부분을 담당하는 서비스.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.language')
    .service('language', language);

  /* @ngInject */
  function language(accountService, configuration, gettextCatalog, storageAPIservice) {
    this.init = init;
    this.setLang = setLang;
    this.getLanguageSetting = getLanguageSetting;
    this.setCurrentLanguage = setCurrentLanguage;
    this.setDebugMode = setDebugMode;
    this.getLanguageList = getLanguageList;

    /**
     * @namespace
     * @property {string} language - translator to bring right language for current user. Translator needs this value.
     * @property {string} serverLang - server to detect right language for current user. Server needs this value.
     * @property {string} notification - soon to be implement
     */
    var preferences = this.preferences = {
      language        : gettextCatalog.currentLanguage,
      serverLang      : '',
      notification    : ''
    };

    // constants
    // TODO: THERE MUST BE A SERVICE FOR CONSTANT!!
    var listLangs = this.listLangs = [
      { "value": "ko",    "text": "한국어" },
      { "value": "en",    "text": "English" },
      { "value": "ja",    "text": "日本語"},
      { "value": "zh-cn", "text": "简体中文 " },
      { "value": "zh-tw", "text": "繁體中文" }
    ];

    /**
     * 언어를 초기 세팅한다.
     * 언어의 우선순위는
     *   1. 브라우져 쿠키에 저장되있던 언어
     *   2. navigator.language 값
     *   3. navigator.userLanguage 값
     * 하지만 이 정보들은 유저가 로그인하면 유저 어카운트 안에 있는 언어 정보로 대체된다.
     */
    function init() {
      var debugMode = (configuration.name === 'development');
      setLang(storageAPIservice.getLastLang() || navigator.language || navigator.userLanguage, debugMode);
    }

    /**
     * 언어를 설정한다.
     * @param setLang {string} language to set
     * @param isDebug {boolean} true if it is debug mode
     */
    function setLang(setLang, isDebug) {
      isDebug = isDebug || false;

      getLanguageSetting(setLang);

      // 언어 설정 for nggettext(translator)
      setCurrentLanguage(preferences.language);
      setDebugMode(isDebug);
    }

    /**
     * 브라우져 혹은 시스템 환경에 따라 같은 언어라도 다른 형식으로 표현 될 수 있다. 예를 들면 zh-tw 또는 zh_tw.
     * 이런 경우, 언어를 보고 'api를 통해 서버에 보내줘야하는 형식'과 'nggettext' 에서 알아들을 수 있는 형식을 각각 만들어 준다.
     *
     * Browser/OS may give us slightly different format for same language.
     * In such case, we reformat the language variable so that we can notify 'server' and 'translator' with correct language format.
     * @param curLang {string} browser 혹은 OS 에서 언어 정보라며 던져준 스트링
     */
    function getLanguageSetting(curLang) {
      var userLang;
      var serverLang;

      if (angular.isUndefined(curLang))
        curLang = accountService.getAccountLanguage();

      curLang = curLang.toLowerCase();

      // Choose correct format for both server and translator.
      if (curLang.indexOf('ko') >= 0) {
        // korean
        userLang    = 'ko';
        serverLang  = 'ko';
      } else if (curLang.indexOf('en') >= 0) {
        // english
        userLang    = 'en_US';
        serverLang  = 'en';
      } else if (curLang.indexOf('zh') >= 0) {
        // chinese
        if (curLang.indexOf('tw') >= 0) {
          // main land china
          userLang    = 'zh_TW';
          serverLang  = 'zh-tw';
        } else {
          userLang    = 'zh_CN';
          serverLang  = 'zh-cn';
        }
      } else if (curLang.indexOf('ja') >= 0) {
        // japanese
        userLang    = 'ja';
        serverLang  = 'ja';
      } else {
        // default
        userLang    = 'en_US';
        serverLang  = 'en';
      }

      // Save it
      preferences.language = userLang;
      preferences.serverLang = serverLang;
    }

    /**
     * Setting language for translator, nggettext
     */
    function setCurrentLanguage() {
      gettextCatalog.setCurrentLanguage(preferences.language);
      storageAPIservice.setLastLang(preferences.language);
    }

    /**
     * Setting debug mode for translator, nggettext
     * @param isDebug {boolean} true if it is debug mode
     */
    function setDebugMode(isDebug) {
      gettextCatalog.debug = isDebug;
    }

    /**
     * getter function for language list that is currently supported.
     * @returns {Array|$rootScope.listLangs|*|listLangs}
     */
    function getLanguageList() {
      return this.listLangs;
    }
  }

})();