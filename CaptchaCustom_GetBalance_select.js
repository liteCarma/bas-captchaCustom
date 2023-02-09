var service = GetInputConstructorValue("service", loader);
if (service["original"].length == 0) {
    Invalid(tr("Service") + " " + tr("is empty"));
    return;
};
var serviceKey = GetInputConstructorValue("serviceKey", loader);
var serverUrl = GetInputConstructorValue("serverUrl", loader);
if (serviceKey["original"].length == 0) {
    Invalid(tr("Service key") + " " + tr("is empty"));
    return;
};
var replaceService = GetInputConstructorValue("replaceService", loader);
if (replaceService["original"].length == 0) {
    Invalid(tr("Replace Service") + " " + tr("is empty"));
    return;
};
var replaceTo = GetInputConstructorValue("replaceTo", loader);
var Save = this.$el.find("#Save").val().toUpperCase();
try {
    var code = loader.GetAdditionalData() + _.template($("#CaptchaCustom_GetBalance_code").html())({
        "service": service["updated"],
        "serviceKey": serviceKey["updated"],
		"serverUrl": serverUrl["updated"],
		"replaceService": replaceService["updated"],
        "replaceTo": replaceTo["updated"],
        "variable": "VAR_" + Save
    });
    code = Normalize(code, 0);
    BrowserAutomationStudio_Append("", BrowserAutomationStudio_SaveControls() + code, action, DisableIfAdd);
} catch (e) {}
