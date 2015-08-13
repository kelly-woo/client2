/**
 * @fileoverview Text renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TextRenderer', TextRenderer);

  /* @ngInject */
  function TextRenderer($templateRequest, $filter, MessageCollection) {
    var TEMPLATE_URL = 'app/center/messages/services/renderers/text/text.html';
    var TEMPLATE_URL_CHILD = 'app/center/messages/services/renderers/text/text.child.html';
    var _template = '';
    var _templateChild = '';

    this.render = render;

    _init();

    /**
     *
     * @private
     */
    function _init() {
      $templateRequest(TEMPLATE_URL_CHILD).then(function(template) {
        _templateChild = template;
      });
      $templateRequest(TEMPLATE_URL).then(function(template) {
        _template = template;
      });
    }

    function render(index) {
      var message = MessageCollection.list[index];
      var isChild = MessageCollection.isChildText(index);
      var template = isChild ? _templateChild : _template;
      return $filter('template')(template, message);
    }
  }
})();
