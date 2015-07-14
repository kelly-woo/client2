/**
 * @fileoverview Tutorial 에 필요한 데이터를 담는 저장소. account 정보도 저장한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TutorialTopics', TutorialTopics);

  /* @ngInject */
  function TutorialTopics() {
    var _list = [];
    var _defaultList = [];

    this.clear = clear;
    this.set = set;
    this.get = get;
    this.remove = remove;
    this.active = active;
    this.inactiveAll = inactiveAll;
    this.prepend = prepend;
    this.append = append;
    this.restore = restore;
    this.setDefaultList = setDefaultList;

    /**
     * list 를 설정한다.
     * @param {array} list
     * @param {boolean} [isDefault=false] - default list 로 설정할지 여부
     */
    function set(list, isDefault) {
      if (isDefault) {
        setDefaultList(list);
        restore();
      } else {
        _set(list);
      }
    }

    /**
     * index 에 해당하는 토픽을 activate 한다.
     * @param {number} index
     */
    function active(index) {
      inactiveAll();
      if (_list[index]) {
        _list[index].isActive = true;
      }
    }

    /**
     * index 에 해당하는 topic 을 제거한다.
     * @param {number} index
     */
    function remove(index) {
      _list.splice(index, 1);
    }

    /**
     * 모든 토픽을 inactivate 한다.
     */
    function inactiveAll() {
      _.forEach(_list, function(item) {
        item.isActive = false;
      });
    }

    /**
     * 값을 조회한다.
     * @returns {Array}
     */
    function get() {
      return _list;
    }

    /**
     * list 값을 [] 로 만든다.
     */
    function clear() {
      while (_list.length > 0) {
        _list.pop();
      }
    }

    /**
     * topicList 를 앞에 붙인다.
     * @param {Array|Object} topicList
     */
    function prepend(topicList) {
      topicList = _.isArray(topicList) ? topicList : [topicList];
      _.forEachRight(topicList, function(topic) {
        _list.unshift(topic);
      });
    }

    /**
     * topicList 를 뒤에 붙인다.
     * @param {Array|Object} topicList
     */
    function append(topicList) {
      topicList = _.isArray(topicList) ? topicList : [topicList];
      _.forEach(topicList, function(topic) {
        _list.push(topic);
      });
    }

    /**
     * topicList 를 default 값으로 되돌린다.
     */
    function restore() {
      clear();
      _set(_defaultList);
      active(0);
    }

    /**
     * defaultList 값을 설정한다.
     * @param {Array} defaultList
     */
    function setDefaultList(defaultList) {
      _defaultList = defaultList;
    }

    /**
     * list 값을 설정한다.
     * @param {Array} list
     * @private
     */
    function _set(list) {
      clear();
      _.forEach(list, function(topic) {
        _list.push(topic);
      });
    }
  }
})();
