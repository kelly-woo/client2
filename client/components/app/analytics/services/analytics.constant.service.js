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
      PAGE: 'p9'
    }

    this.IDENTIFY = {
      ACCOUNT_ID: 'a',
      SESSION: 's',
      TOKEN: 't',
      MEMBER_ID: 'm'
    }

    this.PAGE = {
      'publictopic': 0,
      'privatetopic': 1,
      'directmessage': 2,
      'filetab' : 3,
      'messagetab': 4,
      'profile': 5,
      'invite member': 6,
      'switch team': 7,
      'current member list': 8,
      'disabled member list': 9
    }

    //TODO: Event 명 다 바뀔 예정
    this.EVENT = {
      PAGE_VIEWED: 'e0',
      WINDOW_FOCUS: 'Window Focus',
      WINDOW_BLUR: 'Window Blur',
      SESSION_START: 'Start Session',
      CHANGE_LANGUAGE: 'Change Language',
      SIGN_OUT: 'Sign Out',
      DISABLE_MEMBER: 'Disable Member',
      ENABLE_MEMBER: 'Enable Member',
      DISABLE_MEMBER_FAIL: 'Disable Member Fail',
      ENABLE_MEMBER_FAIL: 'Enable Member Fail',
      CHANGE_TEAM_NAME: 'Change Team Name',
      CHANGE_TEAM_DOMAIN: 'Change Team Domain',
      DELETE_TEAM: 'Delete Team',
      RESET_INVITATION_LINK: 'Reset Invitation Link',
      RESET_INVITATION_LINK_FAIL: 'Reset Invitation Link Fail',
      ENABLE_INVITATION_LINK: 'Enable Invitation Link',
      DISABLE_INVITATION_LINK: 'Disable Invitation Link',
      ENABLE_INVITATION_LINK_FAIL: 'Enable Invitation Link Fail',
      DISABLE_INVITATION_LINK_FAIL: 'Disable Invitation Link Fail',
      SUBMIT_PROMOTION_CODE: 'Submit Promotion Code',
      CHANGE_ACCOUNT_NAME: 'Change Account Name',
      CHANGE_ACCOUNT_PRIMARY_EMAIL: 'Change Account Primary Email',
      CHANGE_ACCOUNT_PASSWORD: 'Change Account Password',
      REMOVE_ACCOUNT_EMAIL: 'Remove Account Email',
      REQUEST_VERIFICATION_EMAIL: 'Request Verification Email',
      ADD_ACCOUNT_EMAIL: 'Add Account Email',
      LAUNCH_TEAM: 'Launch Team',
      CREATE_TEAM: 'Create Team',
      INVITE_MEMBER: 'Invite Member'  
    }
  }
})();
