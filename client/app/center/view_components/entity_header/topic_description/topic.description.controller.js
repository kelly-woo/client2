/**
 * @fileoverview topic description창의 controller
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function(){
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicDescriptionCtrl', TopicDescriptionCtrl);

  /* @ngInject */
  function TopicDescriptionCtrl($scope, $filter) {
    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _attachEvents();
    }

    /**
     * attach events
     * @private
     */
    function _attachEvents() {
      $scope.$on('webSocketTopic:topicUpdated', _onTopicUpdated);

      $scope.$watch('currentEntity', _onCurrentEntityChanged);
    }

    /**
     * 토픽 정보 갱신 event handler
     * @param {object} angularEvent
     * @param {object} topic
     * @private
     */
    function _onTopicUpdated(angularEvent, topic) {
      if (topic.id === $scope.currentEntity.id) {
        _updateTopicDescription(topic);
      }
    }

    /**
     * topic header controller에서 currentEntity 변경 event handler
     * @param {object} currentEntity
     * @private
     */
    function _onCurrentEntityChanged(currentEntity) {
      if (_.isObject(currentEntity)) {
        _updateTopicDescription(currentEntity);
      }
    }

    /**
     * 토픽 설명 갱신
     * @param {object} currentEntity
     * @private
     */
    function _updateTopicDescription(currentEntity) {
      if (!!currentEntity.description) {
        $scope.topicDescription = currentEntity.description;
      } else {
        $scope.topicDescription = $filter('translate')('@no-topic-description');
      }
    }
  }
})();
