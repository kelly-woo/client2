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

    this.render = render;

    _init();

    function _init() {
      $templateRequest(TEMPLATE_URL).then(function(template) {
        _template =  Handlebars.compile(template);
      });
    }

    function render(index, type) {
      var hasId = _.isUndefined(type);
      var msg = MessageCollection.list[index];
      var contentType = type || msg.message.contentType;
      var renderer = CenterRendererFactory.get(contentType);
      var content = renderer ? renderer.render(index) : '';

      var context = {
        content: content,
        contentType: contentType
      };

      if (hasId) {
        context.id = msg.id;
      }

      return _template(context);
    }
  }
})();
