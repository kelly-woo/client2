/**
 * @fileoverview member item renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MemberItemRenderer', MemberItemRenderer);

  /* @ngInject */
  function MemberItemRenderer($filter, publicService, memberService) {
    var _template;

    this.render = render;

    _init();

    function _init() {
      _template = Handlebars.templates['modal.member.list.item'];
    }

    /**
     * topic item을 랜더링한다.
     * @param {object} data
     * @returns {*}
     */
    function render(data) {
      return _template({
        profileImage: memberService.getProfileImage(data.id, 'small'),
        userName: $filter('getName')(data),
        starClass: data.isStarred ? 'icon-star-on' : '',
        isShowStar: !publicService.isDisabledMember(data) && data.id !== memberService.getMemberId(),
        itemHeight: 44
      });
    }
  }
})();
