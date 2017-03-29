var app = {
	initialize: function() {
		this.bindEvents();
	},
	bindEvents: function() {
		//document.addEventListener('deviceready', this.onDeviceReady, false);
		
		//wszystko przenieść do app.onDeviceReady
		var myApp = new Framework7({
			pushState: true,
			swipePanel: 'left',
			material: true,
			notificationCloseButtonText: 'Zamknij',
			modalTitle: 'My App',
			onAjaxStart: function (xhr) {
				myApp.showIndicator();
			},
			onAjaxComplete: function (xhr) {
				myApp.hideIndicator();
			}
		});
		
		var mainView = myApp.addView('.view-main', {
			domCache: true //enable inline pages
		});
	},
	onDeviceReady: function() {
		
	},
};