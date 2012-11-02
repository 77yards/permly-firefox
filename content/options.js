// currently no function required.

var bPermalinksUrlOptions =
{
	
	checkApiKey: function( document )
	{
		try {	
			var apikey = document.getElementById( 'permly-apikey' ).value;
			
			if (apikey == null || apikey == "" )
			{
				alert( "API Key not set!" );
				return;
			}
						
			var permlyURL = "http://api.permly.com/?remote_service=rs_external_api&interface=eai_permly&action=get_user&key="+apikey + "&version=1.0";

			var postData = {"data":''};	
			var json = JSON.stringify(postData);

			var request = new XMLHttpRequest();
			request.open("POST", permlyURL, true);
			request.onreadystatechange = function() { 
				if (request.readyState == 4) {
					var result = JSON.parse( request.responseText );
					if(!result.Error)
					{
						alert( "Valid API Key!" );
					}else 
					{
						alert( "Error validating API Key: " + result.Error.response);
					}
				}
			};
			request.setRequestHeader("Content-type","application/x-www-form-urlencoded");			
			request.send("json=" + json);			
			
		}catch(e){ alert("Error saving preferences.\n"+ e); }
	},
	
	showApiKey: function( document )
	{
		bPermalinksUrlOptions.openPage( "http://perm.ly/get-api-key" );
	},
		
	openPage: function( sURL ){
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
		var mainWindow = wm.getMostRecentWindow("navigator:browser");
		mainWindow.gBrowser.selectedTab = mainWindow.gBrowser.addTab( sURL );

		mainWindow.focus();
	}	
};
