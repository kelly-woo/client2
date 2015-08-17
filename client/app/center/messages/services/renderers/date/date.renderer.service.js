/**
 * @fileoverview FILE renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('DateRenderer', DateRenderer);

  /* @ngInject */
  function DateRenderer($templateRequest, $filter, MessageCollection) {
    var TEMPLATE_URL = 'app/center/messages/services/renderers/date/date.html';
    var _template = '';

    this.render = render;

    _init();

    /**
     *
     * @private
     */
    function _init() {
      $templateRequest(TEMPLATE_URL).then(function(template) {
        _template =  Handlebars.compile(template);
      });
    }

    function render(index) {
      var msg = MessageCollection.list[index];
      return _template({
        msg: msg,
        date: msg.date.substr(8)
      });
    }
  }
})();
