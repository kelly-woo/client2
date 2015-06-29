/**
 * @fileoverview Random Id 생성, Base64 변환
 *               
 * @author Kevin Lee <kevin@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.analytics')
    .service('AnalyticsTranslate', AnalyticsTranslate);

  /* @ngInject */
  function AnalyticsTranslate($rootScope) {

    this.UUID = UUID;
    this.sessionId = sessionId;
    this.base64Encode = base64Encode;
    this.base64Decode = base64Decode;


    /**
     * Browser식별 Key로 사용될, UUID 반환.
     * Local Storage 에 저장된다. 
     * @returns {String} - UUID
     */
    function UUID() {
      // 1*new Date() is a cross browser version of Date.now()
      var T = function() {
        var d = 1*new Date();
        var i = 0;
        while (d == 1*new Date()) { i++; }
        return d.toString(16) + i.toString(16);
      };

      // Math.Random entropy
      var R = function() {
        return Math.random().toString(16).replace('.','');
      };

      // User agent entropy
      var UA = function(n) {
        var ua = navigator.userAgent, i, ch, buffer = [], ret = 0;
        function xor(result, byte_array) {
          var j, tmp = 0;
          for (j = 0; j < byte_array.length; j++) {
              tmp |= (buffer[j] << j*8);
          }
          return result ^ tmp;
        }

        for (i = 0; i < ua.length; i++) {
          ch = ua.charCodeAt(i);
          buffer.unshift(ch & 0xFF);
          if (buffer.length >= 4) {
              ret = xor(ret, buffer);
              buffer = [];
          }
        }

        if (buffer.length > 0) { ret = xor(ret, buffer); }

        return ret.toString(16);
      };

      var se = function() {
        return (screen.height*screen.width).toString(16);
      }

      return (T()+"-"+R()+"-"+UA()+"-"+se()+"-"+T());
    }


    /**
     * Session식별 Key로 사용될, 랜덤 Entropy 반환.
     * Session Storage 에 저장된다. 
     * @returns {String} - Random Entropy 
     */
    function sessionId() {
      // Math.Random entropy
      return Math.random().toString(16).replace('.','');
    }


    /**
     * 전달받은 String 을 Base64Encode해서 반환한다.
     * @param {String} data
     * @returns {String} - base64Encoded String
     */
    function base64Encode(data) {
      var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

      if (!data) {
        return data;
      }

      do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1<<16 | o2<<8 | o3;

        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
      } while (i < data.length);

      enc = tmp_arr.join('');

      switch( data.length % 3 ){
        case 1:
        enc = enc.slice(0, -2) + '==';
        break;
        case 2:
        enc = enc.slice(0, -1) + '=';
        break;
      }

      return enc;
    };
    
    /**
     * 전달받은 Base64Encoded String 을 Base64Decode해서 반환한다.
     * @param {String} input - base64Encoded String
     * @returns {String} - base64Decoded String
     */
    function base64Decode(input) {
      var output = "";
      var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;

      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      while (i < input.length) {

        enc1 = b64.indexOf(input.charAt(i++));
        enc2 = b64.indexOf(input.charAt(i++));
        enc3 = b64.indexOf(input.charAt(i++));
        enc4 = b64.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }

      }
      return output;

    }
  }
})();
