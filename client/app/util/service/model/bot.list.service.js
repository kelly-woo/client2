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
  function BotList(Collection, JndUtil) {
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
      that.isJandiBot = isJandiBot;
      that.isConnectBot = isConnectBot;
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
     * jandi bot 인지 여부를 반환한다.
     * @param {number|string} id
     * @returns {boolean}
     */
    function isJandiBot(id) {
      var bot = that.get(id);
      return JndUtil.pick(bot, 'botType') === 'jandi_bot';
    }

    /**
     * connect bot 인지 여부를 반환한다.
     * @param {number|string} id
     * @returns {boolean}
     */
    function isConnectBot(id) {
      var bot = that.get(id);
      return JndUtil.pick(bot, 'botType') === 'connect_bot';
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
