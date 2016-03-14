/**
 * @fileoverview Bot 리스트 모델
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('BotList', BotList);

  /* @ngInject */
  function BotList(Collection) {
    var _jandiBot;
    var _collection;
    var that = this;

    _init();

    /**
     * 초기화 메서드
     * @private
     */
    function _init() {

      _collection =  new Collection({
        key: 'id'
      });

      that.remove = _collection.remove;
      that.reset = _collection.reset;
      that.get = _collection.get;
      that.remove = _collection.remove;
      that.toJSON= _collection.toJSON;

      that.setList = setList;
      that.add = add;
      that.getJandiBot = getJandiBot;
    }

    /**
     * 콜렉션에 chatRoom 을 추가한다.
     * @param {object} bot
     */
    function add(bot) {
      if (bot.botType === 'jandi_bot') {
        _jandiBot = bot;
      }
      _collection.add(bot);
    }

    /**
     * Jandi Bot 을 반환한다.
     * @returns {object}
     */
    function getJandiBot() {
      return _jandiBot;
    }

    /**
     * collection 에 list 를 추가한다.
     * @param {Array} list
     */
    function setList(list) {
      _.forEach(list, function(chatRoom) {
        add(chatRoom);
      });
    }
  }
})();
