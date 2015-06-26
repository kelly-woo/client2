/**
 * @fileoverview Local, Session storage 관련 Service
 *               
 * @author Kevin Lee <kevin@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.analytics')
    .service('AnalyticsStorage', AnalyticsStorage);

  /* @ngInject */
  function AnalyticsStorage(AnalyticsTranslate) {
    
   
    this.checkLocalStorageSupported = checkLocalStorageSupported;
    this.getStorageService = getStorageService;


    /**
     * 전달 받은 Storage에 관한 Wrapper서비스를 반환한다. 
     * param {Object} storage - Local Storage Or Session Storage
     */
    function getStorageService(storage) {
      return {
        /**
         * Key값을 받아 저장된 String를 Base64Decode후 Json으로 변환해 반환한다. 
         * params {string} name - Key
         * returns {Object} 반환값
         */
        get: function(name) {
          try {
            var item = storage.getItem(name);
            if (!item) { return null};

            var base64Decoded = AnalyticsTranslate.base64Decode(item);
            var jsonDecoded = JSON.parse(base64Decoded);  
            return jsonDecoded;
          } catch (err) {
            console.error('Storage error: ' + err);
          }
          return null;
        },
        /**
         * Json을 받아 String으로 변환후 base64Encode한 뒤 key값으로 Storage에 저장한다.
         * params {string} name - Key
         * params {Object} value - 저장할 JSON
         */
        set: function(name, value) {
          try {
            var jsonEncoded = JSON.stringify(value);
            var base64Encoded = AnalyticsTranslate.base64Encode(jsonEncoded);
            storage.setItem(name, JSON.stringify(base64Encoded));
          } catch (err) {
            console.error('Storage error: ' + err);
          }
        },
        /**
         * Key값으로 Storage에 저장된 내용을 지운다.
         * params {string} name - Key
         */
        remove: function(name) {
          try {
            storage.removeItem(name);
          } catch (err) {
            console.error('Storage error: ' + err);
          }
        }
      };
    }

    /**
     * Local Storage 가 지원가능한지 검사한다.
     * returns {Boolean} 
     */
    function checkLocalStorageSupported() {
      var supported = true;
      try {
        var SAMPLE_KEY = '__jandisupport__';
        var SAMPLE_VALUE = 'kevin';

        window.localStorage.setItem(SAMPLE_KEY, SAMPLE_VALUE);

        if (window.localStorage.getItem(SAMPLE_KEY) !== SAMPLE_VALUE) {
          supported = false;
        }
        window.localStorage.removeItem(SAMPLE_KEY);
      } catch (err) {
        supported = false;
      }
      return supported;
    }
  }
})();
