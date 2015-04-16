// INVITE USER TO TEAM
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('inviteUserToTeamCtrl', inviteUserToTeamCtrl);

  /* @ngInject */
  function inviteUserToTeamCtrl($scope, $modalInstance, $filter, teamAPIservice, analyticsService) {
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.onInviteClick = function() {
      if ($scope.isLoading) return;

      $scope.toggleLoading();


      var invites = [];
      $('input.invite').each(function(idx) {
        var input = $(this);
        if (input.val()) {
          var emailAddress = input.val().toLowerCase();

          invites.push(emailAddress);
          input.attr('id', emailAddress);
        }
      });

      // help message
      var help_missing = $filter('translate')('@alert-missing-info');
      var help_fail_send = $filter('translate')('@alert-send-mail-fail');
      var help_error_taken = $filter('translate')('@alert-send-mail-taken');
      var help_error_invalid = $filter('translate')('@alert-send-mail-invalid');
      var help_success_send = $filter('translate')('@alert-send-mail-success');

      // html fragment
      //var html_noti_fail = '<div class="modal-noti-block"><h1>' + help_fail_send + '</h1></div>';
      //var html_noti_success = '<div class="modal-noti-block alert-jandi alert-success"><h1>' + help_success_send + '</h1></div>';

      if (invites.length > 0) {
        teamAPIservice.inviteToTeam(invites)
          .success(function(response) {
            var successCnt = 0;
            var successList = [];
            var failList = [];

            _.forEach(response, function(value, index) {
              //console.log(value)
              var inviteStatus = '';

              angular.element(document.getElementById(value.email)).parent().children('.modal-noti-block_msg').remove();

              //console.log(angular.element(document.getElementById(value.email)).parent().children('.modal-noti-block_msg').remove())
              if (!value.success) {
                failList.push(value.email);

                if (value.msg.indexOf('already has membership') > -1) {
                  inviteStatus = angular.element('<div class="modal-noti-block_msg alert-jandi alert-danger">'+ value.email+'<span>' + help_error_taken + '</span><div>');
                }
                else if (value.msg.indexOf('Invalid') > -1) {
                  inviteStatus = angular.element('<div class="modal-noti-block_msg alert-jandi alert-danger">'+ value.email+'<span>' + help_error_invalid + '</span><div>');
                }
              } else {
                successCnt++;
                successList.push(value.email);
                inviteStatus = angular.element('<div class="modal-noti-block_msg alert-jandi alert-success"><span>' + help_success_send + '</span><div>');
              }

              angular.element(document.getElementById(value.email)).parent().append(inviteStatus)

            });

            if (successCnt > 0) {
              analyticsService.mixpanelTrack( "User Invite", { "count": successCnt } );
              analyticsService.mixpanelPeople( "increment", { "key": "invite", "value": successCnt } );
            }

          })
          .error(function(error) {
            console.error(error.code, error.msg);
          })
          .finally(function() {
            $scope.toggleLoading();
          });
      } else {
        $scope.toggleLoading();
        alert(help_missing);
      }
    };

    $scope.totalNumberOfInput = 0;

    $scope.onAddMoreClick = function() {
      var input_email = $filter('translate')('@input-invite-email');
      var invite_template = angular.element(
        '<div class="form-horizontal">' +
        '<input type="email" class="form-control invite" name="email" data-ng-required="true" placeholder="' + input_email + '" />' +
        '</div>'
      );
      $('.invite-team-body').append(invite_template);
    };

    $scope.toggleLoading = function() {
      $scope.isLoading = !$scope.isLoading;
    }
  }
})();
