(function () {
	console.log('I\'m an extension to track Bittrex!')

	const bittrexUrlsPattern = 'https://bittrex.com/Market/Index?MarketName=*'
	const NOTIFICATION_CONDITIONS_STORAGE_KEY = 'notificationConditions'

	function findBittrexTabs (cb) {
		const queryInfo = {
			url: bittrexUrlsPattern
		}
		chrome.tabs.query(queryInfo, function (result){
			cb(result)
		})
	}

	function showChangePriceNotification (price) {
		const changePriceNotification = {
			iconUrl: 'images/icon.png',
			type: 'basic',
			title: 'Bittrex BTC price change',
			message: 'Price: ' + price.toFixed(2),
			eventTime: Date.now() + 1300
		}
		chrome.notifications.create(null, changePriceNotification)
	}

	function parseTitlePrice (title) {
		return /\((.*)\) USD.*/ig.exec(title)[1]
	}

	function turnOffNotificationConditions (conditionsToRemove) {
		chrome.storage.local.get(NOTIFICATION_CONDITIONS_STORAGE_KEY, ({notificationConditions}) => {
			const notifications = notificationConditions.map(c => {
				if (conditionsToRemove.some(cr => 
					c.currency === cr.currency
					&& c.condition === cr.condition
					&& c.value === cr.value
				)) {
					c.off = true
				}

				return c
			})
			chrome.storage.local.set({[NOTIFICATION_CONDITIONS_STORAGE_KEY]: notifications})
		})
	}

	function fitsCondition (notificaionCondition, price) {
		switch (notificaionCondition.condition) {
			case '<=': return price <= notificaionCondition.value
			case '>=': return price >= notificaionCondition.value
			case '<': return price < notificaionCondition.value
			case '>': return price > notificaionCondition.value
			default:
				false
		}
	}

	function processTab (tab) {
		const windowId = tab.windowId
		const titleStorageKey = windowId + '_title'
		chrome.storage.local.get(titleStorageKey, value => {
			const oldTitle = value[titleStorageKey]
			const title = tab.title

			if (title !== oldTitle) {
				const price = parseFloat(parseTitlePrice(title))

				chrome.storage.local.get(NOTIFICATION_CONDITIONS_STORAGE_KEY, ({notificationConditions}) => {
					const btcConditions = notificationConditions.filter(c => c.currency === 'BTC')
					const satisfiedConditions = btcConditions.filter(c => 
						!c.off && fitsCondition(c, price)
					)

					if (satisfiedConditions.length) {
						showChangePriceNotification(price)
						turnOffNotificationConditions(satisfiedConditions)
					}
				})
			}

			chrome.storage.local.set({[titleStorageKey]: title})
		})
	}

	function watchForChange () {
		setInterval(_ => {
			findBittrexTabs(tabs => tabs.map(processTab))
		}, 1500)
	}

	watchForChange()
})()

// var hostName = "com.denieler.shuttle_control_panel";
// console.log("Connecting to native messaging host " + hostName);

// var port = chrome.runtime.connectNative(hostName);

// port.onMessage.addListener(onNativeMessage);
// port.onDisconnect.addListener(onDisconnected);

// function onNativeMessage(message) {
// 	var route = message.action;

// 	switch(route){
// 		case 'next-song':
// 			nextSong();
// 			break;
// 		case 'prev-song':
// 			prevSong();
// 			break;
// 		case 'pause-song':
// 			pauseSong();
// 			break;		
// 		case 'up-volume':
// 			upVolume();
// 			break;
// 		case 'down-volume':
// 			downVolume();
// 			break;
// 	}
// }

// function onDisconnected() {
//     console.error("Failed to connect: " + chrome.runtime.lastError.message);
//     port = null;
// }

// function findVkMusicTab (callback) {
// 	chrome.tabs.query({}, function (result){
// 		var found = false;
// 		result.forEach(function(tab){

// 			if(tab.audible && tab.url.search('vk.com') != -1){
// 				found = true;
// 				callback(tab);
// 			}

// 		});

// 		//not found
// 		if (!found) {
// 			var ctrlSelector = '#audios_list';
// 			result.forEach(function(tab){
// 				chrome.tabs.executeScript(tab.id,
// 				{
// 					code: 'return document.querySelector(\'' + ctrlSelector + '\');'
// 				}, function (resultElement) {
// 					if (resultElement && resultElement.length > 0 && tab.url.search('vk.com') != -1)
// 					{
// 						callback(tab);
// 					}
// 				});
// 			});
// 		}
// 	});
// }

// function pauseSong () {
// 	var ctrlSelector = '#ac_controls #ac_play';

// 	findVkMusicTab(function (tab){
// 	    var tab_id = tab.id;

// 		chrome.tabs.executeScript(tab_id,
// 		{
// 			code: 'var ctrl = document.querySelector(\'' + ctrlSelector + '\'); ctrl.click();'
// 		});
// 	});
// }


// function prevSong () {
// 	var ctrlSelector = '#ac_controls #ac_prev .prev.ctrl';

// 	findVkMusicTab(function (tab){
// 	    var tab_id = tab.id;

// 		chrome.tabs.executeScript(tab_id,
// 		{
// 			code: 'var ctrl = document.querySelector(\'' + ctrlSelector + '\'); ctrl.click();'
// 		});
// 	});
// }

// function nextSong () {
// 	var ctrlSelector = '#ac_controls #ac_next .next.ctrl';

// 	findVkMusicTab(function (tab){
// 	    var tab_id = tab.id;

// 		chrome.tabs.executeScript(tab_id,
// 		{
// 			code: 'var ctrl = document.querySelector(\'' + ctrlSelector + '\'); ctrl.click();'
// 		});
// 	});
// }

// function upVolume () {
// 	findVkMusicTab(function (tab){
// 	    var tab_id = tab.id;

// 		chrome.tabs.executeScript(tab_id,
// 		{
// 			code: 'var s = document.createElement(\'script\');' +
// 			's.src = chrome.extension.getURL(\'vk_files/up-volume.js\');' +
// 			's.onload = function() {this.parentNode.removeChild(this);};' +
// 			'(document.head || document.documentElement).appendChild(s);'
// 		});
// 	});	
// }

// function downVolume () {
// 	findVkMusicTab(function (tab){
// 	    var tab_id = tab.id;

// 		chrome.tabs.executeScript(tab_id,
// 		{
// 			code: 'var s = document.createElement(\'script\');' +
// 			's.src = chrome.extension.getURL(\'vk_files/down-volume.js\');' +
// 			's.onload = function() {this.parentNode.removeChild(this);};' +
// 			'(document.head || document.documentElement).appendChild(s);'
// 		});
// 	});	
// }