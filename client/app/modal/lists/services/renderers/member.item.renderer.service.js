/**
 * @fileoverview member item renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MemberItemRenderer', MemberItemRenderer);

  /* @ngInject */
  function MemberItemRenderer($filter, memberService) {
    var _template;

    this.render = render;

    _init();

    function _init() {
      _template = Handlebars.templates['modal.member.list.item'];
    }

    /**
     * topic item을 랜더링한다.
     * @param {object} data
     * @param {string} filterText
     * @returns {*}
     */
    function render(data, filterText) {
      data = _convertData(data);

      return _template({
        html: {
          userName: $filter('typeaheadHighlight')(data.name, filterText)
        },
        profileImage: memberService.getProfileImage(data.id, 'small'),
        starClass: data.isStarred ? 'icon-star-on' : '',
        isShowStar: !data.isDeactive && data.id !== memberService.getMemberId(),
        itemHeight: 44
      });
    }

    /**
     * render에서 사용가능한 data로 변환
     * @param {object} data
     * @returns {{id: *, name: *, isStarred: (*|boolean), isDeactive: isDeactivatedMember, query: *}}
     * @private
     */
    function _convertData(data) {
      return {
        id: data.id,
        name: data.name,
        isStarred: data.isStarred,
        isDeactive: memberService.isDeactivatedMember(data)
      };
    }
  }
})();
