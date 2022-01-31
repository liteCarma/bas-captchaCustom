_call_function(CaptchaCustom_FunCaptcha, {
    "service": (<%= service %>),
    "serviceKey": (<%= serviceKey %>),
	"serverUrl": (<%= serverUrl %>),
    "siteKey": (<%= siteKey %>),
    "siteURL": (<%= siteURL %>),
    "surl": (<%= surl %>),
	"data": (<%= data %>),
    "nojs": (<%= nojs %>),
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
