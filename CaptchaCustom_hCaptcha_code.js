_call_function(CaptchaCustom_hCaptcha, {
	"service": (<%= service %>),
    "serviceKey": (<%= serviceKey %>),
	"serverUrl": (<%= serverUrl %>),
	"siteKey": (<%= siteKey %>),
    "siteURL": (<%= siteURL %>),
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
