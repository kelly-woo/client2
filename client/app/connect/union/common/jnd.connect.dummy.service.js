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
        //--> /connect-api/teams/:teamId/connect
        'connectList': {
          "googleCalendar": [
            {
              "newEventNotification":true,
              "updatedEventNotification":true,
              "cancelledEventNotification":true,
              "createdAt":"2015-12-14T10:01:26.811Z",
              "updatedAt":null,
              "hasWeeklyScheduleSummary":true,
              "hasDailyScheduleSummary":true,
              "hasAllDayNotification":true,
              "hasNotificationBefore":true,
              "authId":11233500,
              "teamId":11186759,
              "memberId":11232644,
              "status":"enabled",
              "roomId":11232773,
              "calendarId":"alex.kim@tosslab.com",
              "calendarSummary":"alex.kim@tosslab.com",
              "timezone":"Asia/Seoul",
              "botId":11234093,
              "lang":"ko",
              "notificationBefore":"4h",
              "allDayNotificationBeforeDates":"2d",
              "allDayNotificationHour":14,
              "dailyScheduleSummary":11,
              "weeklyScheduleSummaryHour":13,
              "weeklyScheduleSummaryDayOfWeek":"TU",
              "id":119
            }
          ],
          "github": [
            {
              "id": 16,
              "hookRepo": "tosslab/toss_server",
              "hookId": 6692298,
              "botId": 11406106,
              "roomId": 510,
              "memberId": 285,
              "teamId": 279,
              "webhookTokenId": 30,
              "connectAuthId": 3,
              "updatedAt": "2015-12-15T13:58:46.124Z",
              "createdAt": "2015-12-15T13:58:46.122Z",
              "hookEvent": [
                "push",
                "commit_comment"
              ],
              "hookBranch": [
                "develop",
                "feature/connect"
              ],
              "lang": "ko",
              "status": "enabled"
            }
          ],
          "trello": [],
          "jira": [
            {
              "id": 13,
              "botId": 11406138,
              "roomId": 295,
              "webhookTokenId": 4,
              "memberId": 11153799,
              "teamId": 279,
              "updatedAt": "2015-12-14T04:27:43.510Z",
              "createdAt": "2015-12-14T04:27:43.508Z",
              "lang": "ko",
              "status": "enabled"
            }
          ],
          "incoming": [
            {
              "id": 14,
              "botId": 11406139,
              "roomId": 295,
              "webhookTokenId": 15,
              "memberId": 11153799,
              "teamId": 279,
              "updatedAt": "2015-12-14T07:43:29.622Z",
              "createdAt": "2015-12-14T07:43:29.619Z",
              "lang": "en",
              "status": "enabled"
            }
          ]
        }
      },
      'googleCalendar': {

      },
      'github': {
        //--> /connect-api/authenticate/github/repos
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
                  "id": 8517680,
                  "name": "agileup.github.com",
                  "full_name": "agileup/agileup.github.com",
                  "html_url": "https://github.com/agileup/agileup.github.com"
                },
                {
                  "id": 32368001,
                  "name": "all-same",
                  "full_name": "agileup/all-same",
                  "html_url": "https://github.com/agileup/all-same"
                },
                {
                  "id": 45299938,
                  "name": "Android-MonthCalendarWidget",
                  "full_name": "agileup/Android-MonthCalendarWidget",
                  "html_url": "https://github.com/agileup/Android-MonthCalendarWidget"
                },
                {
                  "id": 17195498,
                  "name": "angular.js",
                  "full_name": "agileup/angular.js",
                  "html_url": "https://github.com/agileup/angular.js"
                },
                {
                  "id": 11047269,
                  "name": "bookstore",
                  "full_name": "agileup/bookstore",
                  "html_url": "https://github.com/agileup/bookstore"
                },
                {
                  "id": 18752231,
                  "name": "codejam2014",
                  "full_name": "agileup/codejam2014",
                  "html_url": "https://github.com/agileup/codejam2014"
                },
                {
                  "id": 13830825,
                  "name": "codingeverybody",
                  "full_name": "agileup/codingeverybody",
                  "html_url": "https://github.com/agileup/codingeverybody"
                },
                {
                  "id": 15892695,
                  "name": "DesignPatternsPHP",
                  "full_name": "agileup/DesignPatternsPHP",
                  "html_url": "https://github.com/agileup/DesignPatternsPHP"
                },
                {
                  "id": 25016274,
                  "name": "github-services",
                  "full_name": "agileup/github-services",
                  "html_url": "https://github.com/agileup/github-services"
                },
                {
                  "id": 20832529,
                  "name": "html5-boilerplate",
                  "full_name": "agileup/html5-boilerplate",
                  "html_url": "https://github.com/agileup/html5-boilerplate"
                },
                {
                  "id": 38614542,
                  "name": "jandiApi",
                  "full_name": "agileup/jandiApi",
                  "html_url": "https://github.com/agileup/jandiApi"
                },
                {
                  "id": 32367307,
                  "name": "ndwb",
                  "full_name": "agileup/ndwb",
                  "html_url": "https://github.com/agileup/ndwb"
                },
                {
                  "id": 31120124,
                  "name": "node-pushserver",
                  "full_name": "agileup/node-pushserver",
                  "html_url": "https://github.com/agileup/node-pushserver"
                },
                {
                  "id": 32367666,
                  "name": "pemako-android",
                  "full_name": "agileup/pemako-android",
                  "html_url": "https://github.com/agileup/pemako-android"
                },
                {
                  "id": 45396244,
                  "name": "Samantha-API",
                  "full_name": "agileup/Samantha-API",
                  "html_url": "https://github.com/agileup/Samantha-API"
                },
                {
                  "id": 13868658,
                  "name": "scala-for-the-impatient",
                  "full_name": "agileup/scala-for-the-impatient",
                  "html_url": "https://github.com/agileup/scala-for-the-impatient"
                },
                {
                  "id": 44936482,
                  "name": "shower",
                  "full_name": "agileup/shower",
                  "html_url": "https://github.com/agileup/shower"
                },
                {
                  "id": 29468592,
                  "name": "theme-expanse",
                  "full_name": "agileup/theme-expanse",
                  "html_url": "https://github.com/agileup/theme-expanse"
                },
                {
                  "id": 24929387,
                  "name": "tosslab.github.io",
                  "full_name": "agileup/tosslab.github.io",
                  "html_url": "https://github.com/agileup/tosslab.github.io"
                },
                {
                  "id": 47610682,
                  "name": "webhook_connect",
                  "full_name": "agileup/webhook_connect",
                  "html_url": "https://github.com/agileup/webhook_connect"
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
              "owner": "T-SOP",
              "lists": [
                {
                  "id": 13696841,
                  "name": "scala-for-the-impatient",
                  "full_name": "T-SOP/scala-for-the-impatient",
                  "html_url": "https://github.com/T-SOP/scala-for-the-impatient"
                },
                {
                  "id": 13696923,
                  "name": "t-sop.github.com",
                  "full_name": "T-SOP/t-sop.github.com",
                  "html_url": "https://github.com/T-SOP/t-sop.github.com"
                },
                {
                  "id": 14061397,
                  "name": "tsopsite",
                  "full_name": "T-SOP/tsopsite",
                  "html_url": "https://github.com/T-SOP/tsopsite"
                },
                {
                  "id": 18791938,
                  "name": "electko",
                  "full_name": "T-SOP/electko",
                  "html_url": "https://github.com/T-SOP/electko"
                }
              ]
            },
            {
              "owner": "nodejskr",
              "lists": [
                {
                  "id": 14394241,
                  "name": "vamfire",
                  "full_name": "nodejskr/vamfire",
                  "html_url": "https://github.com/nodejskr/vamfire"
                },
                {
                  "id": 18877003,
                  "name": "sc-crawler-v",
                  "full_name": "nodejskr/sc-crawler-v",
                  "html_url": "https://github.com/nodejskr/sc-crawler-v"
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
                  "id": 20124647,
                  "name": "android_client",
                  "full_name": "tosslab/android_client",
                  "html_url": "https://github.com/tosslab/android_client"
                },
                {
                  "id": 20955701,
                  "name": "web_client",
                  "full_name": "tosslab/web_client",
                  "html_url": "https://github.com/tosslab/web_client"
                },
                {
                  "id": 24412803,
                  "name": "tosslab.github.io",
                  "full_name": "tosslab/tosslab.github.io",
                  "html_url": "https://github.com/tosslab/tosslab.github.io"
                },
                {
                  "id": 26013645,
                  "name": "analytics_consol",
                  "full_name": "tosslab/analytics_consol",
                  "html_url": "https://github.com/tosslab/analytics_consol"
                },
                {
                  "id": 32675766,
                  "name": "blog.jandi.com",
                  "full_name": "tosslab/blog.jandi.com",
                  "html_url": "https://github.com/tosslab/blog.jandi.com"
                },
                {
                  "id": 33097329,
                  "name": "web_landing",
                  "full_name": "tosslab/web_landing",
                  "html_url": "https://github.com/tosslab/web_landing"
                },
                {
                  "id": 33097342,
                  "name": "web_admin",
                  "full_name": "tosslab/web_admin",
                  "html_url": "https://github.com/tosslab/web_admin"
                },
                {
                  "id": 34032927,
                  "name": "pc_client",
                  "full_name": "tosslab/pc_client",
                  "html_url": "https://github.com/tosslab/pc_client"
                },
                {
                  "id": 35031122,
                  "name": "toss_chef",
                  "full_name": "tosslab/toss_chef",
                  "html_url": "https://github.com/tosslab/toss_chef"
                },
                {
                  "id": 35470712,
                  "name": "web_server",
                  "full_name": "tosslab/web_server",
                  "html_url": "https://github.com/tosslab/web_server"
                },
                {
                  "id": 38735748,
                  "name": "jandi_api",
                  "full_name": "tosslab/jandi_api",
                  "html_url": "https://github.com/tosslab/jandi_api"
                },
                {
                  "id": 38989952,
                  "name": "sprinkler-iOS-framework",
                  "full_name": "tosslab/sprinkler-iOS-framework",
                  "html_url": "https://github.com/tosslab/sprinkler-iOS-framework"
                },
                {
                  "id": 40462349,
                  "name": "picnic_keygen",
                  "full_name": "tosslab/picnic_keygen",
                  "html_url": "https://github.com/tosslab/picnic_keygen"
                },
                {
                  "id": 41011867,
                  "name": "osx_client",
                  "full_name": "tosslab/osx_client",
                  "html_url": "https://github.com/tosslab/osx_client"
                },
                {
                  "id": 41406035,
                  "name": "sprinklr-spray",
                  "full_name": "tosslab/sprinklr-spray",
                  "html_url": "https://github.com/tosslab/sprinklr-spray"
                },
                {
                  "id": 41406471,
                  "name": "sprinklr-watertank",
                  "full_name": "tosslab/sprinklr-watertank",
                  "html_url": "https://github.com/tosslab/sprinklr-watertank"
                },
                {
                  "id": 42975042,
                  "name": "jandi_gardener",
                  "full_name": "tosslab/jandi_gardener",
                  "html_url": "https://github.com/tosslab/jandi_gardener"
                },
                {
                  "id": 43475309,
                  "name": "jandi_ios",
                  "full_name": "tosslab/jandi_ios",
                  "html_url": "https://github.com/tosslab/jandi_ios"
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
