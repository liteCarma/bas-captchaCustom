var service = GetInputConstructorValue("service", loader);
if (service["original"].length == 0) {
  Invalid(tr("Service") + " " + tr("is empty"));
  return;
};
var serviceKey = GetInputConstructorValue("serviceKey", loader);
var serverUrl = GetInputConstructorValue("serverUrl", loader);
var lang = GetInputConstructorValue("lang", loader);
var replaceService = GetInputConstructorValue("replaceService", loader);
if (replaceService["original"].length == 0) {
  Invalid(tr("Replace Service") + " " + tr("is empty"));
  return;
};
var replaceTo = GetInputConstructorValue("replaceTo", loader);
var body = GetInputConstructorValue("body", loader);
if (body["original"].length == 0) {
  Invalid(tr("Captcha picture data") + " " + tr("is empty"));
  return;
};
var delayFirstResult = GetInputConstructorValue("delayFirstResult", loader);
if (delayFirstResult["original"].length == 0) {
  Invalid(tr("Delay before the first result") + " " + tr("is empty"));
  return;
};
var delayResults = GetInputConstructorValue("delayResults", loader);
if (delayResults["original"].length == 0) {
  Invalid(tr("Delay between receiving results") + " " + tr("is empty"));
  return;
};
var Save = this.$el.find("#Save").val().toUpperCase();
try {
  var code = loader.GetAdditionalData() + _.template($("#CaptchaCustomByUserTrue_Image_code").html())({
    "service": service["updated"],
    "serviceKey": serviceKey["updated"],
    "serverUrl": serverUrl["updated"],
    "lang": lang["updated"],
    "body": body["updated"],
    "replaceService": replaceService["updated"],
    "replaceTo": replaceTo["updated"],
    "delayFirstResult": delayFirstResult["updated"],
    "delayResults": delayResults["updated"],
    "variable": "VAR_" + Save
  });
  code = Normalize(code, 0);
  BrowserAutomationStudio_Append("", BrowserAutomationStudio_SaveControls() + code, action, DisableIfAdd);
} catch (e) {}
