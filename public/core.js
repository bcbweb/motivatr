var motivatr = angular.module('motivatr', []);

function mainController($scope, $http) {

  $scope.formData = {};

  // Get all shared thoughts
  $http.get('/api/thoughts')
    .success(function(data) {
      $scope.thoughts = data;
    })
    .error(function(data) {
      console.log('Error: ', + data);
    });

  // Get all users
  $http.get('/api/users')
    .success(function(data) {
      $scope.users = data;
    })
    .error(function(data) {
      console.log('Error: ', + data);
    });

  // Send data for submitted thought to Node API
  $scope.createThought = function(isValid) {
    delete $scope.successMsg;
    if(isValid) {
      $http.post('/api/thoughts', $scope.formData)
        .success(function(data) {
          $scope.formData = {};
          $scope.thoughts = data;
          $scope.successMsg = "Your thought has been shared.";
          console.log(data);
        })
        .error(function(data) {
          console.log('Error: ' + data);
        });
    }
  };

  // Delete a thought
  $scope.deleteThought = function(id) {
    $http.delete('/api/thoughts/' + id)
      .success(function(data) {
        $scope.thoughts = data;
        //console.log(data);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };

  // Create a new user
  $scope.createUser = function(isValid) {
    delete $scope.usernameErr;
    delete $scope.passwordErr;
    if (isValid) {
      $http.get('/api/users/' + $scope.formData.username)
        .success(function(data) {
          var fail = false;
          if (data.username) {
            $scope.usernameErr = "Username " + data.username + " has already been taken.";
            fail = true;
          }
          if ($scope.formData.password !== $scope.formData.passwordconf) {
            console.log($scope.formData.password + ' / ' + $scope.formData.passwordconf);
            $scope.passwordErr = "Passwords don't match";
            fail = true;
          }
          if (!fail) {
            $http.post('/api/users', $scope.formData)
              .success(function(data) {
                window.location.href = '/login/rs';
              })
              .error(function(data) {
                console.log('Error: ' + data);
              });
          }
        })
        .error(function(data) {
          console.log('Error: ' + data);
        });
    }
  };

  // Update an existing user's details
  $scope.updateUser = function() {
    delete $scope.updateMsg;
    $http.post('/api/users/update', $scope.formData)
      .success(function(data) {
        $scope.updateMsg = "Your details have been updated.";
        $scope.users = data;
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };

  // Get the current user's interests
  $scope.getInterests = function(username) {
    console.log(username);
    // Get all user interests
    $http.get('/api/users/' + username)
      .success(function(data) {
        $scope.interests = data.interests;
        console.log('got interests: ' + data.interests);
      })
      .error(function(data) {
        console.log('Error: ', + data);
      });
  }

  // Add a new interest for the current user
  $scope.addInterest = function(isValid) {
    delete $scope.interestErr;
    $http.post('/api/users/interests', $scope.formData)
      .success(function(data) {
        $scope.interests = data;
        $scope.interestsForm.$setPristine();
        $scope.formData.interest = "";
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  }

  // Delete one of the current user's interests
  $scope.deleteInterest = function(keyword) {
    $http.delete('/api/users/interests/' + keyword)
      .success(function(data) {
        $scope.interests = data;
        console.log(data);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  }

  // Delete a user by document ID
  $scope.deleteUser = function(id) {
    $http.delete('/api/users/' + id)
      .success(function(data) {
        $scope.users = data;
        //console.log(data);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };

  // Handle a login request
  $scope.userLogin = function(isValid) {
    delete $scope.loginErr;
    if (isValid) {
      $http.post('/api/login', $scope.formData)
        .success(function(data) {
          if(data === 'true') {
            window.location.href = '/';
          } else {
            $scope.loginErr = "Login details incorrect. Please retry.";
          }
        })
        .error(function(data) {
          console.log('Error: ' + data);
          $scope.loginErr = "There was a problem verifying your login request.";
        });
    }
  }

  // Handle a logout request
  $scope.userLogout = function() {
    $http.get('/api/logout')
      .success(function(data) {
        console.log('Logged out.');
        window.location.href = '/login';
      })
      .error(function(data) {
        console.log('Error logging out.');
      });
  }
  
}