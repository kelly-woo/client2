/**
 * @fileoverview topic item renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicItemRenderer', TopicItemRenderer);

  /* @ngInject */
  function TopicItemRenderer($filter) {
    var _template;

    this.render = render;

    _init();

    function _init() {
      _template = Handlebars.templates['modal.topic.list.item'];
    }

    /**
     * topic item을 랜더링한다.
     * @param {object} data
     * @returns {*}
     */
    function render(data) {
      return _template({
        topicName: $filter('getName')(data),
        createTime: $filter('getyyyyMMddformat')(data.ch_createTime),
        topicDescription: data.description,
        creatorName: $filter('getName')(data.ch_creatorId),
        memberCount: data.ch_members.length,
        commonJoinedMessage: $filter('translate')('@common-joined'),
        itemHeight: !!data.description ? 130 : 77
      });
    }
  }
})();
