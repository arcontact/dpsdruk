if(!Array.prototype.indexOf){Array.prototype.indexOf=function(obj,fromIndex){if(fromIndex==null)fromIndex = 0;else if (fromIndex<0)fromIndex = Math.max(0, this.length + fromIndex);for(var i=fromIndex, j=this.length; i<j; i++)if(this[i]===obj) return i;return -1;};};
function findIndexByKeyValue(arr,v){for(var i=0, j=arr.length; i<j; i+=1){if(arr[i] == v)return i;}return null;}
function randId(){return Math.random().toString(36).substr(2,10);}
function videourlToHTML(videourl){
	var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	var match = videourl.match(regExp);
	if(match && match[2].length == 11) {
		return '<div class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/'+match[2]+'?rel=0" frameborder="0" allowfullscreen></iframe></div>';
	} else {
		return '<a href="'+videourl+'" class="external button button-fill button-raised color-blue">'+videourl+'</a>';
	}
}
function downloadFile(url){
	var fileTransfer = new FileTransfer();
	var uri = encodeURI(url);
	fileTransfer.download(
		uri,
		fileURL,
		function(entry) {
			console.log("download complete: " + entry.toURL());
		},
		function(error) {
			console.log("download error source " + error.source);
			console.log("download error target " + error.target);
			console.log("download error code" + error.code);
		},
		false,
		{
			headers: {
				"Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
			}
		}
	);
}

var	$$ = Dom7, myApp, mainView,
	initilize_complete = false, index_articles_loaded = false, categories = [],
	articles_limit = 10, articles_offset = articles_limit;
