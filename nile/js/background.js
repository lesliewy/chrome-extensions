// web请求监听，最后一个参数表示阻塞式，需单独声明权限：webRequestBlocking
chrome.webRequest.onBeforeRequest.addListener(details => {
	// 简单的音视频检测
	// 大部分网站视频的type并不是media，且视频做了防下载处理，所以这里仅仅是为了演示效果，无实际意义
	var allowedDownloadUrls;
	chrome.storage.local.get({ allowedDownloadUrls: {} }, function (items) {
		allowedDownloadUrls = items.allowedDownloadUrls;
			var currentUrl = "";
			chrome.tabs.getSelected(null, function (tab) {
				currentUrl = tab.
				console.log(tab.url);
		});
		if (details.type == 'media') {
			chrome.notifications.create(null, {
				type: 'basic',
				iconUrl: 'img/nile.png',
				title: '检测到音视频',
				message: '音视频地址：' + details.url,
			});
			// 只有满足配置的url才允许下载.
			if (!allowedDownloadUrls) {
				return
			}
			let index, allowed = false;
			for (index in allowedDownloadUrls) {
				if (details.url.match(allowedDownloadUrls[index])) {
					allowed = true;
					break;
				}
			}
			if (allowed) {
				console.log("满足规则, 开始下载...")
				chrome.downloads.download({
					url: details.url,
					filename: details.url.slice(details.url.lastIndexOf("/") + 1)
				}, function (id) { });
			} else {
				console.log("不满足配置的url规则, 不进行下载.")
			}

		}
	});
}, { urls: ["<all_urls>"] }, ["blocking"]);
