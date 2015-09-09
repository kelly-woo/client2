/**
 * @fileoverview joined topic renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JoinedTopicRenderer', JoinedTopicRenderer);

  /* @ngInject */
  function JoinedTopicRenderer() {
    var _template = '';

    this.render = render;

    _init();

    /**
     * 생성자 함수
     * @private
     */
    function _init() {
      _template = Handlebars.templates['topic.joined'];
    }

    /**
     * index 에 해당하는 메세지를 랜더링한다.
     * @param {number} index
     * @returns {*}
     */
    function render(data) {
      return _template({
        topicName: data.topicName,
        createTime: data.createTime,
        topicDescription: data.topicDescription,
        creatorName: data.creatorName,
        memberCount: data.memberCount,
        commonJoinedMessage: data.commonJoinedMessage
      });
    }
  }
})();