var app = {
	initialize: function(){
		this.bindEvents();
	},
	bindEvents: function(){
		//document.addEventListener('deviceready', this.onDeviceReady, false);
		app.init();
	},
	onDeviceReady: function(){
		app.init();
		document.addEventListener('offline', app.offline, false); //dokończyć
	},
	checkConnection: function(){
		if(typeof navigator.connection == 'undefined' || typeof navigator.connection.type == 'undefined') return 'fail';
		var networkState = navigator.connection.type;
		var states = {};
		states[Connection.UNKNOWN] = 'Unknown connection'; states[Connection.ETHERNET] = 'Ethernet connection'; states[Connection.WIFI] = 'WiFi connection'; states[Connection.CELL_2G] = 'Cell 2G connection'; states[Connection.CELL_3G] = 'Cell 3G connection'; states[Connection.CELL_4G] = 'Cell 4G connection'; states[Connection.CELL] = 'Cell generic connection'; states[Connection.NONE] = 'fail';
		return states[networkState];
	},
	gotConnection: function(){
		//if(app.checkConnection() == 'fail')return false;
		//return true;
		return $$('#conn').prop('checked');
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
								html += '<li><a href="single_category.html?category_id='+category.id+'&subcategory_id='+subcategory.id+'" class="item-link item-content close-panel" data-reload="true" data-id="'+subcategory.id+'"><div class="item-inner"><div class="item-title">'+subcategory.title+'</div></div></a></li>';
							});
							html += '</ul></div>';
							$$('#categories-list .list-block').append(html);
						}
					});
					
					initilize_complete = true;
					categories = response.categories;
				},
				error: function(xhr, status){
					myApp.alert('<div class="text-center"><img src="img/logo.png" class="img-responsive" /><br />Przepraszamy ale wystąpił błąd komunikacji ze stroną<br /><a href="https://dpsdruk.pl" class="external">www.dpsdruk.pl</a></div>', '', function(){
						mainView.router.load({
							url: 'offline_contact.html',
							pushState: false,
							animatePages: false
						});
					});
				},
				complete: function(){
					myApp.hidePreloader();
				}
			});
		} else {
			app.offline('#index');
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
						mainView.router.load({
							url: 'offline.html',
							pushState: false,
							animatePages: false
						});
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
		$$(document).on('page:init', function(e){
			if(!app.gotConnection() && mainView.activePage.name != 'offline' && mainView.activePage.name != 'offline_contact'){
				app.offline();
			}
		});
		myApp.onPageAfterAnimation('offline', function(page){
			if(app.gotConnection()){
				mainView.router.loadPage('#index');
			}
		});
		myApp.onPageAfterAnimation('offline_contact', function(page){
			if(app.gotConnection()){
				mainView.router.loadPage('#index');
			}
		});
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
		myApp.onPageInit('single_category', function(page){
			if(app.gotConnection()){
				myApp.showPreloader('Ładuję produkty...');
				$$.ajax({
					url: 'https://www.beta.dpsdruk.pl/api/index_products/' + page.query.subcategory_id,
					crossDomain: true,
					dataType: 'json',
					data: {key: 'e547a2036c6faffc2859e132e7eee66f'},
					success: function(response, status, xhr){
						$$.each(categories, function(i, category){
							if(category.id == page.query.category_id){
								$$.each(category.children,function(i, subcategory){
									if(subcategory.id == page.query.subcategory_id){
										$$('.single_category_contents').html('<div class="content-block"><h2>'+subcategory.title+'</h2>'+subcategory.content+'</div>');
									}
								});
							}
						});
						var html = '<div class="row">';
						$$.each(response, function(i, product){
							var product_image = String(product.image) != 'null' ? 'https://www.beta.dpsdruk.pl/assets/producers/s6_'+product.image : 'img/noimage100x100.png';
							html += '<div class="col-100 tablet-50"><a href="single_product.html?product_id='+product.id+'" class="card text-center"><div class="card-header no-border"><img src="'+product_image+'" alt="" class="img-responsive" /></div><div class="card-content"><div class="card-content-inner"><p>'+product.symbol+'</p><div class="chip"><div class="chip-label">'+product.price_m2+'</div></div></div></div></a></div>';
						});
						html += '</div>';
						$$('.single_category_contents').append(html);
					},
					error: function(xhr, status){
						myApp.alert('<div class="text-center"><img src="img/logo.png" class="img-responsive" /><br />Przepraszamy ale nie udało się pobrać produktów ze strony <a href="https://dpsdruk.pl" class="external">www.dpsdruk.pl</a></div>', '', function(){
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
		myApp.onPageInit('single_product', function(page){
			if(app.gotConnection()){
				myApp.showPreloader('Ładuję produkt...');
				$$.ajax({
					url: 'https://www.beta.dpsdruk.pl/api/get_product/' + page.query.product_id,
					crossDomain: true,
					dataType: 'json',
					data: {key: 'e547a2036c6faffc2859e132e7eee66f'},
					success: function(response, status, xhr){
						var product = response;
						var html = '<div class="content-block">'+
						'<h2>'+product.title+'</h2>'+
						'<div class="text-center">';
						if(product.can_calculate){
							html += '<div class="chip"><div class="chip-label">'+product.price_m2+'</div></div><p><a href="#" class="button button-fill button-raised text-left"><i class="material-icons">&#xe147;</i> Wykonaj kalkulację</a></p>';
						} else {
							html += '<div class="chip"><div class="chip-label">Na zamówienie</div></div>';
						}
						html += '</div>';
						
						if(typeof product.producer_url != 'undefined')
							html += '<p><a href="'+product.producer_url+'" class="button button-fill button-raised color-blue text-left external"><i class="material-icons">&#xe157;</i> '+product.producer_url+'</a></p>';
						
						html += product.content.replace(/<a(\s[^>]*)?>/ig, '').replace(/<\/a>/ig, '');
						html += '</div>';
						$$('.single_product_contents').html(html);
						
						if(typeof product.videos != 'undefined'){
							$$.each(product.videos, function(i,video){
								var id = randId();
								$$('.single_product_contents .content-block').append('<video id="'+id+'" class="video-js vjs-16-9 vjs-big-play-centered" controls preload="auto"><source src="https://www.beta.dpsdruk.pl/assets/video/'+video+'" type="video/mp4"></video>');
								videojs(id);
							});
						}
						if(typeof product.videourls != 'undefined'){
							$$.each(product.videourls, function(i,videourl){
								var videourlHTML = videourlToHTML(videourl);
								$$('.single_product_contents .content-block').append(videourlHTML);
							});
						}
						if(typeof product.files != 'undefined'){
							var html = '<div class="list-block media-list files-list"><ul>';
							$$.each(product.files, function(i,_file){
								html += '<li><a href="#" data-filename="'+_file.filename+'" class="item-link item-content"><div class="item-inner"><div class="item-title"><i class="material-icons">&#xe8ae;</i> '+_file.title+'</div></div></a></li>';
							});
							html += '</ul></div>';
							$$('.single_product_contents').append(html);
							$$('.single_product_contents .files-list a').on('click',function(){
								downloadFile($$(this).data('filename'));
							});
						}
					},
					error: function(xhr, status){
						myApp.alert('<div class="text-center"><img src="img/logo.png" class="img-responsive" /><br />Przepraszamy ale nie udało się pobrać produktu ze strony <a href="https://dpsdruk.pl" class="external">www.dpsdruk.pl</a></div>', '', function(){
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