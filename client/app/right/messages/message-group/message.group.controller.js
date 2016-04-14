/**
 * @fileoverview search message controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightMessageGroupCtrl', RightMessageGroupCtrl);

  /* @ngInject  */
  function RightMessageGroupCtrl($scope, $state, currentSessionHelper, jndPubSub, MessageQuery) {
    _init();

    function _init() {
      $scope.message.entity.extContentType = $scope.message.entity.type;

      $scope.prev = _getMessageData($scope.message.prev);
      $scope.current = _getMessageData($scope.message.current, true);
      $scope.next = _getMessageData($scope.message.next);

      $scope.onMessageCardClick = onMessageCardClick;

      $scope.entity = $scope.message.entity;
      $scope.messageType = 'message';
    }

    /**
     * message data와 entity data를 merge하여 전달
     * @param {object} messageData
     * @param {object} hasStar
     * @returns {*}
     * @private
     */
    function _getMessageData(messageData, hasStar) {
      var data;

      if (messageData != null) {
        data = _.extend({}, messageData);
      }

      hasStar && (data.hasStar = true);

      return data;
    }

    /**
     * message card click event handler
     * @param {object} $event
     */
    function onMessageCardClick() {
      var toEntityId = $scope.entity.id;
      var toLinkId = $scope.current.linkId;

      MessageQuery.setSearchLinkId(toLinkId);

      if (!_isToEntityCurrent(toEntityId)) {
        _goTo($scope.entity);
      } else {
        jndPubSub.pub('jumpToMessageId');
      }
    }

    /**
     * entity id가 center에 출력중인 entity인지 여부
     * @param {number} toEntityId
     * @returns {boolean}
     * @private
     */
    function _isToEntityCurrent(toEntityId) {
      return currentSessionHelper.getCurrentEntityId() === toEntityId;
    }

    /**
     * go archive state
     * @param {object} state
     * @param {string} state.type - channel 또는 privategroup
     * @param {number} state.id
     * @private
     */
    function _goTo(state) {
      $state.go('archives', { entityType: state.type + 's', entityId: state.id });
    }
  }
})();
