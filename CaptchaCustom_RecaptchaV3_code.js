_call_function(CaptchaCustom_RecaptchaV3, {
	"service": (<%= service %>),
    "serviceKey": (<%= serviceKey %>),
	"serverUrl": (<%= serverUrl %>),
	"siteKey": (<%= siteKey %>),
    "siteURL": (<%= siteURL %>),
    "minScore": (<%= minScore %>),
    "pageAction": (<%= pageAction %>),
	"isEnterprise": (<%= isEnterprise %>),
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
