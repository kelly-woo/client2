/**
 * @fileoverview Date divider
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
     * 생성자
     * @private
     */
    function _init() {
      $templateRequest(TEMPLATE_URL).then(function(template) {
        _template =  Handlebars.compile(template);
      });
    }

    /**
     * index 에 해당하는 메세지를 랜더링한다.
     * @param {number} index
     * @returns {*}
     */
    function render(index) {
      var msg = MessageCollection.list[index];
      return _template({
        msg: msg,
        date: msg.date.substr(8)
      });
    }
  }
})();
