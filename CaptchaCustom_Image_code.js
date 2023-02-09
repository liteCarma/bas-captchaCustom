_call_function(CaptchaCustom_Image, {
    "service": (<%= service %>),
    "serviceKey": (<%= serviceKey %>),
    "serverUrl": (<%= serverUrl %>),
    "lang": (<%= lang %>),
    "body": (<%= body %>),
    "replaceService": (<%= replaceService %>),
    "replaceTo": (<%= replaceTo %>),
    "delayFirstResult": (<%= delayFirstResult %>),
    "delayResults": (<%= delayResults %>)
  })!
  <%= variable %> = _result_function()
