var service = GetInputConstructorValue("service", loader);
if(service["original"].length == 0){
    Invalid(tr("Service") + " " + tr("is empty"));
    return;
};
var serviceKey = GetInputConstructorValue("serviceKey", loader);
var serverUrl = GetInputConstructorValue("serverUrl", loader);
var replaceService = GetInputConstructorValue("replaceService", loader);
if(replaceService["original"].length == 0){
    Invalid(tr("Replace Service") + " " + tr("is empty"));
    return;
};
var replaceTo = GetInputConstructorValue("replaceTo", loader);
var siteKey = GetInputConstructorValue("siteKey", loader);
if(siteKey["original"].length == 0){
    Invalid(tr("Site Key") + " " + tr("is empty"));
    return;
};
var siteURL = GetInputConstructorValue("siteURL", loader);
if(siteURL["original"].length == 0){
    Invalid(tr("Site URL") + " " + tr("is empty"));
    return;
};
var useProxy = GetInputConstructorValue("useProxy", loader);
var proxyType = GetInputConstructorValue("proxyType", loader);
var proxy = GetInputConstructorValue("proxy", loader);
var proxyLogin = GetInputConstructorValue("proxyLogin", loader);
var proxyPassword = GetInputConstructorValue("proxyPassword", loader);
var userAgent = GetInputConstructorValue("userAgent", loader);
var delayFirstResult = GetInputConstructorValue("delayFirstResult", loader);
if(delayFirstResult["original"].length == 0){
    Invalid(tr("Delay before the first result") + " " + tr("is empty"));
    return;
};
var delayResults = GetInputConstructorValue("delayResults", loader);
if(delayResults["original"].length == 0){
    Invalid(tr("Delay between receiving results") + " " + tr("is empty"));
    return;
};
var Save = this.$el.find("#Save").val().toUpperCase();
try{
    var code = loader.GetAdditionalData() + _.template($("#CaptchaCustom_hCaptcha_code").html())({
        "service": service["updated"],
        "serviceKey": serviceKey["updated"],
		"serverUrl": serverUrl["updated"],
		"siteKey": siteKey["updated"],
        "siteURL": siteURL["updated"],
		"replaceService": replaceService["updated"],
        "replaceTo": replaceTo["updated"],
        "useProxy": useProxy["updated"],
        "proxy": proxy["updated"],
        "proxyType": proxyType["updated"],
        "proxyLogin": proxyLogin["updated"],
        "proxyPassword": proxyPassword["updated"],
        "userAgent": userAgent["updated"],
		"delayFirstResult": delayFirstResult["updated"],
        "delayResults": delayResults["updated"],
        "variable": "VAR_" + Save
    });
    code = Normalize(code, 0);
    BrowserAutomationStudio_Append("", BrowserAutomationStudio_SaveControls() + code, action, DisableIfAdd);
}catch (e){}
