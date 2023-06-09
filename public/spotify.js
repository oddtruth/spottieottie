(function() {

        /**
         * Obtains parameters from the hash of the URL
         * @return Object
         */
        function getHashParams() {
          var hashParams = {};
          var e, r = /([^&;=]+)=?([^&;]*)/g,
              q = window.location.hash.substring(1);
          while ( e = r.exec(q)) {
             hashParams[e[1]] = decodeURIComponent(e[2]);
          }
          return hashParams;
        }

        var params = getHashParams();

        var logged_in = params.logged_in;
        var error = params.error;
        var embedUrlList = [];

        if (error) {
          alert('There was an error during the authentication');
        } else {
          if (logged_in) {
            // show the generate image button and everything else.
          	$('#login').hide();
        	  $('#logged-in').show();
          } else {
              // render initial screen
              $('#login').show();
              $('#logged-in').hide();
          }


          document.getElementById('generate-image').addEventListener('click', function() {
            $.ajax({
              url: '/getalbums'
            }).done(function(response) {
              //after request is made, do the following with the response:
              //hide the generate button
              $('.generate').hide();
              // put the list elements and the image container elements into a variable
              imgContainerElements = document.getElementsByClassName('img-container');
              gridElements = document.getElementById('image-grid').getElementsByTagName('img');
              //place the track names on top of each image in the image containers. also assign each imagecontainer a track number attribute
              for (var i = 0; i < imgContainerElements.length; i++) {
              	imgContainerElements[i].getElementsByTagName('span')[0].innerHTML = response['body']['items'][i]['name'];
              	imgContainerElements[i].setAttribute('track-number', i);
              }

              //populate the image containers with the actual images and link the tracks to the image
              for (var i = 0; i < gridElements.length; i++) {
                //set image element url to album art
              	albumImageURL = response['body']['items'][i]['album']['images'][1]['url'];
              	gridElements[i].setAttribute("src", albumImageURL);
                //add track url to urlList to be retrived later
                trackId = response['body']['items'][i]['id'];
                embedURL = "https://open.spotify.com/embed/track/" + trackId + "?utm_source=generator&theme=0";
                embedUrlList.push(embedURL);

                //add click event on imagecontainer element to set iframe track url to the url for the track on the image
                imgContainerElements[i].addEventListener('click', function() {
                  trackNumber = this.getAttribute('track-number');
                  document.getElementsByTagName('iframe')[0].setAttribute('src', embedUrlList[trackNumber]);

                  $('#iframe-player').show();
                  setTimeout( function() {
                    const spotifyEmbedWindow = document.querySelector('iframe[src*="spotify.com/embed"]').contentWindow;
                    spotifyEmbedWindow.postMessage({command: 'toggle'}, '*');
                  }, 2000);
                })

              }

              $('#image-grid').show();

            });
          }, false);
        }
      })();

 $(window).scroll(function(){
  		var scrollBottom = $(window).scrollTop() + $(window).height();
  		var footerHeight = $("#info-footer").height();
		$("#iframe-player").css("bottom", Math.max(10, (scrollBottom - $(document).height() + footerHeight)));
		});	