/**
 * @fileoverview 입력한 Message에 덧 붙이거나 수정하는 content를 제공함
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Message', Message);

  function Message($compile) {
    // warpping templates
    var wrapper_templates = {
      attach: '<div class="attachment-message-wrapper">'  +
        '<div class="attachment-message-bar"></div>'      +
        '<div class="attachment-message-content"></div>'  +
      '</div>'
    };
    // content templates
    var content_templates = {
      social_snippet:
        '<div class="social-image" ng-if="!!msg.linkPreview.imageUrl">'               +
          '<a ng-href="{{msg.linkPreview.linkUrl}}" target="_blank">'                 +
            '<img ng-src="{{msg.linkPreview.imageUrl}}"/>'                            +
          '</a>'                                                                      +
        '</div>'                                                                      +
        '<div class="social-body">'                                                   +
          '<div class="social-title neighbor" ng-if="!!msg.linkPreview.title">'       +
            '<a ng-href="{{msg.linkPreview.linkUrl}}" target="_blank">'               +
              '<span>{{msg.linkPreview.title}}</span>'                                +
            '</a>'                                                                    +
          '</div>'                                                                    +
          '<div class="social-desc neighbor" ng-if="!!msg.linkPreview.description">'  +
            '<a ng-href="{{msg.linkPreview.linkUrl}}" target="_blank">'               +
              '<span>{{msg.linkPreview.description}}</span>'                          +
            '</a>'                                                                    +
          '</div>'                                                                    +
          '<div class="social-domain" ng-if="!!msg.linkPreview.domain">'              +
            '<span>{{msg.linkPreview.domain}}</span>'                                 +
          '</div>'                                                                    +
        '</div>'
    };

    this.init = init;
    this.attach = attach;

    /**
     * @constructor
     * @param {object} jqEle - 덧 붙임할 target element
     * @param {object} options
     * @param {string} type - 사용할 template
     */
    function init(jqEle, options) {
      var that = this;

      that.jqEle = jqEle;

      that.options = {
        type: 'social_snippet'
      };
      angular.extend(that.options, options);

      return that;
    }

    /**
     * 특정 message에 content 덧 붙임
     * @param {object} $scope - template $compile시 사용되는 scope
     */
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
