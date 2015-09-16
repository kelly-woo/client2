(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('AccountHasSeenService', AccountHasSeenService);

  /* @ngInject */
  function AccountHasSeenService($http, configuration, accountService) {
    /*
      naming 규칙:
        가이드  - GUIDE_XXX_XXX
        공지   - NOTICE_XXX_XXX
     */
    var KEY_MAP = {
      'GUIDE_TOPIC_FOLDER': 0
    };

    this.get = get;
    this.set = set;
    var server_address = configuration.server_address;

    /**
     *
     * @param key
     * @returns {boolean}
     */
    function get(key) {
      var index = _getIndex(key);
      var account = accountService.getAccount();
      var flagStr;
      var flags;

      if (!_.isUndefined(index)) {
        flagStr =  account.hasSeenFlags || '';
        flags = flagStr.split(',');
        return flags[index] === '1';
      } else {
        return false;
      }
    }

    function set(key, isHasSeen) {
      var index = _getIndex(key);
      var account = accountService.getAccount();
      var flagStr;
      var flags;

      if (!_.isUndefined(index)) {
        flagStr =  account.hasSeenFlags || '';
        flags = flagStr.split(',');
        flags[index] = isHasSeen ? 1 : 0;
        _.forEach(flags, function(flag, i) {
          flags[i] = parseInt(flag, 10) === 1 ? '1' : '0';
        });
        $http({
          method: 'PUT',
          url: server_address + 'settings/hasSeenFlags',
          data: {
            flags: flags.join(',')
          }
        });
      }
    }

    function _getIndex(key) {
      return KEY_MAP[key];
    }
  }
})();

