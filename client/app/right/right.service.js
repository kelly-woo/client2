/**
 * @fileoverview right panel service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('RightPanel', RightPanel);

  /* @ngInject */
  function RightPanel($state, $filter, configuration) {
    var _that = this;
    var _tabs = {
      files: {
        name: $filter('translate')('@common-files'),
        isActive: false
      },
      messages: {
        name: $filter('translate')('@common-message'),
        isActive: false
      },
      stars: {
        name: $filter('translate')('@common-star'),
        isActive: false
      },
      mentions: {
        name: $filter('translate')('@common-mention'),
        isActive: false
      }
    };
    var _currentRightPanel = getStateName($state.current);

    var _tail;

    _init();

    function _init() {
      _that.isOpen = isOpen;
      _that.isOpenFileDetail = isOpenFileDetail;

      _that.closeTabs = closeTabs;

      _that.getTabStatus = getTabStatus;
      _that.getActiveTab = getActiveTab;
      _that.getStateName = getStateName;

      _that.getTail = getTail;
      _that.setTail = setTail;

      if (_currentRightPanel) {
        // active된 right panel에 따라 header icon 활성화 여부를 설정한다.
        _tabs[_currentRightPanel].isActive = true;
      }
    }

    function isOpen() {
      return $state.includes('**.files.**') ||
        $state.includes('messages.detail.messages') ||
        $state.includes('**.stars.**') ||
        $state.includes('**.mentions.**');
    }

    function isOpenFileDetail() {
      return $state.includes('**.files.item') ||
        $state.includes('**.stars.item') ||
        $state.includes('**.mentions.item');
    }

    function closeTabs() {

    }

    function getTabStatus() {
      return _tabs;
    }

    function getActiveTab() {
      return _.pick(_tabs, function(tab) {
        return tab.isActive === true;
      });
    }

    /**
     * state로 active 되야할 right panel의 tab name을 전달함.
     * @param {object} currentState
     * @returns {Array|{index: number, input: string}|*}
     */
    function getStateName(currentState) {
      var match = /messages.detail.([a-z]+)/i.exec(currentState.name);
      return match && match[1];
    }

    /**
     * right panel back tail 전달
     * @returns {*}
     */
    function getTail() {
      return _tail;
    }

    /**
     * * right panel back tail 설정
     * @param value
     */
    function setTail(value) {
      _tail = value;
    }
  }
})();
