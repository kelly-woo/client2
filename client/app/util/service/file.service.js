(function() {
  'use strict';

  angular
      .module('jandiApp')
      .factory('fileService', fileService);

  /**
   * fileService는 jandiApp에서 제공하는 file object를 관리한다.
   */
  /* @ngInject */
  function fileService($filter, fileAPIservice) {
    var rImage;

    rImage = /image/;

    return {
      /**
       * object 생성자
       */
      init: function($files, options) {

        // options
        this.options = {
          supportAllFileAPI: !!(window.File && window.FileReader && window.FileList && window.Blob),  // page loading시 한번만 check 해야됨. 특정 네임스페이스에 값 관리 필요함.
          supportFileReader: !!window.FileReader, // page loading시 한번만 check 해야됨. 특정 네임스페이스에 값 관리 필요함.
          isMultiple: true,
          msgIsLarge: $filter('translate')('@file-size-too-large-error')
        };

        // options extend
        angular.extend(this.options, options);

        // files setting
        this.setFiles(this.files = $files);

        return this;
      },
      /**
       * file object setter
       */
      setFiles: function($files) {
        var that = this,
            options = that.options,
            files,
            file,
            fileReader,
            i, len;

        that.files = files = $files;  // 원본 $file object를 수정하므로 copy object 생성 필요함.
        for (i = 0, len = that.options.isMultiple ? files.length : 1; i < len; ++i) {
          file = files[i];

          // file size check 100MB이상은 upload 하지 않음
          if (fileAPIservice.isFileTooLarge(file)) {
              files.splice(i, 1);
              --i;
              --len;

              alert(options.msgIsLarge + '\r\n' + file.name);
              continue;
          }

          // image file 여부
          file.isImage = (options.supportFileReader && rImage.test(file.type));
        }

        return that;
      },
      /**
       * file object getter
       */
      getFiles: function(index) {
        var that = this;
        return (angular.isNumber(index) && (index%1 === 0)) ? that.files[index] : that.files;
      },
      /**
       * file object size
       */
      size: function() {
        return this.files.length;
      },
      /**
       * file object 처리 반복자
       */
      iterator: function() {    // 상위 개념 object와 prototype 연결 필요함
        var files,
            index,
            length;

        files = this.files;
        length = files.length;
        index = 0;
        return {
          currentIndex: function() {
            return index;
          },
          next: function() {
            return index < length ? files[index++] : undefined;
          }
        };
      }
    };
  }
}());