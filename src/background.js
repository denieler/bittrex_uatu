(async function () {
	console.log('I\'m an extension to track Bittrex!')

	const bittrexApiUrl = 'https://bittrex.com/api/v1.1/'
	const bittrexUrlsPattern = 'https://bittrex.com/Market/Index?MarketName=*'
	const NOTIFICATION_CONDITIONS_STORAGE_KEY = 'notificationConditions'
	const PREV_PRICES_STORAGE_KEY = 'prevPrices'

	function findBittrexTabs (cb) {
		const queryInfo = {
			url: bittrexUrlsPattern
		}
		chrome.tabs.query(queryInfo, function (result){
			cb(result)
		})
	}

	function showChangePriceNotification (condition, realPrice) {
		const changePriceNotification = {
			iconUrl: 'images/icon.png',
			type: 'basic',
			title: `Bittrex ${condition.currency} price change`,
			message: `Price: ${realPrice.toFixed(2)}. Condition: ${condition.condition}${condition.value.toFixed(2)}`,
			eventTime: Date.now() + 1300
		}
		chrome.notifications.create(null, changePriceNotification)
	}

	function parseTitlePrice (title) {
		try {
			return /\((.*)\) USD.*/ig.exec(title)[1]
		} catch (e) {
			return null
		}
	}

	function turnOffNotificationConditions (conditionsToRemove) {
		chrome.storage.local.get(NOTIFICATION_CONDITIONS_STORAGE_KEY, ({notificationConditions}) => {
			if (!notificationConditions) {
				return
			}

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

	function fitsCondition (notificaionCondition, price, currency) {
		if (notificaionCondition.currency !== currency) {
			return false
		}

		switch (notificaionCondition.condition) {
			case '<=': return price <= notificaionCondition.value
			case '>=': return price >= notificaionCondition.value
			case '<': return price < notificaionCondition.value
			case '>': return price > notificaionCondition.value
			default:
				false
		}
	}

	function isPriceChanged (price, oldPrice) {
		return !oldPrice || price !== oldPrice
	}

	function checkConditions (price, currency) {
		var p = new Promise(resolve => {
			chrome.storage.local.get(NOTIFICATION_CONDITIONS_STORAGE_KEY, ({notificationConditions}) => {
				if (!notificationConditions) {
					resolve(null)
					return
				}

				const coinConditions = notificationConditions.filter(c => c.currency === currency)
				const satisfiedConditions = coinConditions.filter(c => 
					!c.off && fitsCondition(c, price, currency)
				)

				resolve(satisfiedConditions)
			})
		})

		return p
	}

	function onPriceChange (currency, price, oldPrice) {
		if (isPriceChanged(price, oldPrice)) {				
			checkConditions(price, currency)
			.then(satisfiedConditions => {
				const shouldNotify = satisfiedConditions && satisfiedConditions.length
				if (shouldNotify) {
					satisfiedConditions.forEach(condition => {
						showChangePriceNotification(condition, price)
						turnOffNotificationConditions([condition])
					})
				}
			})
		}
	}

	function processTab (tab) {
		const windowId = tab.windowId
		const titleStorageKey = windowId + '_title'
		chrome.storage.local.get(titleStorageKey, value => {
			const oldTitle = value[titleStorageKey]
			const title = tab.title

			const priceStr = parseTitlePrice(title)
			if (!priceStr)
				return;

			const price = parseFloat(priceStr)
			const oldPrice = parseTitlePrice(parseFloat(oldTitle))
			
			onPriceChange(null, price, oldPrice)

			chrome.storage.local.set({[titleStorageKey]: title})
		})
	}

	function getPriceFromApi (market) {
		return fetch(bittrexApiUrl + 'public/getticker',
		{
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({ market })
		})
		.then(res => res.json())
		.then(ticker => {
			return ticker.result.Ask
		})
	}

	function getPrevPrice (currency) {
		var p = new Promise(resolve => {
			chrome.storage.local.get(PREV_PRICES_STORAGE_KEY, ({prevPrices}) => {
				resolve(prevPrices && prevPrices[currency])
			})
		})

		return p
	}

	function updatePrevPrice (price, currency) {
		chrome.storage.local.get(PREV_PRICES_STORAGE_KEY, ({prevPrices}) => {
			if (!prevPrices) {
				prevPrices = { [currency]: price }
			} else {
				prevPrices[currency] = price
			}

			chrome.storage.local.set({[PREV_PRICES_STORAGE_KEY]: prevPrices})
		})
	}

	async function watchForChange () {
		// findBittrexTabs(tabs => tabs.map(processTab))

		const markets = [{
			name: 'USDT-BTC',
			currency: 'BTC'
		}, {
			name: 'USDT-BCC',
			currency: 'BCC'
		}]

		for (let market of markets) {
			const promises = []
			promises.push(market.currency)
			promises.push(getPriceFromApi(market.name))
			promises.push(getPrevPrice(market.currency))
			await Promise.all(promises)
			.then(([currency, price, oldPrice]) => {
				console.log('Currency', currency, 'Prices:', price, oldPrice)
				onPriceChange(currency, price, oldPrice)

				if (isPriceChanged(price, oldPrice)) {
					updatePrevPrice(price, market.currency)
				}
			})
			await new Promise(resolve => setTimeout(_ => resolve(), 1000))
		}

		await new Promise(resolve => setTimeout(_ => resolve(), 1000))
	}

	while(true) {
		try {
			await watchForChange()
		} catch (e) {
			console.log('General error:', e)
		}
	}
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