if(!Array.prototype.indexOf){Array.prototype.indexOf=function(obj,fromIndex){if(fromIndex==null)fromIndex = 0;else if (fromIndex<0)fromIndex = Math.max(0, this.length + fromIndex);for(var i=fromIndex, j=this.length; i<j; i++)if(this[i]===obj) return i;return -1;};};
function findIndexByKeyValue(arr,v){for(var i=0, j=arr.length; i<j; i+=1){if(arr[i] == v)return i;}return null;}
function randId(){return Math.random().toString(36).substr(2,10);}

var	$$ = Dom7, myApp, mainView,
	initilize_complete = false, index_articles_loaded = false,
	splash_articles = [], articles_limit = 10, articles_offset = articles_limit;
var app = {
	initialize: function(){
		this.bindEvents();
	},
	bindEvents: function(){
		document.addEventListener('deviceready', this.onDeviceReady, false);
		//app.init();
	},
	onDeviceReady: function(){
		app.init();
		document.addEventListener('offline', offline, false); //dokończyć
	},
	checkConnection: function(){
		if(typeof navigator.connection == 'undefined' || typeof navigator.connection.type == 'undefined') return 'fail';
		var networkState = navigator.connection.type;
		var states = {};
		states[Connection.UNKNOWN] = 'Unknown connection'; states[Connection.ETHERNET] = 'Ethernet connection'; states[Connection.WIFI] = 'WiFi connection'; states[Connection.CELL_2G] = 'Cell 2G connection'; states[Connection.CELL_3G] = 'Cell 3G connection'; states[Connection.CELL_4G] = 'Cell 4G connection'; states[Connection.CELL] = 'Cell generic connection'; states[Connection.NONE] = 'fail';
		return states[networkState];
	},
	gotConnection: function(){
		if(app.checkConnection() == 'fail')return false;
		return true;
		//return $$('#conn').prop('checked');
	},
	init: function(){
		myApp = new Framework7({
			swipePanelOnlyClose: true,
			swipeout: false,
			sortable: false,
			uniqueHistory: true,
			tapHold: true,
			pushState: true,
			material: true,
			notificationCloseButtonText: 'Zamknij',
			modalPreloaderTitle: '',
			modalTitle: 'DPSdruk.pl',
			smartSelectBackText: 'Powrót',
			smartSelectPopupCloseText: 'Zamknij',
			smartSelectPickerCloseText: 'Zrobione',
			onAjaxStart: function(xhr) {
				myApp.showIndicator();
			},
			onAjaxComplete: function(xhr) {
				myApp.hideIndicator();
			}
		});
		mainView = myApp.addView('.view-main', {
			domCache: true
		});
		if(app.gotConnection()){
			myApp.showPreloader('Ładuję aplikację...');
			$$.ajax({
				url: 'https://www.beta.dpsdruk.pl/api/init/' + articles_limit,
				crossDomain: true,
				dataType: 'json',
				data: {key: 'e547a2036c6faffc2859e132e7eee66f'},
				success: function(response, status, xhr){
					$$('#splash_articles').html('<div class="content-block-title">Aktualności</div><div class="list-block media-list"><ul></ul></div>');
					$$.each(response.articles, function(i, article){
						var article_date = moment(article.date).format('LL');
						var article_image;
						if(typeof article.image != 'undefined'){
							article_image = 'https://www.beta.dpsdruk.pl/assets/articles/s1_'+article.image;
						} else {
							article_image = 'img/noimage200x104.jpg';
						}
						var li = '<li><a href="single_article.html?article_id='+article.id+'" class="item-link item-content"><div class="item-media"><img data-src="'+article_image+'" class="lazy" width="80" height="42" /></div><div class="item-inner"><div class="item-title-row"><div class="item-title">'+article.title+'</div></div><div class="item-text"><small>'+article_date+'</small></div></div></a></li>';
						$$('#splash_articles ul').append(li);
						$$('.articles-list ul').append(li);
					});
					$$('#splash_articles').append('<a href="#index_articles" class="button">POKAŻ WSZYSTKIE</a>');
					myApp.initImagesLazyLoad($$('.page[data-page="index"]'));
					
					$$('#categories-list').html('<div class="list-block"></div>');
					$$.each(response.categories,function(i, category){
						if(typeof category.children != 'undefined'){
							var html = '<div class="list-group"><ul><li class="list-group-title">'+category.title+'</li>';
							$$.each(category.children,function(i, subcategory){
								html += '<li><a href="single_category.html?category_id='+category.id+'&subcategory_id='+subcategory.id+'" class="item-link item-content close-panel" data-id="'+subcategory.id+'" data-ignore-cache="true" data-animate-pages="false"><div class="item-inner"><div class="item-title">'+subcategory.title+'</div></div></a></li>';
							});
							html += '</ul></div>';
							$$('#categories-list .list-block').append(html);
						}
					});
					
					splash_articles = response.articles;
					initilize_complete = true;
				},
				error: function(xhr, status){
					myApp.alert('<div class="text-center"><img src="img/logo.png" class="img-responsive" /><br />Przepraszamy ale wystąpił błąd komunikacji ze stroną<br /><a href="https://dpsdruk.pl" class="external">www.dpsdruk.pl</a></div>', '', function(){
						mainView.router.loadPage('offline_contact.html');
					});
				},
				complete: function(){
					myApp.hidePreloader();
				}
			});
		} else {
			app.offline('index');
		}
		app.listeners();
	},
	offline: function(page){
		var api_init_start_modal = myApp.modal({
			title: '<div class="text-center"><img src="img/logo.png" class="img-responsive" /><br />Brak połączenia z internetem</div>',
			text: '<div class="text-center">Aplikacja wymaga połączenia z internetem do poprawnego funkcjonowania.</div>',
			buttons: [
				{
					text: '<i class="material-icons">&#xe5d5;</i> Odśwież',
					close: false,
					bold: true,
					onClick: function(){
						$$(api_init_start_modal).find('.modal-button-bold').html('<i class="material-icons fa-spin">&#xe5d5;</i> Sprawdzam...');
						if(app.gotConnection()){
							if(typeof page == 'undefined')
								page = '#index';
							app.connected(page);
						} else {
							setTimeout(function(){
								$$(api_init_start_modal).find('.modal-text').html('<div class="text-center"><span class="text-danger">Nie udało się nawiązać połączenia.</span></div>');
								$$(api_init_start_modal).find('.modal-button-bold').html('<i class="material-icons">&#xe5d5;</i> Odśwież');
							}, 1000);
						}
					}
				},
				{
					text: 'Zamknij',
					onClick: function(){
						mainView.router.loadPage('offline.html');
					}
				}
			]
		});
	},
	refreshConnection: function(button, page){
		$$(button).html('<i class="material-icons fa-spin">&#xe5d5;</i> Sprawdzam...');
		setTimeout(function(){
			$$(button).html('<i class="material-icons">&#xe5d5;</i> Odśwież');
			if(app.gotConnection()){
				app.connected(page);
			}
		}, 1000);
	},
	connected: function(page){
		if(mainView.activePage.name == page){
			mainView.router.refreshPage();
		} else {
			mainView.router.loadPage(page);
		}
	},
	listeners: function(){
		myApp.onPageReinit('index', function(page){
			if(!initilize_complete){
				app.init();
			}
		});
		
		myApp.onPageInit('index_articles', function(page){
			$$('.articles-list').append('<div class="infinite-scroll-preloader"><div class="preloader"><span class="preloader-inner"><span class="preloader-inner-gap"></span><span class="preloader-inner-left"><span class="preloader-inner-half-circle"></span></span><span class="preloader-inner-right"><span class="preloader-inner-half-circle"></span></span></span></div></div>');
			var loading = false;
			var lastIndex = $$('.articles-list .list-block li').length;
			$$('.articles-infinite-scroll.infinite-scroll').on('infinite', function () {
				if(loading) return;
				loading = true;
				setTimeout(function(){
					if(app.gotConnection()){
						$$.ajax({
							url: 'https://www.beta.dpsdruk.pl/api/index_articles/' + articles_limit + '/' + articles_offset,
							crossDomain: true,
							dataType: 'json',
							data: {key: 'e547a2036c6faffc2859e132e7eee66f'},
							success: function(response, status, xhr){
								loading = false;
								if(response.length <= 0){
									myApp.detachInfiniteScroll($$('.infinite-scroll'));
									$$('.infinite-scroll-preloader').remove();
									return;
								}
								var html = '';
								$$.each(response, function(i, article){
									var article_date = moment(article.date).format('LL');
									var article_image;
									if(typeof article.image != 'undefined')
										article_image = 'https://www.beta.dpsdruk.pl/assets/articles/s1_'+article.image;
									else
										article_image = 'img/noimage200x104.jpg';
									html += '<li><a href="single_article.html?article_id='+article.id+'" class="item-link item-content"><div class="item-media"><img data-src="'+article_image+'" class="lazy" width="80" height="42" /></div><div class="item-inner"><div class="item-title-row"><div class="item-title">'+article.article_translation_title+'</div></div><div class="item-text"><small>'+article_date+'</small></div></div></a></li>';
								});
								$$('.articles-list .list-block ul').append(html);
								lastIndex = $$('.articles-list .list-block li').length;
								articles_offset = articles_offset + articles_limit;
								myApp.initImagesLazyLoad($$('.page[data-page="index_articles"]'));
							},
							error: function(xhr, status){
								myApp.alert('<div class="text-center"><img src="img/logo.png" class="img-responsive" /><br />Przepraszamy ale nie udało się pobrać aktualności ze strony <a href="https://dpsdruk.pl" class="external">www.dpsdruk.pl</a></div>', '', function(){
									mainView.router.loadPage('offline_contact.html');
								});
							}
						});
					} else {
						app.offline();
					}
				}, 1000);
			});
			myApp.initImagesLazyLoad($$('.page[data-page="index_articles"]'));
		});
		
		myApp.onPageInit('single_article', function(page){
			if(app.gotConnection()){
				myApp.showPreloader('Ładuję aktualność...');
				$$.ajax({
					url: 'https://www.beta.dpsdruk.pl/api/get_article/' + page.query.article_id,
					crossDomain: true,
					dataType: 'json',
					data: {key: 'e547a2036c6faffc2859e132e7eee66f'},
					success: function(response, status, xhr){
						var article = response;
						var article_date = moment(article.date).format('LLLL');
						var article_image = '';
						if(typeof article.image != 'undefined')
							article_image = '<img src="https://www.beta.dpsdruk.pl/assets/articles/s3_'+article.image+'" class="img-responsive" />';
						$$('#single_article_contents').html('<div class="content-block"><p class="text-muted"><small><i>'+article_date+'</i></small></p><h2>'+article.title+'</h2>'+article_image+article.content+'</div>');
						if(typeof article.videos != 'undefined'){
							$$.each(article.videos, function(i,video){
								var id = randId();
								$$('#single_article_contents .content-block').append('<video id="'+id+'" class="video-js vjs-16-9 vjs-big-play-centered" controls preload="auto"><source src="https://www.beta.dpsdruk.pl/assets/video/'+video+'" type="video/mp4"></video>');
								videojs(id);
							});
						}
					},
					error: function(xhr, status){
						myApp.alert('<div class="text-center"><img src="img/logo.png" class="img-responsive" /><br />Przepraszamy ale nie udało się pobrać aktualności ze strony <a href="https://dpsdruk.pl" class="external">www.dpsdruk.pl</a></div>', '', function(){
							mainView.router.loadPage('offline_contact.html');
						});
					},
					complete: function(){
						myApp.hidePreloader();
					}
				});
			} else {
				app.offline();
			}
		});
	},
};