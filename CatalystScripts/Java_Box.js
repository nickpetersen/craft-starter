function launchEmailClient(subject, body) {
	var uri = 'mailto:',
		hasSubject = typeof subject != 'undefined',
		hasBody = typeof body != 'undefined';
	uri += hasSubject ? ('?subject=' + subject) : '';
	uri += hasBody ? ((hasSubject ? '&' : '?') + 'body=' + body) : '';

	launchUri(uri);
}

function launchUri(uri) {
	var res, parent, popup, iframe, browser;

	function createHiddenIframe(parent) {
		var iframe;
		if (!parent) parent = document.body;
		iframe = document.createElement('iframe');
		iframe.style.display = 'none';
		parent.appendChild(iframe);
		return iframe;
	}

	function removeHiddenIframe(parent) {
		if (!iframe) return;
		if (!parent) parent = document.body;
		parent.removeChild(iframe);
		iframe = null;
	}

	browser = {
		isChrome: false,
		isSafari: false,
		isFirefox: false,
		isIE: false
	};

	if (window.chrome && !navigator.userAgent.match(/Opera|OPR\//)) {
		browser.isChrome = true;
	} else if (typeof InstallTrigger !== 'undefined') {
		browser.isFirefox = true;
	} else if (navigator.userAgent.match(/Safari\//)) {
		browser.isSafari = true;
	} else if ('ActiveXObject' in window) {
		browser.isIE = true;
	}

	if (navigator.msLaunchUri) {
		// Proprietary msLaunchUri method (IE 10+ on Windows 8+)
		navigator.msLaunchUri(uri, function() {}, function() {});
	} else if (browser.isChrome || browser.isSafari) {
		window.location.href = uri;
	} else if (browser.isFirefox) {
		// Catch NS_ERROR_UNKNOWN_PROTOCOL exception (Firefox)
		iframe = createHiddenIframe();
		try {
			// if we're still allowed to change the iframe's location, the protocol is registered
			iframe.contentWindow.location.href = uri;
		} catch (e) {} finally {
			removeHiddenIframe();
		}
	} else if (browser.isIE) {
		// Open popup, change location, check wether we can access the location after the change (IE on Windows < 8)
		popup = window.open('', 'launcher', 'width=0,height=0');
		popup.location.href = uri;
		try {
			// Try to change the popup's location - if it fails, the protocol isn't registered
			// and we'll end up in the `catch` block.
			popup.location.href = 'about:blank';
			// The user will be shown a modal dialog to allow the external application. While
			// this dialog is open, we cannot close the popup, so we try again and again until
			// we succeed.
			timer = window.setInterval(function() {
				popup.close();
				if (popup.closed) window.clearInterval(timer);
			}, 500);
		} catch (e) {
			// Regain access to the popup in order to close it.
			popup = window.open('about:blank', 'launcher');
			popup.close();
		}
	} else {
		// No hack we can use, just open the URL in an hidden iframe
		iframe = createHiddenIframe();
		iframe.contentWindow.location.href = uri;
		window.setTimeout(function() {
			removeHiddenIframe(parent);
		}, 500);
	}
}