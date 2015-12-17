/**
 * @fileoverview 잔디 커넥트 더미 데이터 모음
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndConnectDummy', JndConnectDummy);

  function JndConnectDummy() {
    this.get = get;
    var DATA = {
      'common': {

      },
      'googleCalendar': {

      },
      'github': {
        'repo': {
          "authenticationId": 1,
          "authenticationName": "agileup",
          "repos": [
            {
              "owner": "agileup",
              "lists": [
                {
                  "id": 32367018,
                  "name": "2012-csproject-team16",
                  "full_name": "agileup/2012-csproject-team16",
                  "html_url": "https://github.com/agileup/2012-csproject-team16"
                },
                {
                  "id": 41677232,
                  "name": "WithCamp2015-Love-Bed",
                  "full_name": "agileup/WithCamp2015-Love-Bed",
                  "html_url": "https://github.com/agileup/WithCamp2015-Love-Bed"
                }
              ]
            },
            {
              "owner": "tosslab",
              "lists": [
                {
                  "id": 18755076,
                  "name": "toss_server",
                  "full_name": "tosslab/toss_server",
                  "html_url": "https://github.com/tosslab/toss_server"
                },
                {
                  "id": 19969971,
                  "name": "ios_client",
                  "full_name": "tosslab/ios_client",
                  "html_url": "https://github.com/tosslab/ios_client"
                },
                {
                  "id": 20955701,
                  "name": "web_client",
                  "full_name": "tosslab/web_client",
                  "html_url": "https://github.com/tosslab/web_client"
                }
              ]
            }
          ]
        }
      }
    };

    function get(union) {
      return union ? DATA[union] : DATA;
    }
  }
})();
