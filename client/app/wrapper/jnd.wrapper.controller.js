/**
 * @fileoverview jandi wrapper controller
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndWrapperCtrl', JndWrapperCtrl);

  function JndWrapperCtrl($scope, $filter, Dialog, EntityMapManager) {

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      $scope.$on('kickedOut', _onKickedOut);
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
  }
})();
