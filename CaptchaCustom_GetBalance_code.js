_call_function(CaptchaCustom_GetBalance, {
    "service": (<%= service %>),
    "serviceKey": (<%= serviceKey %>),
	"serverUrl": (<%= serverUrl %>),
	"replaceService": (<%= replaceService %>),
    "replaceTo": (<%= replaceTo %>)
})!
<%= variable %> = _result_function()
