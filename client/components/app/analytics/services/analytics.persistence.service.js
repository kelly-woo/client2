/**
 * @fileoverview User Info를 Storage에 저장. Browser, Session 구분
 *               
 * @author Kevin Lee <kevin@tosslab.com>
 */


(function() {
  'use strict';

  angular
    .module('app.analytics')
    .service('AnalyticsPersistence', AnalyticsPersistence);

  /* @ngInject */
  function AnalyticsPersistence($rootScope, $injector, AnalyticsTranslate, AnalyticsStorage, AnalyticsConstant) {

    this.init = init;
    this.getIdentify = getIdentify;

    var accountService;
    var memberService;

    var storageService;
    var sessionStorageService;
    var properties;
    var sessionProperties;
    var LOCAL_STORAGE_KEY = AnalyticsConstant.LOCAL_STORAGE_KEY;
    var SESSION_STORAGE_KEY = AnalyticsConstant.SESSION_STORAGE_KEY;
    
    /**
     * Persistence모듈 기본셋팅
     * @returns {Boolean} isSessionInitialed - 접속세션에서 서비스가 처음실행됬을 경우[세션에서 첫방문일경우 ] True를 반환 
     */
    function init() {
      var isLocalStorageSupported = AnalyticsStorage.checkLocalStorageSupported();
      var isSessionInitialed = false;
      
      if (isLocalStorageSupported) {

        storageService = AnalyticsStorage.getStorageService(window.localStorage);
        sessionStorageService = AnalyticsStorage.getStorageService(window.sessionStorage);

        properties = storageService.get(LOCAL_STORAGE_KEY);
        sessionProperties = sessionStorageService.get(SESSION_STORAGE_KEY);

        if (_.isNull(properties)) {
          storageService.set(LOCAL_STORAGE_KEY, {properties: {}});
          properties = {};
        }

        if (_.isNull(sessionProperties)) {
          isSessionInitialed = true;

          sessionStorageService.set(SESSION_STORAGE_KEY, {});
          sessionProperties = {};
        }

      } else {
        //TODO: Browser Storage가 지원되지 않을 경우 어떻게 처리해야 할 것 인가??
      }

      return isSessionInitialed;
    }


    /**
     * Tracker Log에 포함될 Identify 항목을 반환한다. 
     * @returns {Object} 
     *    token {String} - Local Storage에 저장될 token [브라우저 구분]
     *    session {String} - Session Storage에 저장된 token [세션 구분]
     *    accountId {String} - [account구분] 
     */
    function getIdentify() {
      accountService = accountService || $injector.get('accountService');
      memberService = memberService || $injector.get('memberService');

      var storedProperties = sessionStorageService.get(SESSION_STORAGE_KEY);
      var identify = {};
      var account = accountService.getAccount();
      var member = memberService.getMember();
      identify[AnalyticsConstant.IDENTIFY.TOKEN] = _getToken();
      identify[AnalyticsConstant.IDENTIFY.SESSION] = _getSessionId();

      if (account) {
        identify[AnalyticsConstant.IDENTIFY.ACCOUNT_ID] = account.id;
      }
      if (member) {
        identify[AnalyticsConstant.IDENTIFY.MEMBER_ID] = member.id;
      }
      return identify;
    }

    /**
     * Local Storage에 저장된 Token을 반환한다. 존재하지 않는 경우 새로 만든다.
     * @returns {String} - Local Storage에 저장된 Token
     */
    function _getToken() {
      var storedProperties = storageService.get(LOCAL_STORAGE_KEY);

      return storedProperties.token || _createToken(LOCAL_STORAGE_KEY);
    }

    /**
     * Session Storage에 저장된 SessionId을 반환한다. 존재하지 않는 경우 새로 만든다.
     * @returns {String} - Session Storage에 저장된 SessionId
     */
    function _getSessionId() {
      var storedProperties = sessionStorageService.get(SESSION_STORAGE_KEY);

      return storedProperties.id || _createSessionId(SESSION_STORAGE_KEY);
    }

    /**
     * 새 UUID를 생성한 후 Local Storage에 저장한다. 
     * @returns {String} - 새롭게 생성된 Token을 반환한다.
     */
    function _createToken() {
      var newToken = AnalyticsTranslate.UUID();
      var properties = storageService.get(LOCAL_STORAGE_KEY) || {};
      properties.token = newToken;
      storageService.set(LOCAL_STORAGE_KEY, properties);
      return newToken;
    }

    /**
     * 새 SessionId를 생성한 후 Local Storage에 저장한다. 
     * @returns {String} - 새롭게 생성된 SessionId를 반환한다.
     */
    function _createSessionId() {
      var newToken = AnalyticsTranslate.sessionId();
      var properties = storageService.get(SESSION_STORAGE_KEY) || {};
      properties.id= newToken;
      sessionStorageService.set(SESSION_STORAGE_KEY, properties);
      return newToken;
    }
  }
})();
