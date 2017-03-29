var app = {
	initialize: function() {
		this.bindEvents();
	},
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	onDeviceReady: function() {
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
	},
};