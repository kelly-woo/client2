/**
 * @fileoverview joinable topic renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JoinableTopicRenderer', JoinableTopicRenderer);

  /* @ngInject */
  function JoinableTopicRenderer($filter) {
    var _template = '';

    this.render = render;

    _init();

    /**
     * 생성자 함수
     * @private
     */
    function _init() {
      _template = Handlebars.templates['topic.joinable'];
    }

    /**
     * index 에 해당하는 메세지를 랜더링한다.
     * @param {number} index
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
        btnJoinMessage: $filter('translate')('@btn-join')
      });
    }
  }
})();
