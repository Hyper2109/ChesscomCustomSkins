// ----- GLOBAL VARIABLE -----
// Url site
const siteUrl = "https://www.chess.com";
// Url remote service return all skin
const allSkinUrl = "https://raw.githubusercontent.com/Hyper2109/test/main/skins_list.php";

// Boolean value indicates if extension is enabled
var active = false;
// The skin index saved
var skinIndex;
// The skin style url saved
var skinUrl;

// Collection of all skin present in remote database
var allSkin;

// ----- MAIN PROCESS -----

main();

// application core
function main(){
  // init global value
  initStorageValue();

  // Check if is a first install
  chrome.runtime.onInstalled.addListener(function(details){
      if(details.reason == "install"){
        saveStorageIsActive(true);
        // get all skin and set as selected first one
        getAllSkin(setFirstSkin);
      }
  });

  // Listener for skinning all chess.com chrome tab when complete loading
  chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.url.startsWith(siteUrl) && active) {
  		addSkin(tab, skinUrl);
    }
  })

  // Manage message received from front-end logic (popup.js)
  chrome.extension.onMessage.addListener( function(request, sender, sendResponse){
  		// Set extension to enabled
  		if(request.type == "setActive"){
  			saveStorageIsActive(true);
  			sendResponse({ok: "ok"});
  		}
  		// Set extension to not enabled
  		else if(request.type == "setNotActive"){
  			saveStorageIsActive(false);
  			sendResponse({ok: "ok"});
  		}
  		// Retrive all skin set from remote db and retur as response to popup.js
  		else if(request.type == "getAllSkin"){
  			getAllSkin(sendResponse);
  			return true;
  		}
  		// Set new skin as selected
  		else if(request.type == "selectNewSkin"){
  			if(request.newId != null && allSkin[request.newId] != null){
  				saveStorageSkin(request.newId, allSkin[request.newId]["style_url"]);
  			}
  			sendResponse({ok: "ok"});
  		}
  });
}

// ----- FUNCTIONS -----

// Inizialize global variables based on chrome.storage.sync values
function initStorageValue(){
	retriveskinIndexStorage();
	retriveSkinUrlStorage();
  retriveActiveStorage();
}

// Set extension to not enabled
function saveStorageIsActive(bool){
	chrome.storage.sync.set({ "active": bool }, function(){
		active = bool;
		toggleSkinAllTab(skinUrl, bool, siteUrl);
	});
}

// Set new skin as selected
function saveStorageSkin(id, url){
	chrome.storage.sync.set({ "skinIndex": id, "skinUrl": url }, function(){
		skinIndex = id;
		skinUrl = url;
		if(active){
			toggleSkinAllTab(url, true, siteUrl);
		}
	});
}

// Save global variable "active" based on chrome.storage.sync value
function retriveActiveStorage(){
  chrome.storage.sync.get(["active"], function(items){
      active = items["active"];
      toggleSkinAllTab(skinUrl, items["active"], siteUrl);
  });
}

// Save global variable "skinIndex" based on chrome.storage.sync value
function retriveskinIndexStorage(){
	chrome.storage.sync.get(["skinIndex"], function(items){
			skinIndex = items["skinIndex"];
	});
}

// Save global variable "skinUrl" based on chrome.storage.sync value
function retriveSkinUrlStorage(){
	chrome.storage.sync.get(["skinUrl"], function(items){
			skinUrl = items["skinUrl"];
	});
}

// set as selected first skin in "skinList" in dict parameter
function setFirstSkin(dict){
	toggleSkinAllTab(dict["skinList"][0]["skinUrl"], true, siteUrl);
}

// Retrive all skins present in a remote db and responce to popup.js by parameter "sendResponse"
function getAllSkin(sendResponse){
	$.ajax({
      type: "GET",
      url: allSkinUrl,
      async: true,
			success: function(data) {
				allSkin = JSON.parse(data);
				sendResponse({skinList: allSkin, selectedskinIndex: indexSelectedOfAllSkin(allSkin, skinUrl)});
			},
			error: function (jqXHR, exception) {
        sendResponse({error: "ERROR! Connection error, retry!"});
    }
  });
}

// Return "allSkin" index of actual skin saved "skinUrl" and set it as current skin
function indexSelectedOfAllSkin(allSkin, skinUrl){
	if(allSkin == null || allSkin.lenght === 0){
		return null;
	}
	for (var i = 0; i < allSkin.length; i++) {
		if(allSkin[i]["style_url"] === skinUrl){
			saveStorageSkin(i, skinUrl);
			return i;
		}
	}
	saveStorageSkin(0, allSkin[0]["style_url"]);
	return 0;
}

// Add or remove skin (based on boolean "bool" parameter and style css url "skinUrl") to all google tab with url equals to "siteUrl" parameter
function toggleSkinAllTab(skinUrl, bool, siteUrl){
	chrome.tabs.getAllInWindow(null, function(tabs){
    for (var i = 0; i < tabs.length; i++) {
			if(tabs[i] != null && tabs[i].url.startsWith(siteUrl)){
				if(bool){
					addSkin(tabs[i], skinUrl);
				}else{
					removeSkin(tabs[i]);
				}
			}
    }
	});
}

// Inject style css url "skinUrl" on specific chrome tad "tab"
function addSkin(tab, skinUrl){
	if (navigator.onLine && skinUrl != null && tab.status === "complete") {
		 chrome.tabs.executeScript(tab.id, {
    	 code: 'var skinUrl = \"' + skinUrl + '\";'
		 }, function(){
			 chrome.tabs.executeScript(tab.id, {
				 file: 'addSkinCss.js'
			 });
		 });
	 }
}

// Remove style css url, previusly added, on specific chrome tad "tab"
function removeSkin(tab){
	if (navigator.onLine) {
		 chrome.tabs.executeScript(tab.id, {
			 file: "removeSkinCss.js"
		 });
	 }
}
