var PermalinksURL = {

	__apikey: "",
	__refresh_timeout: 7000,
	__permly_urls: "",

	init: function()
	{
	  var contextMenu = document.getElementById("contentAreaContextMenu");
	  if (contextMenu)
	    contextMenu.addEventListener("popupshowing", PermalinksURL.changeContextLabel, true);
	  
	},
	

	//function to change the context menu item label based on element right-clicked on
	changeContextLabel: function(event)
	{
	
	  var menulabel = document.getElementById("permalinks-url-context-menu");
	  
	  PermalinksURL.fetchPrefs();
	  	  
	  if (document.popupNode.localName == "img")
	  {
		menulabel.label = "Create perm.ly image link";
	  }
	  else if ( document.popupNode.localName == "a" )
	  {
		  var linkurl = document.popupNode.getAttribute( "href" );
		  
		  if( linkurl.indexOf( "http" ) == 0 ) 
			  menulabel.label = "Create perm.ly link";

		  var pathArray = linkurl.split( '/' );
		  var host = pathArray[2];
	
		  if( PermalinksURL.__permly_urls.indexOf( host ) >= 0 ){
			  menulabel.label = "Show perm.ly URL Information";
	      }
		  
	  }else{
		  menulabel.label = "Create perm.ly link";
	  }
	},
	
	getLinkDetail: function( url, node, div ){
		var permlyURL = 'http://api.permly.com/?remote_service=rs_external_api&interface=eai_permly&action=get_link_by_target';
			
		permlyURL = permlyURL + "&key=" + PermalinksURL.__apikey;
		permlyURL = permlyURL + "&version=1.0";

		var data = {"target": encodeURIComponent(url)};
		var postData = {"data":data};	
		var json = JSON.stringify(postData);

		var request = new XMLHttpRequest();
		request.open("POST", permlyURL, true);
		request.onreadystatechange = function() { 
			PermalinksURL.showDetail( request, url, node, div );
		};
		request.setRequestHeader("Content-type","application/x-www-form-urlencoded");		
		request.send("json=" + json);		
	},
	
	getLinkInfo: function( url, node, div ){
		var permlyURL = 'http://api.permly.com/?remote_service=rs_external_api&interface=eai_permly&action=get_link_by_urlkey';
			
		permlyURL = permlyURL + "&key=" + PermalinksURL.__apikey;
		permlyURL = permlyURL + "&version=1.0";

		var pathArray = url.split( '/' );
		var url_key = pathArray[pathArray.length-1];

		var data = {"url_key": encodeURIComponent(url_key)};
		var postData = {"data":data};	
		var json = JSON.stringify(postData);

		var request = new XMLHttpRequest();
		request.open("POST", permlyURL, true);
		request.onreadystatechange = function() { 
			PermalinksURL.showDetail( request, url, node, div );
		};
		request.setRequestHeader("Content-type","application/x-www-form-urlencoded");		
		request.send("json=" + json);		
	},

	checkLinkPresent: function( url,callback,node){
		var permlyURL = 'http://api.permly.com/?remote_service=rs_external_api&interface=eai_permly&action=get_link_by_target';
		permlyURL = permlyURL + "&key=" + PermalinksURL.__apikey;
		permlyURL = permlyURL + "&version=1.0";

		var data = {"target": encodeURIComponent(url)};
		var postData = {"data":data};	
		var json = JSON.stringify(postData);

		var request = new XMLHttpRequest();
		request.open("POST", permlyURL, true);
		request.onreadystatechange = function() { 
			PermalinksURL.processLinkPresent(request,url,callback,node);
		};
		request.setRequestHeader("Content-type","application/x-www-form-urlencoded");		
		request.send("json=" + json);		
	},
	
	processLinkPresent: function(request1,url,callback,node){
		if (request1.readyState == 4) {
			var result = JSON.parse( request1.responseText );
			if (result.data.length == 0)
			{
				PermalinksURL.fetchPrefs();

				var permlyURL = 'http://api.permly.com/?remote_service=rs_external_api&interface=eai_permly&action=save_link';

				permlyURL = permlyURL + "&key=" + PermalinksURL.__apikey;
				permlyURL = permlyURL + "&version=1.0";

				var data = {"target": window.encodeURIComponent(url)};
				var postData = {"data":data};	
				var json = JSON.stringify(postData);

				var request = new XMLHttpRequest();
				request.open("POST", permlyURL, true);

				request.onreadystatechange = function() { 
					PermalinksURL.processResponse( request, callback, node );
				};

				request.setRequestHeader("Content-type","application/x-www-form-urlencoded");			
				request.send("json=" + json);
			}else{
				PermalinksURL.showMyLinkDetail( url, node );
			}
		}		
	},
	
	showDetail: function( request, url, node, div ){		
		if (request.readyState == 4) {
			var result = JSON.parse( request.responseText );			
			if (result.Error){
				alert( "Error while fetching short url information. Status code:" + result.Error.code+ "; Status text: " + result.Error.response );
			}else{
				if(result.data.length >= 0){
					for (var i=0;i<result.data.length;i++) {
						if( url.indexOf( "perm.ly" ) != -1){
							var shortUrl = url
							if(result.data[i].target){
								div.childNodes[1].innerHTML = "perm.ly URL : <a style='color:#4f4f4f;font-size:12px;font-weight:normal' href='" + shortUrl + "' target='_blank'>" + shortUrl + "</a>";					
								
								if(result.data[i].target == "")
									div.childNodes[2].innerHTML = "Target URL : N/A";
								else	
									div.childNodes[2].innerHTML = "Target URL : <a style='color:#4f4f4f;font-size:12px;font-weight:normal' href='" + result.data[i].target + "' target='_blank'>" + result.data[i].target + "</a>";						

								if(result.data[i].count)
									div.childNodes[3].innerHTML = "Click Count : " + result.data[i].count;
							}

							PermalinksURL.copyToClipboard(shortUrl);
						}else{
							var shortUrl = 'http://perm.ly/'+result.data[i].url_key;
							div.childNodes[1].innerHTML = "perm.ly URL : <a style='color:#4f4f4f;font-size:12px;font-weight:normal' href='" + shortUrl + "' target='_blank'>" + shortUrl + "</a>";					
							div.childNodes[3].innerHTML = "Click Count : " + result.data[i].count;
							PermalinksURL.copyToClipboard(shortUrl);
						}											
					}
				}else{
						if( url.indexOf( "perm.ly" ) != -1){
							var shortUrl = url								
							div.childNodes[1].innerHTML = "perm.ly URL : <a style='color:#4f4f4f;font-size:12px;font-weight:normal' href='" + shortUrl + "' target='_blank'>" + shortUrl + "</a>";					
							if(result.data.target == "")
								div.childNodes[2].innerHTML = "Target URL : N/A";
							else
								div.childNodes[2].innerHTML = "Target URL : <a style='color:#4f4f4f;font-size:12px;font-weight:normal' href='" + result.data.target + "' target='_blank'>" + result.data.target + "</a>";

							if(result.data.count)
								div.childNodes[3].innerHTML = "Click Count : " + result.data.count;
							
						}else{
							var shortUrl = 'http://perm.ly/'+result.data.url_key;
							div.childNodes[1].innerHTML = "perm.ly URL : <a style='color:#4f4f4f;font-size:12px;font-weight:normal' href='" + shortUrl + "' target='_blank'>" + shortUrl + "</a>";					
							div.childNodes[3].innerHTML = "Click Count : " + result.data.count;
							
						}											
				}
			}

		}
		
	},
		
	// show preview on web page
	showMyLinkDetail: function( url, node ){
		var div = PermalinksURL.drawPreview( node, url );			
		PermalinksURL.getLinkDetail( url, node, div );		
	},
	
	showMyLinkInfo : function( url, node ){
		var div = PermalinksURL.drawPreview( node, url );			
		PermalinksURL.getLinkInfo( url, node, div );		
	},
	
	// show values in a small iframe
	drawPreview: function( node, url ){
        
	    	var doc = content.document;
		var div = doc.createElement("div");
		div.setAttribute("style","float:bottom;position: relative;top: 1px; left: 1px;min-height: 5em;width: 25em;padding:5px;border: 1px solid #000000; background: none repeat scroll 0 0 #dddddd;z-index:1000;opacity:1.0;");
		div.setAttribute("id", "permly-info-div" );
		var scriptElement = doc.createElement('script');
		
		scriptElement.setAttribute('type', 'text/javascript');        
        
		scrpt1 = document.createTextNode("setTimeout('document.getElementById(\"permly-info-div\").parentNode.removeChild( document.getElementById(\"permly-info-div\") )'," + PermalinksURL.__refresh_timeout + ");");
		scriptElement.appendChild( scrpt1 );
        
		div.innerHTML += "<p style='font-weight:bold;font-family:Arial;font-size:14px;color:#000000;margin:2px;padding:0;'>Perm.ly Link Info</p>";
		div.innerHTML += "<p id='permly-info-div-title' style='font-weight:bold;font-style:normal;font-family:Arial;font-size:12px;color:#4f4f4f;margin:2px;padding:0;background: none repeat scroll 0 0 #dddddd;'>Loading.......</p>";
		
		if( url.indexOf( "perm.ly" ) != -1)
			div.innerHTML += "<p id='permly-info-div-url' style='font-weight:bold;font-style:normal;font-family:Arial;font-size:12px;color:#4f4f4f;margin:2px;padding:0;background: none repeat scroll 0 0 #dddddd;'>&nbsp;</p>";
		else
			div.innerHTML += "<p id='permly-info-div-url' style='font-weight:bold;font-style:normal;font-family:Arial;font-size:12px;color:#4f4f4f;margin:2px;padding:0;background: none repeat scroll 0 0 #dddddd;'>Target URL : <a style='color:#4f4f4f;font-size:12px;font-weight:normal' href='" + url + "' target='_blank'>" + url + "</a></p>";
		
		div.innerHTML += "<p id='permly-info-div-click' style='font-weight:bold;font-style:normal;font-family:Arial;font-size:12px;color:#4f4f4f;margin:2px;padding:0;background: none repeat scroll 0 0 #dddddd;'>&nbsp;</p>";
		
		div.appendChild( scriptElement );
		node.parentNode.insertBefore( div, node.nextSibling );

		return div;       
	},
	
	
	// get preferences set in options. 
	fetchPrefs: function(){
		
		try {
			var oPrefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
			
			if( oPrefs.prefHasUserValue("permalinks.permly.apikey") )
			{
				PermalinksURL.__apikey = oPrefs.getCharPref("permalinks.permly.apikey");
			}
			
			if(PermalinksURL.__apikey == "" || PermalinksURL.__apikey == null )
			{
				alert( "Perm.ly API Key not provided.\nPlease update in \n\n Firefox ->  Addons -> Extensions -> perm.ly -> Options" );
			}
			
			if( oPrefs.prefHasUserValue("permalinks.permly.refresh-timeout") )
			{
				PermalinksURL.__refresh_timeout = parseInt( oPrefs.getCharPref("permalinks.permly.refresh-timeout") ) * 1000;
			}
			
			PermalinksURL.__permly_urls = oPrefs.getCharPref("permalinks.permly.custom-urls");
			
		}catch(e){ alert("Could not load preferences.\n"+ e); }
		
	},
	
	saveLink: function( callback ) {
		
		var node = document.popupNode;
		var loc = content.document.location + "";
		
		// check if right click on image
		var onImage = false;
		if ( node instanceof Components.interfaces.nsIImageLoadingContent && node.currentURI ) {
			onImage = true;
			loc = node.src + "";
		}
		
		// check if right click on link
		var onLink = false;
		if ( node instanceof HTMLAnchorElement && node.href ) {
			onLink = true;
			loc = node.href + "";
		}

		if (loc.length < 1 || loc == 'about:blank' ) {
		  alert('There is no URL to shorten or invalid URL.');
		  return;
		}
		  if( loc.indexOf( "perm.ly" ) != -1){
			 PermalinksURL.showMyLinkInfo( loc, node );

		  }else{			  
			PermalinksURL.checkLinkPresent(loc,callback,node);
		  }
		
	},
		
	processResponse: function( request, callback, node ) {	
		if (request.readyState == 4) {
			var result = JSON.parse( request.responseText );
			
			if (!result.Error)
			{
				callback ( 'http://perm.ly/'+result.data.url_key );
			}
			else if(result.Error.code == "1550"){
				PermalinksURL.showMyLinkDetail(node.getAttribute( "href" ), node);
			}else{
				alert( "Error while processing request. Status code:" + result.Error.code+ "; Status text: " + result.Error.response);
			}
		}
	},
	
	
	// Copy string to clipboard
	copyToClipboard: function( newURL ) {
	
		var clipboard = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
		clipboard.copyString( newURL );
		
		var title = "Created perm.ly link";
		var text = "URL copied to clipboard";
		Components.classes['@mozilla.org/alerts-service;1'].getService(Components.interfaces.nsIAlertsService).showAlertNotification("chrome://shortenurlpermly/permly.png", title, text, false, '', null);
		
	},
  	
	openPage: function( sURL ){
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
		var mainWindow = wm.getMostRecentWindow("navigator:browser");
		mainWindow.gBrowser.selectedTab = mainWindow.gBrowser.addTab( sURL );

		mainWindow.focus();
	}
};

window.addEventListener('load', function () { PermalinksURL.init(); }, false);


