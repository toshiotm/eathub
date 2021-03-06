var map, marker_list;
var next_start;
var isSeeking = false;
var canPanTo = true;
var position;
marker_list = new google.maps.MVCArray();

var info_window;

$(function(){

    if (marker_list.getLength() == 0) {
		map = new_map(new google.maps.LatLng(38, 138), 5);
	}

	hideLoading();
	hideMore();

	canUseGeoLocation();
});

canUseGeoLocation = function() {
	if (navigator.geolocation) {
		$("#geolocation").show();
	} else {
		$("#geolocation").hide();
	}
}

new_map = function(center, zoom) {
		map = new google.maps.Map($("#area")[0], {
		mapTypeId: google.maps.MapTypeId.ROADMAP
		,disableDefaultUI: true
		,center: center
		,zoom: zoom
	});
	return map;
}

createMarker = function(shop) {

	var marker = new google.maps.Marker({
		position:  new google.maps.LatLng(shop.lat, shop.lng)
		,map: map
		,title: shop.name
		,animation: google.maps.Animation.DROP
	});
	return marker;
}

clearMarker = function() {
	marker_list.forEach(function(marker, idx){
		marker.setMap(null);
	});
}

addInfoWindow = function(marker, shop) {

	var contents = '<img src="' + shop.m + '"> <br>'
	  + '<a target="_blank" href="' + shop.pc + '">' + shop.name + '</a> <br>' + '<p style="font-size: 10px;">Powered by<a href="http://webservice.recruit.co.jp/">ホットペッパー Webサービス</a></p>';

	google.maps.event.addListener(marker, 'click', function(){
		if (info_window) info_window.close();
		info_window = new google.maps.InfoWindow({
			content: contents
		});
		info_window.open(map, marker);
	});
}

createPanToMapOptions = function() {
	var options = {
			zoom: 16
		};
	return options;
}

createShopDetail = function(obj, shop) {
	obj.append($('<li></li>')
		.append('<img src="' + shop.m + '">')
		.append('<a class="sname" target="_blank" href="' + shop.pc + '">' + shop.name + '</a><br>')
		.append('<p><a href="http://webservice.recruit.co.jp/"><img src="http://webservice.recruit.co.jp/banner/hotpepper-s.gif" alt="ホットペッパー Webサービス" width="135" height="17" border="0" title="ホットペッパー Webサービス"></a></p>')
		);
}

tiling = function() {

	var options = {
	autoResize: true
	, container: $('#main')
	, offset: 10
	, itemWidth: 200
	, flexibleWidth: 0
	};

	$('#tiles').imagesLoaded(function(){
		$('#tiles li').wookmark(options);
	});
}


dropMarkers = function(data) {
	var option_data = JSON.parse(JSON.stringify(data));
	var shops = option_data.shops;

	if (shops.length == 0) {return;}

	var shop;
	for(var i=0; i<shops.length; i++) {
		shop = shops[i];
		
		var marker = createMarker(shop);
		marker_list.push(marker);
		addInfoWindow(marker, shop);

		createShopDetail($("#tiles"),shop);
	}

	tiling();

	next_start = option_data.next_start;

	if(next_start == -1) {
		hideMore();
		showMaxFraction(option_data.counts);
	} else {
		 showMore();
		 showFraction(option_data.counts);
	}

	localStorage.setItem("page", option_data.page);
	var center = new google.maps.LatLng(shops[0].lat, shops[0].lng);
	map.setOptions(createPanToMapOptions());

	if (canPanTo) {
		map.panTo(center);
		canPanTo = false;
	}
}

searchByFreeWord = function(start) {
	var key_word = $("#key_word").val();

	if (key_word) {
		isSeeking = true;
		showLoading();
		setKeyword(key_word);
		$.ajax({
			type:"GET"
			,url:"/eathub/get_by_freeword.json/"
			,data:"key_word=" + key_word + "&next_start=" + start
			,success: function(data, dataType){
				if(!map) {
					map = new_map(new google.maps.LatLng(38, 138), 5);
				}
				dropMarkers(data);
				isSeeking = false;
				hideLoading();
			}
			,error: function(XMLHttpRequest, textStatus, errorThrown){
				alert(textStatus);
				isSeeking = false;
				hideLoading();
			}
		});
	}
}

searchByLocation = function(lat, lng, start) {
	isSeeking = true;
	showLoading();
	$.ajax({
		type:"GET"
		,url:"/eathub/get_by_location.json/"
		,data:"lat=" + lat +  "&lng=" + lng + "&next_start=" + start
		,success: function(data, dataType){
			map = new_map(new google.maps.LatLng(38, 138), 5);
			dropMarkers(data);
			isSeeking = false;
			hideLoading();
		}
		,error: function(XMLHttpRequest, textStatus, errorThrown){
			alert(textStatus);
		}
	});
}

showLoading = function () {
	$("#loading").show();
	$("#overlay").show();
}

hideLoading = function() {
	$("#loading").hide();
	$("#overlay").hide();
}
hideMore = function() {
	$("#more").hide();
}
showMore = function() {
	$("#more").show();
}
showFraction = function(counts) {
	$("#counts").html(next_start).append("/").append(counts).append("件");
}
showMaxFraction = function(counts) {
	$("#counts").html(counts).append("/").append(counts).append("件");
}

$(window).scroll(function() {

    var bottom = $(window).scrollTop() + $(window).height();
    var nextCallHeight = bottom + 100;

    if (nextCallHeight >= $(document).height()) {
		searchNextFreeWord();
    }
});

searchNextFreeWord = function () {
    if (next_start && next_start != -1) {
		if (!isSeeking) {
			searchByFreeWord(next_start);
		}
	}
}

searchByNextLocation = function () {
    if (next_start && next_start != -1) {
		if (!isSeeking) {
			var lat = position.coords.latitude;
			var lng = position.coords.longitude;
			searchByLocation(lat, lng, next_start);
		}
	}
}

searchByLocationAndClear = function() {
	clearKeywords();
	clearMarker();
	clearTiles();
	canPanTo = true;
	navigator.geolocation.getCurrentPosition(
		function(pos) {
			position = pos;
			var lat = pos.coords.latitude;
			var lng = pos.coords.longitude;

			searchByLocation(lat, lng, 1);
		}
		, function (error) {
			var err_msg = "";
			switch(error.code) {
			case 1:
				err_msg = "位置情報の利用が許可されていません";
				break;
			case 2:
				err_msg = "デバイスの位置が判定できません";
				break;
			case 3:
				err_msg = "タイムアウトしました";
				break;
			}
			alert(err_msg);
		}
		, {enableHighAccuracy:true}
	);
}

searchByFreeWordAndClear = function() {
	clearMarker();
	clearTiles();
	canPanTo = true;
	searchByFreeWord(1);
}

clearKeywords = function() {
	$("key_word").val("");
	setKeyword("");
}

clearTiles = function () {
	$("#tiles").empty();
}

setKeyword = function(key_word) {
	localStorage.setItem("key_word", key_word);
}

getKeyword = function() {
	return localStorage.getItem("key_word");
}
