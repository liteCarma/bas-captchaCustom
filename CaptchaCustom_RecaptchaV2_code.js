_call_function(CaptchaCustom_RecaptchaV2, {
	"service": (<%= service %>),
    "serviceKey": (<%= serviceKey %>),
	"serverUrl": (<%= serverUrl %>),
    "siteKey": (<%= siteKey %>),
    "siteURL": (<%= siteURL %>),
	"isEnterprise": (<%= isEnterprise %>),
	"isInvisible": (<%= isInvisible %>),
	"dataS": (<%= data_s %>),
	"cookies": (<%= cookies %>),
    "replaceService": (<%= replaceService %>),
    "replaceTo": (<%= replaceTo %>),
    "useProxy": (<%= useProxy %>),
    "proxy": (<%= proxy %>),
    "proxyType": (<%= proxyType %>),
    "proxyLogin": (<%= proxyLogin %>),
    "proxyPassword": (<%= proxyPassword %>),
    "userAgent": (<%= userAgent %>),
	"delayFirstResult": (<%= delayFirstResult %>),
    "delayResults": (<%= delayResults %>)
})!
<%= variable %> = _result_function()