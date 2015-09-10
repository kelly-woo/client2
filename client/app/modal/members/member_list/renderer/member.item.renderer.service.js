/**
 * @fileoverview member item renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MemberItemRenderer', MemberItemRenderer);

  /* @ngInject */
  function MemberItemRenderer($filter) {
    var _template;

    this.render = render;

    _init();

    function _init() {
      _template = Handlebars.templates['member.item'];
    }

    /**
     * topic item을 랜더링한다.
     * @param {object} data
     * @returns {*}
     */
    function render(data) {
      return _template({
        profileImage: $filter('getSmallThumbnail')(data),
        userName: $filter('getName')(data)
      });
    }
  }
})();
