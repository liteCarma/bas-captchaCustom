<div class="container-fluid">
	<%= _.template($('#input_constructor').html())({
	  id: "service",
	  description: tr("Service"),
	  default_selector: "string",
	  variants: [
      "rucaptcha<br/><span style='color:gray;font-size:small'>RuCaptcha - rucaptcha.com</span>",
      "2captcha<br/><span style='color:gray;font-size:small'>2Captcha - 2captcha.com</span>"
    ],
    disable_int: true,
	  value_string: "rucaptcha",
	  help: {
	    description: tr("Captcha solution service")
	  }
	})%>
	<%= _.template($('#input_constructor').html())({id:"serviceKey", description:tr("Service key"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Captcha solution service key")} }) %>
	<%= _.template($('#input_constructor').html())({id:"siteKey", description:tr("Site Key"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Captcha key for the specified site")} }) %>
	<%= _.template($('#input_constructor').html())({id:"siteURL", description:tr("Site URL"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Link site on which you want to solve captcha")} }) %>
	<%= _.template($('#input_constructor').html())({id:"iv", description: tr("iv"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("the value of parameter iv from the source code of the page"), examples:[{code:tr("CgAHbCe2GgAAAAAj")}]} }) %>
	<%= _.template($('#input_constructor').html())({id:"data", description:tr("the value of the context parameter from the source code of the page"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("the value of the context parameter from the source code of the page"), examples:[{code:'9BUgmlm48F92WUoqv97a49ZuEJJ50TCk9MVr3C7WMtQ0X6flVbufM4n8mjFLmbLVAPgaQ1Jydeaja94iA'}]} }) %>
	<div style="margin-left: 20px;">
		<input type="checkbox" id="AdvancedCheck" onchange="$('#Advanced').toggle()" />
		<label for="AdvancedCheck" class="tr" >Advanced settings.</label>
	</div>
	<span id="Advanced" style="display:none">
		<span id="replace">
			<%= _.template($('#input_constructor').html())({id:"replaceService", description:tr("Replace server URL"), default_selector: "string", variants: ["true","false"], disable_int:true, value_string: "false", help: {description: tr("Replace server URL")} }) %>
			<%= _.template($('#input_constructor').html())({id:"replaceTo", description:tr("Server URL replacement"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Server URL replacement"), examples:[{code:"http://127.0.0.3:8083"},{code:tr("Empty string"), description: tr("Use default server url, http://rucaptcha.com for rucaptcha, etc")}]} }) %>
		</span>
		<%= _.template($('#input_constructor').html())({id:"useProxy", description:tr("Send proxy to solver service"), default_selector: "string", variants: ["true","false"], disable_int:true, value_string: "false"}) %>
		<span id="proxyOn">
			<%= _.template($('#input_constructor').html())({id:"proxy", description:tr("Proxy String"), default_selector: "string", disable_int:true, help: {description: tr("String with information about proxy. It may contain ip, port, proxy type in different formats. This string may also contain login and password, if it doesn't, auth can be set with \"Proxy Login\" and \"Proxy Password\" parameters."), examples:[{code:"210.10.10.10:1085"},{code:"username:password@210.10.10.10:1085"},{code:"socks5://210.10.10.10:1085"},{code:"socks:210.10.10.10:1085:username:password"},{code:"http:username:password:210.10.10.10:1085"},{code:"{{proxy}}", description: tr("Get from resource")},{code:tr("Empty string"),description:tr("Without proxy")}   ]}}) %>
			<%= _.template($('#input_constructor').html())({id:"proxyType", description:tr("Proxy Type"), default_selector: "string", disable_int:true, value_string: "http", variants: ["http","socks5","auto"], help: {description: tr("socks5 and http proxy types are supported."), examples:[{code:"socks"},{code:"socks5",description:tr("Same as socks")},{code:"http"},{code:"https",description:tr("Same as http")}]}}) %>
			<%= _.template($('#input_constructor').html())({id:"proxyLogin", description:tr("Proxy Login. Can be blank."), default_selector: "string", disable_int:true, help: {description: tr("Proxy login, overrides login set in proxy string. Useful if you have many proxy with same login and password.")}}) %>
			<%= _.template($('#input_constructor').html())({id:"proxyPassword", description:tr("Proxy password. Can be blank."), default_selector: "string", disable_int:true, help: {description: tr("Proxy password, overrides password set in proxy string. Useful if you have many proxy with same login and password.")}}) %>
		</span>
		<%= _.template($('#input_constructor').html())({id:"userAgent", description:"User Agent", default_selector: "string", disable_int:true, value_string: ""}) %>
		<%= _.template($('#input_constructor').html())({id:"delayFirstResult", description:tr("Delay before the first result (seconds)"), default_selector: "int", disable_string:true, value_number: 10, min_number:0, max_number:999999, help: {description: tr("The delay before the first result (seconds)")} }) %>
		<%= _.template($('#input_constructor').html())({id:"delayResults", description:tr("Delay between receiving results (seconds)"), default_selector: "int", disable_string:true, value_number: 5, min_number:0, max_number:999999, help: {description: tr("Delay between receiving results (seconds)")} }) %>
	</span>
	<%= _.template($('#variable_constructor').html())({id:"Save", description:tr("Result"), default_variable: "RESPONSE", help: {description: tr("Result solutions captcha")}}) %>
</div>
<div class="tooltipinternal">
	<div class="tr tooltip-paragraph-first-fold">Solve AWSCaptcha</div>
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

		$(document).ready(function(){
			setTimeout(set_visible_proxy, 0)
			setTimeout(set_visible_replaceto, 0)
    });	

    $('#replaceService').on('focusout', function(){set_visible_replaceto()});
		$('#useProxy').on('focusout', function(){set_visible_proxy()});
<%= "</" + "script>" %>