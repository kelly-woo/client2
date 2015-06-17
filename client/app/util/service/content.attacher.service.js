/**
 * @fileoverview 입력한 Message에 덧 붙이는 content를 제공함
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ContentAttacher', ContentAttacher);

  function ContentAttacher($rootScope, $compile, $http) {
    var content_templates = {};

    $http
      .get('app/center/view_components/center_chat_templates/content_attacher/social.snippet.html')
      .then(function(response) {
        content_templates.social_snippet = response.data;
      });

    this.init = init;
    this.attach = attach;

    /**
     * @constructor
     * @param {object|string} jqEle - 덧 붙임할 target element
     * @param {object} options
     * @param {string} type - 사용할 template
     */
    function init(jqEle, options) {
      var that = this;

      that.jqEle = angular.isString(jqEle) ? $(jqEle) : jqEle;

      that.options = {
        type: 'social_snippet'
      };
      angular.extend(that.options, options);

      return that;
    }

    /**
     * 특정 message에 content 덧 붙임
     * @param {object|function} $scope - template $compile시 사용되는 scope
     */
    function attach($scope) {
      var that = this;
      var options = that.options;
      var fn;
      var contentTemplate;
      var ele;

      if (angular.isFunction($scope)) {
        fn = $scope;
        $scope = $rootScope.$new(false);
        fn($scope);
      }

      if (contentTemplate = content_templates[options.type]) {
        ele = $compile(contentTemplate)($scope);

        that.jqEle.append(ele);
      }
    }
  }
}());
