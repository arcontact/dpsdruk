if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, fromIndex) {
		if (fromIndex == null) 
			fromIndex = 0;
		else if (fromIndex < 0)
			fromIndex = Math.max(0, this.length + fromIndex);
		for (var i = fromIndex, j = this.length; i < j; i++)
			if (this[i] === obj) return i;
        return -1;
    };
};
function findIndexByKeyValue(arr, v) {
	for(var i = 0, j = arr.length; i < j; i += 1){
		if(arr[i] == v)
			return i;
	}
	return null;
}

var $$ = Dom7;
var myApp;
var app = {
	settings: {
		callbacks: ['api_init_end'],
		key: 'e547a2036c6faffc2859e132e7eee66f',
	},
	initialize: function() {
		this.bindEvents();
	},
	bindEvents: function() {
		//document.addEventListener('deviceready', this.onDeviceReady, false);
		app.api_init_start();
	},
	onDeviceReady: function() {
		
	},
	api_init_start: function(){
		myApp = new Framework7({
			pushState: true,
			swipePanel: 'left',
			material: true,
			notificationCloseButtonText: 'Zamknij',
			modalPreloaderTitle: '',
			modalTitle: 'DPSdruk.pl',
			smartSelectBackText: 'Powrót',
			smartSelectPopupCloseText: 'Zamknij',
			smartSelectPickerCloseText: 'Zrobione',
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
		myApp.showPreloader('Ładuję aplikację ...');
		app.api('index_categories', {key: app.settings.key}, 'api_init_end');
	},
	api_init_end: function(response){
		$$.each(response,function(index, category){
			var li = '<li><a href="#" class="item-link item-content"><div class="item-inner"><div class="item-title">'+category.category_translation_title+'</div></div></a></li>';
			$$('#categories-list ul').append(li);
		});
		myApp.hidePreloader();
	},
	api: function(method, params, callback){
		$$.ajax({
			url: 'https://www.beta.dpsdruk.pl/api/' + method,
			crossDomain: true,
			data: params,
			dataType: 'json',
			success: function(response, status, xhr){
				app.myEval(callback, response);
			},
			error: function(xhr, status){
				//handle ajax error
			}
		});
	},
	myEval: function(fn_name, params){
		var key = findIndexByKeyValue(app.settings.callbacks, fn_name);
		if(key !== null){
			var fn = app.settings.callbacks[key];
			if(params != null){
				app[fn](params);
			} else {
				app[fn]();
			}
		}
	}
};