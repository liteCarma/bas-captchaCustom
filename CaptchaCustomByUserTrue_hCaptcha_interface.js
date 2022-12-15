<div class="container-fluid">
	<%= _.template($('#input_constructor').html())({
	  id: "service",
	  description: tr("Service"),
	  default_selector: "string",
	  variants: [
      "rucaptcha<br/><span style='color:gray;font-size:small'>RuCaptcha - rucaptcha.com</span>",
      "2captcha<br/><span style='color:gray;font-size:small'>2Captcha - 2captcha.com</span>",
      "antigate<br/><span style='color:gray;font-size:small'>Anti-Captcha - anti-captcha.com</span>",
      "anycaptcha<br/><span style='color:gray;font-size:small'>Anycaptcha - anycaptcha.com</span>",
      "captchaguru<br/><span style='color:gray;font-size:small'>Captcha.Guru - captcha.guru</span>",
      "capcloud<br/><span style='color:gray;font-size:small'>Capmonster.Cloud - capmonster.cloud</span>",
      "capmonster<br/><span style='color:gray;font-size:small'>Capmonster - zennolab.com/products/capmonster</span>",
      "xevil<br/><span style='color:gray;font-size:small'>XEvil - xevil.net</span>"
    ],
    disable_int: true,
	  value_string: "rucaptcha",
	  help: {
	    description: tr("Captcha solution service")
	  }
	})%>
	<%= _.template($('#input_constructor').html())({id:"serviceKey", description:tr("Service key"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Captcha solution service key")} }) %>
	<%= _.template($('#input_constructor').html())({id:"serverUrl", description:tr("Server URL"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Server URL"), examples:[{code:"http://127.0.0.3:8083"}]} }) %>
	<%= _.template($('#input_constructor').html())({id:"siteKey", description:tr("Site Key"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Captcha key for the specified site")} }) %>
	<%= _.template($('#input_constructor').html())({id:"siteURL", description:tr("Site URL"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Link site on which you want to solve captcha")} }) %>
	<div style="margin-left: 20px;">
		<input type="checkbox" id="AdvancedCheck" onchange="$('#Advanced').toggle()" />
		<label for="AdvancedCheck" class="tr" >Advanced settings.</label>
	</div>
	<span id="Advanced" style="display:none">
		<span id="replace">
			<%= _.template($('#input_constructor').html())({id:"replaceService", description:tr("Replace server URL"), default_selector: "string", variants: ["true","false"], disable_int:true, value_string: "false", help: {description: tr("Replace server URL")} }) %>
			<%= _.template($('#input_constructor').html())({id:"replaceTo", description:tr("Server URL replacement"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Server URL replacement"), examples:[{code:"http://127.0.0.3:8083"},{code:tr("Empty string"), description: tr("Use default server url, http://rucaptcha.com for rucaptcha, etc")}]} }) %>
		</span>
    <%= _.template($('#input_constructor').html())({id:"isInvisible", description:tr("Is Invisible Captcha"), default_selector: "string", variants: ["true","false"], disable_int:true, value_string: "false", help: {description: tr("It is the Invisible Captcha")} }) %>
		<%= _.template($('#input_constructor').html())({id:"useProxy", description:tr("Send proxy to solver service"), default_selector: "string", variants: ["true","false"], disable_int:true, value_string: "false"}) %>
		<span id="proxyOn">
			<%= _.template($('#input_constructor').html())({id:"proxy", description:tr("Proxy String"), default_selector: "string", disable_int:true, help: {description: tr("String with information about proxy. It may contain ip, port, proxy type in different formats. This string may also contain login and password, if it doesn't, auth can be set with \"Proxy Login\" and \"Proxy Password\" parameters."), examples:[{code:"210.10.10.10:1085"},{code:"username:password@210.10.10.10:1085"},{code:"socks5://210.10.10.10:1085"},{code:"socks:210.10.10.10:1085:username:password"},{code:"http:username:password:210.10.10.10:1085"},{code:"{{proxy}}", description: tr("Get from resource")},{code:tr("Empty string"),description:tr("Without proxy")}   ]}}) %>
			<%= _.template($('#input_constructor').html())({id:"proxyType", description:tr("Proxy Type"), default_selector: "string", disable_int:true, value_string: "http", variants: ["http","socks5","auto"], help: {description: tr("socks5 and http proxy types are supported."), examples:[{code:"socks"},{code:"socks5",description:tr("Same as socks")},{code:"http"},{code:"https",description:tr("Same as http")}]}}) %>
			<%= _.template($('#input_constructor').html())({id:"proxyLogin", description:tr("Proxy Login. Can be blank."), default_selector: "string", disable_int:true, help: {description: tr("Proxy login, overrides login set in proxy string. Useful if you have many proxy with same login and password.")}}) %>
			<%= _.template($('#input_constructor').html())({id:"proxyPassword", description:tr("Proxy password. Can be blank."), default_selector: "string", disable_int:true, help: {description: tr("Proxy password, overrides password set in proxy string. Useful if you have many proxy with same login and password.")}}) %>
		</span>
		<%= _.template($('#input_constructor').html())({id:"userAgent", description:"User Agent", default_selector: "string", disable_int:true, value_string: ""}) %>
    <%= _.template($('#input_constructor').html())({id:"enterprisePayload", description:"enterprise payload", default_selector: "string", disable_int:true, value_string: ""}) %>
		<%= _.template($('#input_constructor').html())({id:"delayFirstResult", description:tr("Delay before the first result (seconds)"), default_selector: "int", disable_string:true, value_number: 10, min_number:0, max_number:999999, help: {description: tr("The delay before the first result (seconds)")} }) %>
		<%= _.template($('#input_constructor').html())({id:"delayResults", description:tr("Delay between receiving results (seconds)"), default_selector: "int", disable_string:true, value_number: 5, min_number:0, max_number:999999, help: {description: tr("Delay between receiving results (seconds)")} }) %>
	</span>
	<%= _.template($('#variable_constructor').html())({id:"Save", description:tr("Result"), default_variable: "RESPONSE", help: {description: tr("Result solutions captcha")}}) %>
</div>
<div class="tooltipinternal">
	<div class="tr tooltip-paragraph-first-fold">Solve hCaptcha</div>
</div>
<%= _.template($('#back').html())({action:"executeandadd", visible:true}) %>
<%= "<s" + "cript>" %>
		
		function set_visible_proxy(){
			if($('#useProxy').val()=="false"){
				$('#proxyOn').hide();
			}else{
				$('#proxyOn').show();
			}
		};
		
		function set_visible_replaceto(){
			if($('#replaceService').val()=="false"){
				document.querySelectorAll("[data-preserve-id=replaceTo]")[0].style = "display:none";
			}else{
				document.querySelectorAll("[data-preserve-id=replaceTo]")[0].style = "display:block";
			}
		};
		
		function set_visible_server(){
			if($('#service').val()=="capmonster" || $('#service').val()=="xevil" || ["rucaptcha", "2captcha", "antigate", "anycaptcha", "captchaguru", "capcloud", "capmonster", "xevil"].indexOf($('#service').val()) < 0){
				document.querySelectorAll("[data-preserve-id=serverUrl]")[0].style = "display:block";
			}else{
				document.querySelectorAll("[data-preserve-id=serverUrl]")[0].style = "display:none";
			}
		};
		
		$(document).ready(function(){
			setTimeout(set_visible_proxy, 0)
			setTimeout(set_visible_replaceto, 0)
			setTimeout(set_visible_server, 0)
        });	
		
		
        $('#replaceService').on('focusout', function(){set_visible_replaceto()});
		
        $('#useProxy').on('focusout', function(){set_visible_proxy()});
		
		$('#service').on('focusout', function(){set_visible_server()});

<%= "</" + "script>" %>