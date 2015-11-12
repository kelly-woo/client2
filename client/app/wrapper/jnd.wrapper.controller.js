/**
 * @fileoverview jandi wrapper controller
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndWrapperCtrl', JndWrapperCtrl);

  function JndWrapperCtrl($scope, $filter, Dialog, EntityMapManager, entityAPIservice, jndPubSub) {
    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      $scope.$on('kickedOut', _onKickedOut);
      $scope.$on('topicInvite', _onTopicInvite);
      $scope.$on('topicLeave', _onTopicLeave);
    }

    /**
     * kick out 이벤트 핸들러
     * @param {object} angularEvent
     * @param {object} data
     * @private
     */
    function _onKickedOut(angularEvent, data) {
      var topicEntity = EntityMapManager.get('total', data.topic.id);
      var topicName = topicEntity.name;
      var msgTmpl = $filter('translate')('@common-kicked-out');
      var msg = msgTmpl.replace('{{TopicName}}', topicName);

      //Dialog.warning({
      //  body:  msg,
      //  extendedTimeOut: 0,
      //  timeOut: 0
      //});
    }

    /**
     * topic invite 이벤트 핸들러
     * 해당 entity 에 member 를 추가한다
     * @param {object} angularEvent
     * @param {object} data
     * @private
     */
    function _onTopicInvite(angularEvent, data) {
      var entity = EntityMapManager.get('total', data.room.id);
      var memberList = entityAPIservice.getMemberList(entity);
      _.forEach(data.inviter, function(memberId) {
        if (memberList.indexOf(memberId) === -1) {
          memberList.push(memberId);
        }
      });
      entity.members = memberList;

      jndPubSub.pub('room:memberAdded');
    }

    /**
     * topic leave 이벤트 핸들러
     * 해당 entity 에 member 를 삭제한다
     * @param {object} angularEvent
     * @param {object} data
     * @private
     */
    function _onTopicLeave(angularEvent, data) {
      var room = EntityMapManager.get('total', data.room.id);
      var member = data.writer;
      var memberList;
      var index;

      if (room && (memberList = entityAPIservice.getMemberList(room))) {
        if (index = memberList.indexOf(member)) {
          index > -1 && memberList.splice(index, 1);
        }
      }
      room.members = memberList;

      jndPubSub.pub('room:memberDeleted');
    }
  }
})();
