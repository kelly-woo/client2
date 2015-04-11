(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocket', jndWebSocket);

  /* @ngInject */
  function jndWebSocket(socketFactory, config) {
    var socket;
    this.init = init;

    function init() {
      var myIoSocket = io.connect(config.socket_server);

      socket = socketFactory({
        prefix: '_jnd_socket:',
        ioSocket: myIoSocket
      });

      //
      //emit('connect_team', {
      //  teamId: 279,
      //  teamName: 'Toss Lab, Inc',
      //  memberId: 295,
      //  memberName: 'MK Choi'
      //});

      socket.on('check_connect_team', function(data) {
        console.log('wowow')
        console.log(data)
      })

    }

    /**
     * Wrapper of emit doing basically same thing.
     * @param eventName
     * @param data
     */
    function emit(eventName, data) {
      console.log(data)
      socket.emit(eventName, data);
    }
  }
})();