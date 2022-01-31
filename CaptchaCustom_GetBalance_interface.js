<div class="container-fluid">
	<%= _.template($('#input_constructor').html())({id:"service", description:tr("Service"), default_selector: "string", variants: ["rucaptcha<br/><span style='color:gray;font-size:small'>RuCaptcha - rucaptcha.com</span>","2captcha<br/><span style='color:gray;font-size:small'>2Captcha - 2captcha.com</span>","antigate<br/><span style='color:gray;font-size:small'>Anti-Captcha - anti-captcha.com</span>","captchaguru<br/><span style='color:gray;font-size:small'>Captcha.Guru - captcha.guru</span>","capcloud<br/><span style='color:gray;font-size:small'>Capmonster.Cloud - capmonster.cloud</span>","capmonster<br/><span style='color:gray;font-size:small'>Capmonster - zennolab.com/products/capmonster</span>","xevil<br/><span style='color:gray;font-size:small'>XEvil - xevil.net</span>"], disable_int:true, value_string: "rucaptcha", help: {description: tr("Captcha solution service")} }) %>
	<%= _.template($('#input_constructor').html())({id:"serviceKey", description:tr("Service key"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Captcha solution service key")} }) %>
	<%= _.template($('#input_constructor').html())({id:"serverUrl", description:tr("Server URL"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Server URL"), examples:[{code:"http://127.0.0.3:8083"}]} }) %>
	<div style="margin-left: 20px;">
		<input type="checkbox" id="AdvancedCheck" onchange="$('#Advanced').toggle()" />
		<label for="AdvancedCheck" class="tr" >Advanced settings.</label>
	</div>
	<span id="Advanced" style="display:none">
		<%= _.template($('#input_constructor').html())({id:"replaceService", description:tr("Replace server URL"), default_selector: "string", variants: ["true","false"], disable_int:true, value_string: "false", help: {description: tr("Replace server URL")} }) %>
		<%= _.template($('#input_constructor').html())({id:"replaceTo", description:tr("Server URL replacement"), default_selector: "string", disable_int:true, value_string: "", help: {description: tr("Server URL replacement"), examples:[{code:"http://127.0.0.3:8083"},{code:tr("Empty string"), description: tr("Use default server url, http://rucaptcha.com for rucaptcha, etc")}]} }) %>
	</span>
	<%= _.template($('#variable_constructor').html())({id:"Save", description:tr("Result"), default_variable: "BALANCE", help: {description: tr("Balance")}}) %>
</div>
<div class="tooltipinternal">
	<div class="tr tooltip-paragraph-first-fold">Get the balance of a captcha solution service</div>
</div>
<%= _.template($('#back').html())({action:"executeandadd", visible:true}) %>
<%= "<s" + "cript>" %>
		
		function set_visible_replaceto(){
			if($('#replaceService').val()=="false"){
				document.querySelectorAll("[data-preserve-id=replaceTo]")[0].style = "display:none";
			}else{
				document.querySelectorAll("[data-preserve-id=replaceTo]")[0].style = "display:block";
			}
		};
		
		function set_visible_server(){
			if($('#service').val()=="capmonster" || $('#service').val()=="xevil" || ["rucaptcha", "2captcha", "antigate", "captchaguru", "capcloud", "capmonster", "xevil"].indexOf($('#service').val()) < 0){
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