(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('currentMemberProfileService', currentMemberProfileService);

  /* @ngInject */
  function currentMemberProfileService(memberService) {
    this.isNamePristine = isNamePristine;
    this.isEmailPristine = isEmailPristine;
    this.isStatusMessagePristine = isStatusMessagePristine;
    this.isPhoneNumberPristine = isPhoneNumberPristine;
    this.isDepartmentPristine = isDepartmentPristine;
    this.isPositionPristine = isPositionPristine;

    function isNamePristine(currentMemeber) {
      return memberService.getName(currentMemeber) == memberService.getName(memberService.getMember());
    }
    function isEmailPristine(currentMemeber) {
      return memberService.getEmail(currentMemeber) == memberService.getEmail(memberService.getMember());
    }
    function isStatusMessagePristine(currentMemeber) {
      return memberService.getStatusMessage(currentMemeber) == memberService.getStatusMessage(memberService.getMember());
    }
    function isPhoneNumberPristine(currentMemeber) {
      return memberService.getPhoneNumber(currentMemeber) == memberService.getPhoneNumber(memberService.getMember());
    }
    function isDepartmentPristine(currentMemeber) {
      return memberService.getDepartment(currentMemeber) == memberService.getDepartment(memberService.getMember());
    }
    function isPositionPristine(currentMemeber) {
      return memberService.getPosition(currentMemeber) == memberService.getPosition(memberService.getMember());
    }

  }
})();