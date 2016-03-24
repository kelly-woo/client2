/**
 * @fileoverview 인증 서비스
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Auth', Auth);

  function Auth($state, accountService, memberService, storageAPIservice, publicService, analyticsService,
                HybridAppHelper, AuthApi) {

    this.signIn = signIn;

    _init();

    /**
     * 초기화 함수
     * @private
     */
    function _init() {
    }

    /**
     * 로그인 시도한다.
     */
    function signIn() {
      _loadLocalToken();
      if (!storageAPIservice.shouldAutoSignIn() && !storageAPIservice.getAccessToken()) {
        AuthApi.requestAccessTokenWithRefreshToken();
      } else {
        accountService.getAccountInfo().then(_onSuccessGetAccount, AuthApi.requestAccessTokenWithRefreshToken);
      }
    }

    /**
     * local storage 에 저장된 token 정보를 로드한다.
     * @private
     */
    function _loadLocalToken() {
      // Handling users with token info in localstorage.
      // Move token info from 'local Storage' -> to 'Cookie'
      if (storageAPIservice.hasAccessTokenLocal()) {
        // User has access_token in LocalStorage meaning we need to move all of token info from localStorage to Cookie.
        // So that new version of auto sign-in could work with current user.
        storageAPIservice.setTokenCookie({
          access_token: storageAPIservice.getAccessTokenLocal(),
          refresh_token: storageAPIservice.getRefreshTokenLocal(),
          token_type: storageAPIservice.getTokenTypeLocal()
        });
        storageAPIservice.setShouldAutoSignIn(true);
        storageAPIservice.removeLocal();
      }
    }

    /**
     * accout 정보 획득 성공 콜백
     * @param {object} result
     * @private
     */
    function _onSuccessGetAccount(result) {
      var response = result.data;
      var account;
      var signInInfo;

      accountService.setAccount(response);
      publicService.setLanguageConfig();

      analyticsService.accountIdentifyMixpanel(response);
      analyticsService.accountMixpanelTrack("Sign In");

      account = accountService.getAccount();
      signInInfo = accountService.getCurrentSignInInfo(account.memberships);

      if (_isInActiveMember(signInInfo)) {
        publicService.redirectToMain();
      } else {
        storageAPIservice.setAccountInfoLocal(account.id, signInInfo.teamId, signInInfo.memberId, signInInfo.teamName);
        storageAPIservice.setShouldAutoSignIn(true);
        memberService.getMemberInfo(signInInfo.memberId).then(_onSuccessGetMemberInfo, AuthApi.requestAccessTokenWithRefreshToken);
      }
    }

    /**
     * member 정보 조회 API 성공 콜백
     * @param {object} result
     * @private
     */
    function _onSuccessGetMemberInfo(result) {
      var response = result.data;
      memberService.setMember(response);
      _setSignInStatics();
      publicService.showDummyLayout();
      $state.go('messages.home');
      HybridAppHelper.onSignedIn();
    }

    /**
     * inactive member 인지 여부를 반환한다.
     * @param {object} signInInfo
     * @returns {boolean} inactive member 인지 여부
     * @private
     */
    function _isInActiveMember(signInInfo) {
      return !!(signInInfo.memberId === -1 || (signInInfo.status && signInInfo.status === 'disabled'));
    }

    /**
     * sign-in 통계 로그를 쌓는다.
     * @private
     */
    function _setSignInStatics() {
      var userIdentify = analyticsService.getUserIdentify();

      analyticsService.mixpanelIdentify(userIdentify);
      analyticsService.mixpanelTrack("Sign In");

      ga('set', 'userId', userIdentify);
      ga('global_tracker.set', 'userId', userIdentify);
    }
  }
})();
