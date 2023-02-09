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
  <%= _.template($('#input_constructor').html())({id:"serverUrl", description:tr("Server URL"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Server URL"), examples:[{code:"http://127.0.0.3:8083"}]} }) %>
	<%= _.template($('#input_constructor').html())({id:"serviceKey", description:tr("Service key"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Captcha solution service key")} }) %>
	<%= _.template($('#input_constructor').html())({id:"body", description:tr("Captcha picture data encoded in base64"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Data in base64 format can be obtained from screenshot action or from read file action.")} }) %>
	<div style="margin-left: 20px;">
		<input type="checkbox" id="AdvancedCheck" onchange="$('#Advanced').toggle()" />
		<label for="AdvancedCheck" class="tr" >Advanced settings.</label>
	</div>
	<span id="Advanced" style="display:none">
		<span id="replace">
			<%= _.template($('#input_constructor').html())({id:"replaceService", description:tr("Replace server URL"), default_selector: "string", variants: ["true","false"], disable_int:true, value_string: "false", help: {description: tr("Replace server URL")} }) %>
			<%= _.template($('#input_constructor').html())({id:"replaceTo", description:tr("Server URL replacement"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Server URL replacement"), examples:[{code:"http://127.0.0.3:8083"},{code:tr("Empty string"), description: tr("Use default server url, http://rucaptcha.com for rucaptcha, etc")}]} }) %>
		</span>
		<%= _.template($('#input_constructor').html())({id:"delayFirstResult", description:tr("Delay before the first result (seconds)"), default_selector: "int", disable_string:true, value_number: 2, min_number:0, max_number:999999, help: {description: tr("The delay before the first result (seconds)")} }) %>
		<%= _.template($('#input_constructor').html())({id:"delayResults", description:tr("Delay between receiving results (seconds)"), default_selector: "int", disable_string:true, value_number: 2, min_number:0, max_number:999999, help: {description: tr("Delay between receiving results (seconds)")} }) %>
    <%= _.template($('#input_constructor').html())({id:"lang", description:tr("Captcha language"), default_selector: "string", variants: [
      "ru",
      "en"
    ], disable_int:true, value_string: "en", help: {description: tr("Captcha language")} }) %>
	</span>
	<%= _.template($('#variable_constructor').html())({id:"Save", description:tr("Result"), default_variable: "RESPONSE", help: {description: tr("Result solutions captcha")}}) %>
</div>
<div class="tooltipinternal">
	<div class="tr tooltip-paragraph-first-fold">This action solves image captcha(not recaptcha) and works only if you have image data formatted as base64 string.</div>
	<div class="tr tooltip-paragraph-fold">Captcha text is saved to variable and can be used later.</div>
	<div class="tr tooltip-paragraph-fold">If you want to take captcha from element on screen, you should click on it and use "Solve Captcha" action.</div>
</div>
<%= _.template($('#back').html())({action:"executeandadd", visible:true}) %>
<%= "<s" + "cript>" %>
		
		function set_visible_replaceto(){
			if($('#replaceService').val()=="false"){
				document.querySelectorAll("[data-preserve-id=replaceTo]")[0].style = "display:none"
			}else{
				document.querySelectorAll("[data-preserve-id=replaceTo]")[0].style = "display:block"
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
			setTimeout(set_visible_replaceto, 0)
			setTimeout(set_visible_server, 0)
        });	
		
		
        $('#replaceService').on('focusout', function(){set_visible_replaceto()});
		
		$('#service').on('focusout', function(){set_visible_server()});

<%= "</" + "script>" %>