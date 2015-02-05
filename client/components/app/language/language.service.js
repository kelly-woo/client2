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

    /*
     'language'      : is for translator to bring right language for current user. Translator needs this value.
     'serverLang'    : is for server to detect right language for current user.  Server needs this value.
     'notification'  : soon to be implement
     */
    var preferences = this.preferences = {
      language        : gettextCatalog.currentLanguage,
      serverLang      : '',
      notification    : ''
    };

    // constant
    var listLangs = this.listLangs = [
      { "value": "ko",    "text": "한국어" },
      { "value": "en",    "text": "English" },
      { "value": "zh-cn", "text": "简体中文 " },
      { "value": "zh-tw", "text": "繁體中文" },
      { "value": "ja",    "text": "日本語"}
    ];

    function init() {
      var debugMode = (configuration.name === 'development');
      setLang(storageAPIservice.getLastLang() || navigator.language || navigator.userLanguage, debugMode);
    }

    /**
     * translate for multi-lang
     */
    function setLang(setLang, isDebug) {
      isDebug = isDebug || false;

      getLanguageSetting(setLang);

      // 언어 설정 for nggettext(translator)
      setCurrentLanguage(preferences.language);
      setDebugMode(isDebug);
    }

    /**
     * Browser/OS may give us slightly different format for same language.
     * In such case, we reformat the language variable so that we can notify 'server' and 'translator' with correct language format.
     */
    function getLanguageSetting(curLang) {
      var userLang;
      var serverLang;

      if (angular.isUndefined(curLang))
        curLang = accountService.getAccountLanguage();

      curLang = curLang.toLowerCase();

      // Choose correct/right format!!
      if (curLang.indexOf('ko') >= 0) {
        // korean
        userLang    = 'ko';
        serverLang  = 'ko';
      }
      else if (curLang.indexOf('en') >= 0) {
        // english
        userLang    = 'en_US';
        serverLang  = 'en';
      }
      else if (curLang.indexOf('zh') >= 0) {
        // chinese
        if (curLang.indexOf('tw') >= 0) {
          // main land china
          userLang    = 'zh_TW';
          serverLang  = 'zh-tw';
        }
        else {
          userLang    = 'zh_CN';
          serverLang  = 'zh-cn';
        }
      }
      else if (curLang.indexOf('ja') >= 0) {
        // japanese
        userLang    = 'ja';
        serverLang  = 'ja';
      }
      else {
        // default
        userLang    = 'en_US';
        serverLang  = 'en';
      }

      // Save it!!
      preferences.language     = userLang;
      preferences.serverLang   = serverLang;
    }

    // Setting language for translator, nggettext
    function setCurrentLanguage() {
      gettextCatalog.setCurrentLanguage(preferences.language);
      storageAPIservice.setLastLang(preferences.language);
    }
    // Setting debug mode for translator, nggettext
    function setDebugMode(isDebug) {
      gettextCatalog.debug = isDebug;
    }
  }

})();