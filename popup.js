// On DOM loaded
$( document ).ready(function() {

	// Request list of all skin to background.js
	chrome.runtime.sendMessage({type: "getAllSkin"}, function(response) {
		// when background.js response

		if(response == null){
			return;
		}

		// Remove loading element
		$("#loading").hide();

		// If background.js response with error
		if(response != null && response.error != null){
			$("#splide").hide();
			$("#error").text(response.error);
			$("#error").show();
			return;
		}

		// Inizialize Splide object
		var splide = new Splide( '#splide', {
			type: 'loop',
			width: '95%',
			cover: true,
			waitForTransition: false,
			heightRatio: 1,
			padding: {
				right: '4rem',
				left: '4rem',
			},
		} ).mount();

		// For each skin returned by background.js append element on DOM
		response.skinList.forEach(function(entry) {
		    splide.add( '<li class="splide__slide"><p>' + (entry["name"]) + '</p><div class="splide__slide__container"><img src="' + ( entry["preview_url"] ) + '"/></div></li>' );
		});

		$("#skinSelectBtn").show();

		// Inizialize selected skin based of "selectedskinIndex" returned by background.js
		if(response.selectedskinIndex != null){
				splide.go( response.selectedskinIndex );
				$("#skinSelectBtn").prop("disabled",true);
		}

		// On skin selection move, check if current skin selected is not equal to active skin, then enable skin selection button
		splide.on( 'move', function() {
			if(splide.index === chrome.extension.getBackgroundPage().skinIndex){
				$("#skinSelectBtn").prop("disabled",true);
			}else{
				$("#skinSelectBtn").prop("disabled",false);
			}
		});

		// On click on skin selection button send to background.js new skin id selected
		$("#skinSelectBtn").on("click", function(){
			$("#skinSelectBtn").prop("disabled",true);
			chrome.runtime.sendMessage({type: "selectNewSkin", newId: splide.index}, function(response) {});
		});

	});

	// Remove css transition class to prevent animation on initialize
	$(".slider").before().removeClass('transition');
	// Initialize extension activation switch
	$("#active").prop('checked', chrome.extension.getBackgroundPage().active);

	// On click on extension activation switch send to background.js extension activation status
	$("#active").on("click", function(){
		$(".slider").before().addClass('transition');
		if($(this).is(':checked')){
			chrome.runtime.sendMessage({type: "setActive"}, function(response) {});
		}else{
			chrome.runtime.sendMessage({type: "setNotActive"}, function(response) {});
		}
	});
});
