angular.module('songhop.controllers', ['ionic', 'songhop.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $timeout, $ionicLoading, Recommendations, User) {

	var showLoading = function() {
		$ionicLoading.show({
	    	template: '<i class="ion-loading-c"></i>',
	    	noBackdrop: true
	    });
	}

  var hideLoading = function() {
    $ionicLoading.hide();
  }

  // set loading to true first time while we retrieve songs from server.
  showLoading();

	Recommendations.init()
		.then(function(){
      		$scope.currentSong = Recommendations.queue[0];
      		return Recommendations.playCurrentSong();
    	}).then(function(){
    		hideLoading();
    		$scope.currentSong.loaded = true;
    	});
	

  	$scope.sendFeedback = function(bool) {
  		if (bool) User.addSongToFavorites($scope.currentSong);
  		$scope.currentSong.rated = bool;
  		$scope.currentSong.hide = true;

  		Recommendations.nextSong();
  		
  		$timeout(function() {
  			$scope.currentSong = Recommendations.queue[0];
  			$scope.currentSong.loaded = false;
  		}, 250);

  		Recommendations.playCurrentSong().then(function() {
      		$scope.currentSong.loaded = true;
    	});
  		
  	}

  	$scope.nextAlbumImg = function() {
    	if (Recommendations.queue.length > 1) {
      		return Recommendations.queue[1].image_large;
    	}

    	return '';
  	}

})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, $window, $ionicActionSheet, User, $ionicListDelegate) {

	$scope.favorites = User.favorites;
	$scope.username = User.username;
	 
	$scope.removeSong = function(song, index) {
    	User.removeSongFromFavorites(song, index);
  	}

  	$scope.openSong = function(song) {
    	$window.open(song.open_url, "_system");
  	}

  	// Triggered on a button click, or some other target
 $scope.showShareList = function(song) {

 	$ionicListDelegate.closeOptionButtons();

 	var facebookLink = 'https://www.facebook.com/sharer/sharer.php?u=' + song.open_url;

 	var twitterLink = 'http://www.twitter.com/share?url=' + song.open_url;

   // Show the action sheet
   $ionicActionSheet.show({
     buttons: [
       { text: '<i class="icon ion-social-twitter"></i> Share To Twitter', url: twitterLink },
       { text: '<i class="icon ion-social-facebook"></i> &nbsp; Share To Facebook', url: facebookLink }
     ],
     titleText: 'Share your album',
     cancelText: 'Cancel',
     cancel: function() {
        },
     buttonClicked: function(index, object) {
       $window.open(object.url, "_blank", "location=no,toolbarposition=top");
       return true;
     }
   });

 };

})

.controller('SplashCtrl', function($scope, $state, User) {

	// attempt to signup/login via User.auth
  	$scope.submitForm = function(username, signingUp) {
    	User.auth(username, signingUp).then(function(){
      	// session is now set, so lets redirect to discover page
      	$state.go('tab.discover');

    }, function() {
      // error handling here
      alert('Hmm... try another username.');

    });
  }

})

/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, User, $window, Recommendations) {

	$scope.favCount = User.favoriteCount;

	$scope.enteringFavorites = function() {
		Recommendations.haltAudio();
		User.newFavorites = 0;
	}

	$scope.leavingFavorites = function() {
	 Recommendations.init();
	}

	$scope.logout = function() {
	    User.destroySession();

	    // instead of using $state.go, we're going to redirect.
	    // reason: we need to ensure views aren't cached.
		$window.location.href = 'index.html';
	}

});