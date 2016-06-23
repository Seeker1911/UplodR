angular.module('uplodr')
  .factory('uploadFactory', ($timeout) => ({
    send (file, path = file.name) {
      return $timeout().then(() => (
        new Promise ((resolve, reject) => {
          const uploadTask = firebase.storage().ref()
            .child(path).put(file)
          uploadTask.on('state_changed',
            null,
            reject,
            () => resolve(uploadTask.snapshot)
          )
        })
      ))
    }
  }))
  .controller('UploadCtrl', function ($scope, $timeout, authFactory, uploadFactory) {
      const API_URL = 'https://capstone-cf12b.appspot.com'
      $scope.files = [];
          const userID = authFactory.getUserID()
          const storageRef = firebase.storage().ref(userID)

         firebase.database().ref(userID).orderByChild('type').equalTo('file').on('child_added', function(childData) {
            $timeout(() => {
              let file = childData.val()
              file.key = childData.key
              $scope.files.push(file)
          });
      })
          $scope.addFile = function(newFile) {
            const input = document.querySelector('[type="file"]')
            const file = input.files[0]
         
            uploadFactory.send(file) 
              .then(res => {
                console.log("res: ", res);
                const fileData = {
                  name: res.a.name,
                  url: res.downloadURL,
                  type: 'file'
                }
                // $scope.files.push(fileData)
                return fileData
              })
              .then((fileData) => {
                firebase.database().ref(userID).push(fileData)
              })
              console.log('files', $scope.files);
          }


          $timeout()
            .then(() => firebase.database().ref(userID).once('value'))
            .then(snap => snap.val())
            .then(data => $scope.file = data)

      })

