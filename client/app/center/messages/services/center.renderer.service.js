/**
 * @fileoverview Center renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('CenterRenderer', CenterRenderer);

  /* @ngInject */
  function CenterRenderer($templateRequest, $filter, MessageCollection, CenterRendererFactory) {
    var TEMPLATE_URL = 'app/center/messages/services/center.html';
    var _template = '';

    this.renderMessage = renderMessage;

    _init();

    function _init() {
      $templateRequest(TEMPLATE_URL).then(function(template) {
        _template = template;
      });
    }

    function render(type) {

    }

    function renderMessage(index) {
      var mapper = {
        content: CenterRendererFactory.render(index)
      };
      return $filter('template')(_template, mapper);
    }
  }
})();
