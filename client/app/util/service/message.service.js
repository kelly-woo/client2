/**
 * @fileoverview Message
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('Message', Message);

  function Message($compile) {
    var wrapper_templates = {
      attach: '<div class="attachment-message-wrapper">' +
        '<div class="attachment-message-bar"></div>' +
        '<div class="attachment-message-content"></div>' +
      '</div>'
    };
    var content_templates = {
      social_snippet: '<div class="social-image" style="border: 1px solid #d7e0e8; width: 110px; height: 110px;">' +
          '<img style="width: 110px; height: 110px;"/>' +
        '</div>' +
        '<div class="social-body" style="">' +
          '<div class="social-title neighbor">qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw </div>' +
          '<div class="social-desc neighbor">qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw qwerqwerqw </div>' +
          '<div class="social-url">www.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.comwww.naver.com</div>' +
        '</div>'
    };

    var Message = {
      init: init,
      attach: attach
    };

    return {
      createInstance: function(jqEle, options) {
        return Object.create(Message).init(jqEle, options);
      }
    };

    function init(jqEle, options) {
      var that = this;

      that.jqEle = jqEle;

      that.options = {
        type: 'social_snippet'
      };
      angular.extend(that.options, options);

      return that;
    }

    function attach($scope) {
      var that = this;
      var options = that.options;
      var contentTemplate;
      var ele;

      if (contentTemplate = content_templates[options.type]) {
        ele = $compile(wrapper_templates.attach)($scope).children('.attachment-message-content').append($compile(contentTemplate)($scope)).parent();

        that.jqEle.append(ele);
      }
    }
  }
}());
