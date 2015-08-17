/**
 * @fileoverview FILE renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('SystemEventRenderer', SystemEventRenderer);

  /* @ngInject */
  function SystemEventRenderer($templateRequest, $filter, MessageCollection) {
    var TEMPLATE_URL = 'app/center/messages/services/renderers/system-event/system.event.html';
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
      var filter = $filter('getName');
      var length = msg.message.invites.length;
      var invitees = [];
      _.forEach(msg.message.invites, function(invitee, index) {
        invitees.push({
          name: filter(invitee),
          isLast: length - 1 === index
        });
      });
      return _template({
        msg: message,
        invitees: invitees
      });
    }
  }
})();
