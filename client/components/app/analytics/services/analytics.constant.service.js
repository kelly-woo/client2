/**
 * @fileoverview Constant 서비스. Analytics Module내에서 사용되는 모든 Constant를 관리하는 서비스 
 *               Event와 Property들의 무결성을 보장하기 위해 사용한다.(=오타방지)
 * @author Kevin Lee <kevin@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.analytics')
    .service('analyticsConstant', analyticsConstant);

  /* @ngInject */
  function analyticsConstant() {
    
    this.LOG = {
      EVENT: 'ev',
      IDENTIFY: 'id',
      PROPERTIES: 'pr',
      PLATFORM: 'pl'
    };

    this.LANGUAGE_SET = ['kr', 'en', 'jp', 'zh-cn', 'zh-tw' ];
    
    this.PLATFORM = 'web';
    this.CHANNEL = 'app';

    this.LOCAL_STORAGE_KEY = '_jd_.analytics';
    this.SESSION_STORAGE_KEY = '_jd_.analytics_session';

    this.DEFAULT_PROPERTY = {
      WINDOW_HEIGHT: 'windowHeight',
      WINDOW_WIDTH: 'windowWidth',
      REPOSITORY: 'repository',
      LANGUAGE: 'language'
    };


    this.PROPERTY = {
      CHANNEL: 'p0',
      BROWSER_HEIGHT: 'p1',
      BROWSER_WIDTH: 'p2',
      BROWSER_LANGUAGE: 'p3',
      LANGUAGE: 'p4',
      SYSTEM_HEIGHT: 'p5',
      SYSTEM_WIDTH: 'p6',
      USER_AGENT: 'p7',
      REFERRER: 'p8',
      PAGE: 'p9',
      BUTTON: 'p10',
      PREVIOUS_LANGUAGE: 'p11',
      CURRENT_LANGUAGE: 'p12',
      RESPONSE_SUCCESS: 'p13',
      ERROR_CODE: 'p14',
      CAMPAIGN_NAME: 'p15',
      CAMPAIGN_SOURCE: 'p16',
      CAMPAIGN_MEDIUM: 'p17',
      PROMOTION_CODE: 'p18',
      EMAIL: 'p19',
      TEAM_ID: 'p20',
      MEMBER_ID: 'p21',
      TOPIC_ID: 'p22',
      TOPIC_TYPE: 'p23',
      MEMBER_COUNT: 'p24'
    }

    this.IDENTIFY = {
      ACCOUNT_ID: 'a',
      SESSION: 's',
      TOKEN: 't',
      MEMBER_ID: 'm'
    }

    this.PAGE = {
      'topic/public': 21,
      'topic/private': 22,
      'directmessage': 23,
      'files/files' : 24,
      'files/messages': 25,
      'profile': 26,
      'invite': 27,
      'switchteams': 28,
      'currentmembers': 29,
      'disabledmembers': 30,
      'notifications': 31,
      'topic/invite': 32,
      'files/detail': 33,
      'files/share': 34,
      'files/upload': 35,
      'topic/browse': 36,
      'topic/create': 37,
      'terms/service': 38,
      'private/policy': 39,
      'topic/profile': 40
    }

    //TODO: Event 명 다 바뀔 예정
    this.EVENT = {
      PAGE_VIEWED: 'e0',
      BUTTON_CLICK: 'e1',
      SESSION_START: 'e2',
      WINDOW_FOCUS: 'e3',
      WINDOW_BLUR: 'e4',
      LANGUAGE_CHANGE: 'e5',
      SIGN_OUT: 'e10',
      TOPIC_CREATE: 'e29',
      TOPIC_MEMBER_INVITE: 'e30',
      TOPIC_STAR: 'e31',
      TOPIC_UNSTAR: 'e32',
      TOPIC_NAME_CHANGE: 'e33',
      TOPIC_LEAVE: 'e34',
      TOPIC_DELETE: 'e35'


    }
  }
})();
