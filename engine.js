if (typeof got === 'undefined') {
  got = {
    options: {
      headers: {},
      redirect: true,
      attempts: 3,
      timeout: 60000,
      pause: 3000,
      notEmpty: true,
      status: [200],
      json: false,
    },
    headersStringify: function (headers, isConstructor) {
      var allHeaders = {};

      for (key in this.options.headers) {
        allHeaders[key.toLowerCase()] = this.options.headers[key];
      }

      if (typeof headers === 'string') {
        var h = {};
        headers.trim().split(/\r?\n/).forEach(function (row) {
          var p = row.split(':')
          var name = p[0].trim();
          var value = p.slice(1).join(':').trim();
          h[name] = value;
        })

        if (isConstructor) {
          delete h['content-type'];
          delete h['Content-Type'];
        }

        headers = h;
      }

      for (key in headers) {
        allHeaders[key.toLowerCase()] = headers[key];
      }

      return Object.keys(allHeaders).map(function (k) {
        var name = k[0].toUpperCase() + k.slice(1)
        return name + ':' + allHeaders[k];
      }).join('\r\n');
    },
    normalizeURL: function (url) {
      return url.replace(/https?:\/\/[^/]+$/, function(match){
        return match + '/';
      })
    },
    getValueContent: function (value) {
      if (typeof value === 'string' && value.indexOf('file://') >= 0) {
        return native("filesystem", "readfile", JSON.stringify({
          value: value.split('file://')[1],
          base64: false,
          from: 0,
          to: 0
        }))
      }
      if (typeof value === 'string' && value.indexOf('base64://') >= 0) {
        return base64_decode(value.split('base64://')[1])
      }
      return value
    },
    checkResponse: function(statusAllow, notEmpty, isJson) {
      if (notEmpty && !http_client_encoded_content("auto").trim()) {
        fail('empty response')
      }

      if (isJson) {
        try {
          JSON.parse(http_client_encoded_content("auto"))
        } catch(e){
          fail('bad json')
        }
      }
      var status = http_client_status()
      if (statusAllow.indexOf(status) < 0) {
        fail('not allowed http status ' + status)
      }
    },
    createData: function (contentType) {
      if (!contentType) {
        throw new Error('for method createData required argument "contentType"')
      }

      var isConstructor = contentType.indexOf('custom/') < 0
      var data = isConstructor ? [] : ['data'];

      Object.defineProperties(data, {
        contentType: {
          enumerable: false,
          value: contentType
        },
        isConstructor: {
          enumerable: false,
          value: isConstructor
        },
        add: {
          enumerable: false,
          value: function (name, value) {
            var contentType = contentType || 'application/octet-stream';
            if (this.isConstructor) {
              this.push(name, value);
            } else {
              if (this.length > 1) {
                fail_user('You cannot add more than 1 item to a container with the RAW content type');
              }
              this.push(name)
            }
          }
        },
        addFile: {
          enumerable: false,
          value: function (name, value) {
            if (this.isConstructor) {
              if (this.contentType === 'json') {
                this.push(name, got.getValueContent('file://' + value));
              } else {
                this.push(name, 'file://' + value);
              }
            } else {
              fail_user('Forbidden for a container with the RAW content type');
            }
          }
        },
        addBase64: {
          enumerable: false,
          value: function (name, value) {
            if (this.isConstructor) {
              if (this.contentType === 'json') {
                this.push(name, got.getValueContent('base64://' + value));
              } else {
                this.push(name, 'base64://' + value);
              }
            } else {
              fail_user('Forbidden for a container with the RAW content type');
            }
          }
        },
        toString: {
          enumerable: false,
          value: function () {
            if (this.isConstructor) {
              if (this.contentType.indexOf('json') >= 0) {
                var json = {}
                for (i = 0; i < this.length; i += 2) {
                  var name = this[i];
                  var value = this[i + 1];
                  json[name] = got.getValueContent(value);
                }
                return JSON.stringify(json)
              }

              if (this.contentType.indexOf('urlencode') >= 0) {
                var str = '';
                for (i = 0; i < this.length; i += 2) {
                  var name = this[i];
                  var value = this[i + 1];
                  if (str!== '') str += '&';
                  str += name + '=' + encodeURIComponent(got.getValueContent(value));
                }
                return str
              }

              if (this.contentType.indexOf('multipart') >= 0) {
                var str = '';
                var boundary = rand(20);
                for (i = 0; i < this.length; i += 2) {
                  var name = this[i];
                  var value = this[i + 1];
                  str += '--' + boundary + '\r\n';
                  str += 'Content-Disposition: form-data; name="' + name + '";'

                  if (typeof value === 'string' && value.indexOf('file://') >= 0) {
                    var filename = value.split(/[/\\]/).pop()
                    str += 'filename="' + filename + '"\r\nContent-Type: application/octet-stream';
                  }
                  if (typeof value === 'string' && value.indexOf('base64://') >= 0) {
                    str += 'Content-Disposition: form-data; name="' + name + '"; filename="file.jpg"\r\nContent-Type: image/jpeg';
                  }

                  str += '\r\n\r\n'
                  str += got.getValueContent(value) + '\r\n';
                }
                return str + '--' + boundary + '--';
              }
            } else {
              if (this.contentType.indexOf('json') >= 0) {
                return typeof this[1] === 'string' ? this[1] : JSON.stringify(this[1])
              } else {
                return this[1];
              }
            }
          }
        },
      })
      return data
    },
    get: function () {
      var options = got.options;
      var url = _function_argument('url');
      var method = _function_argument('method') || 'GET';
      var headers = _function_argument('headers') || {};
      var redirect = _function_argument('redirect');
      redirect = redirect != null ? redirect : options.redirect;
      var attempts = _function_argument('attempts') || options.attempts;
      var timeout = _function_argument('timeout') || options.timeout;
      var pause = _function_argument('pause') || options.pause;
      var statusAllow = _function_argument('status') || options.status;
      var notEmpty = _function_argument('notEmpty');
      notEmpty = notEmpty != null ? notEmpty : options.notEmpty;
      var json = _function_argument('json') || options.json;

      url = got.normalizeURL(url);
      headers = got.headersStringify(headers);

      VAR_LAST_ERROR = ''
      _do(function () {
          _call(function () {
            _on_fail(function () {
              VAR_LAST_ERROR = _result()
              VAR_ERROR_ID = ScriptWorker.GetCurrentAction()
              VAR_WAS_ERROR = false
              _break(1, true)
            })

            _if_else(redirect, function () {
                general_timeout_next(timeout);
                http_client_get2(url, {
                  method: method.toUpperCase(),
                  headers: headers
                })!
              }, function () {
                general_timeout_next(timeout);
                http_client_get_no_redirect2(url, {
                  method: method.toUpperCase(),
                  headers: headers
                })!
              })!

            got.checkResponse(statusAllow, notEmpty, json)
            _function_return()
          }, null)!

          _if(_iterator() >= attempts, function () {
            fail_user("got error: " + VAR_LAST_ERROR + ', url: ' + url + ', status: ' + http_client_status())
          })!

          sleep(pause)!
      })!
    },
    post: function () {
      var options = got.options;
      var url = _function_argument('url');
      var method = _function_argument('method') || 'POST';
      var encoding = _function_argument('encoding') || 'UTF-8';
      var headers = _function_argument('headers') || options.headers;
      var body = _function_argument('body') || [];
      var contentType = _function_argument('contentType') || 'urlencode';
      var redirect = _function_argument('redirect');
      redirect = redirect != null ? redirect : options.redirect;
      var attempts = _function_argument('attempts') || options.attempts;
      var timeout = _function_argument('timeout') || options.timeout;
      var pause = _function_argument('pause') || options.pause;
      var statusAllow = _function_argument('status') || options.status;
      var notEmpty = _function_argument('notEmpty');
      notEmpty = notEmpty != null ? notEmpty : options.notEmpty;
      var json = _function_argument('json') || options.json;

      var isConstructor = contentType.indexOf('custom/') < 0;
      url = got.normalizeURL(url);
      headers = got.headersStringify(headers, isConstructor);

      if (!isConstructor) {
        contentType = 'custom/' + contentType
      }

      VAR_LAST_ERROR = ''
      _do(function () {
        _if(_iterator() > attempts, function () {
            fail_user("got error: " + VAR_LAST_ERROR)
          })!

          _call(function () {
            _on_fail(function () {
              VAR_LAST_ERROR = _result()
              VAR_ERROR_ID = ScriptWorker.GetCurrentAction()
              VAR_WAS_ERROR = false
              _break(1, true)
            })

            _if_else(redirect, function () {
                general_timeout_next(timeout);
                http_client_post(url, body, {
                  'content-type': contentType,
                  encoding: encoding,
                  method: method.toUpperCase(),
                  headers: headers
                })!
              }, function () {
                general_timeout_next(timeout);
                http_client_post_no_redirect(url, body, {
                  'content-type': contentType,
                  encoding: encoding,
                  method: method.toUpperCase(),
                  headers: headers
                })!
              })!

              got.checkResponse(statusAllow, notEmpty, json)

            _function_return()
          }, null)!

          _if(_iterator() >= attempts, function () {
            fail_user("got error: " + VAR_LAST_ERROR + ', url: ' + url + ', status: ' + http_client_status())
          })!

          sleep(pause)!
      })!
    },
    switchClient: function (internalClient){
      if(internalClient) {
        _switch_http_client_internal()
      } else {
        _switch_http_client_main()
      }
    },
  }
}

function CaptchaCustomByUserTrue_ErrorHandler(error, error_text){
    if(error=="16" || error==16){error = error_text};
	var errors = {};
	var message = _CAPTCHA_SERVICE_NAME + ": " + error;
	if(_CAPTCHA_API_VERSION=="antigate"){
		errors = {"ERROR_KEY_DOES_NOT_EXIST":{"ru":"Авторизационный ключ не существует в системе или имеет неверный формат (длина не равняется 32 байтам).","en":"Account authorization key not found in the system.","action":"die","instantly":true},"ERROR_NO_SLOT_AVAILABLE":{"ru":"Нет свободных работников в данный момент, попробуйте позже либо повысьте свою максимальную ставку.","en":"No idle captcha workers are available at the moment, please try a bit later or try increasing your maximum bid.","action":"fail"},"ERROR_ZERO_CAPTCHA_FILESIZE":{"ru":"Размер капчи которую вы загружаете менее 100 байт.","en":"The size of the captcha you are uploading is less than 100 bytes.","action":"fail"},"ERROR_TOO_BIG_CAPTCHA_FILESIZE":{"ru":"Размер капчи которую вы загружаете более 500,000 байт.","en":"The size of the captcha you are uploading is more than 500,000 bytes.","action":"fail"},"ERROR_ZERO_BALANCE":{"ru":"Баланс учетной записи ниже нуля или равен нулю.","en":"Account has zeo or negative balance.","action":"die","instantly":false},"ERROR_IP_NOT_ALLOWED":{"ru":"Запрос с этого IP адреса с текущим ключом отклонен.","en":"Request with current account key is not allowed from your IP.","action":"die","instantly":false},"ERROR_CAPTCHA_UNSOLVABLE":{"ru":"5 разных работников не смогли разгадать капчу, задание остановлено.","en":"Captcha could not be solved by 5 different workers.","action":"fail"},"ERROR_BAD_DUPLICATES":{"ru":"Не хватило заданного количества дублей капчи для функции 100% распознавания.","en":"100% recognition feature did not work due to lack of amount of guess attempts.","action":"fail"},"ERROR_NO_SUCH_METHOD":{"ru":"Запрос в API выполнен на несуществующий метод.","en":"Request to API made with method which does not exist.","action":"die","instantly":true},"ERROR_IMAGE_TYPE_NOT_SUPPORTED":{"ru":"Формат капчи не распознан по EXIF заголовку либо не поддерживается. Допустимые форматы: JPG, GIF, PNG.","en":"Could not determine captcha file type by its exif header or image type is not supported. The only allowed formats are JPG, GIF, PNG.","action":"fail"},"ERROR_NO_SUCH_CAPCHA_ID":{"ru":"Капча с таким ID не была найдена в системе. Убедитесь что вы запрашиваете состояние капчи в течение 5 минут после загрузки.","en":"Captcha you are requesting does not exist in your current captchas list or has been expired. Captchas are removed from API after 5 minutes after upload.","action":"fail"},"ERROR_EMPTY_COMMENT":{"ru":"Отсутствует комментарий в параметрах рекапчи версии API 1.","en":"\"comment\" property is required for this request.","action":"die","instantly":true},"ERROR_IP_BLOCKED":{"ru":"Доступ к API с этого IP запрещен из-за большого количества ошибок.","en":"Your IP is blocked due to API inproper use.","action":"die","instantly":true},"ERROR_TASK_ABSENT":{"ru":"Отсутствует задача в методе createTask.","en":"Task property is empty or not set in createTask method. Please refer to API v2 documentation.","action":"die","instantly":true},"ERROR_TASK_NOT_SUPPORTED":{"ru":"Тип задачи не поддерживается или указан не верно.","en":"Task type is not supported or inproperly printed. Please check \"type\" parameter in task object.","action":"die","instantly":true},"ERROR_INCORRECT_SESSION_DATA":{"ru":"Неполные или некорректные данные об эмулируемом пользователе. Все требуемые поля не должны быть пустыми.","en":"Some of the required values for successive user emulation are missing.","action":"die","instantly":true},"ERROR_PROXY_CONNECT_REFUSED":{"ru":"Не удалось подключиться к прокси-серверу - отказ в подключении.","en":"Could not connect to proxy related to the task, connection refused.","action":"fail"},"ERROR_PROXY_CONNECT_TIMEOUT":{"ru":"Таймаут подключения к прокси-серверу.","en":"Could not connect to proxy related to the task, connection timeout.","action":"fail"},"ERROR_PROXY_READ_TIMEOUT":{"ru":"Таймаут операции чтения прокси-сервера.","en":"Connection to proxy for task has timed out.","action":"fail"},"ERROR_PROXY_BANNED":{"ru":"Прокси забанен на целевом сервисе капчи.","en":"Proxy IP is banned by target service.","action":"fail"},"ERROR_PROXY_TRANSPARENT":{"ru":"Ошибка проверки прокси. Прокси должен быть не прозрачным, скрывать адрес конечного пользователя. В противном случае Google будет фильтровать запросы с IP нашего сервера.","en":"Task denied at proxy checking state. Proxy must be non-transparent to hide our server IP.","action":"fail"},"ERROR_RECAPTCHA_TIMEOUT":{"ru":"Таймаут загрузки скрипта рекапчи, проблема либо в медленном прокси, либо в медленном сервере Google.","en":"Recaptcha task timeout, probably due to slow proxy server or Google server.","action":"fail"},"ERROR_RECAPTCHA_INVALID_SITEKEY":{"ru":"Ошибка получаемая от сервера рекапчи. Неверный/невалидный sitekey.","en":"Recaptcha server reported that site key is invalid.","action":"die","instantly":true},"ERROR_RECAPTCHA_INVALID_DOMAIN":{"ru":"Ошибка получаемая от сервера рекапчи. Домен не соответствует sitekey.","en":"Recaptcha server reported that domain for this site key is invalid.","action":"die","instantly":true},"ERROR_RECAPTCHA_OLD_BROWSER":{"ru":"Для задачи используется User-Agent неподдерживаемого рекапчей браузера.","en":"Recaptcha server reported that browser user-agent is not compatible with their javascript.","action":"fail"},"ERROR_TOKEN_EXPIRED":{"ru":"Провайдер капчи сообщил что дополнительный изменяющийся токен устарел. Попробуйте создать задачу еще раз с новым токеном.","en":"Captcha provider server reported that additional variable token has been expired. Please try again with new token.","action":"fail"},"ERROR_PROXY_HAS_NO_IMAGE_SUPPORT":{"ru":"Прокси не поддерживает передачу изображений с серверов Google.","en":"Proxy does not support transfer of image data from Google servers.","action":"fail"},"ERROR_PROXY_INCOMPATIBLE_HTTP_VERSION":{"ru":"Прокси не поддерживает длинные (длиной 2000 байт) GET запросы и не поддерживает SSL подключения.","en":"Proxy does not support long GET requests with length about 2000 bytes and does not support SSL connections.","action":"fail"},"ERROR_FACTORY_SERVER_API_CONNECTION_FAILED":{"ru":"Не смогли подключиться к API сервера фабрики в течени 5 секунд.","en":"Could not connect to Factory Server API within 5 seconds.","action":"fail"},"ERROR_FACTORY_SERVER_BAD_JSON":{"ru":"Неправильный JSON ответ фабрики, что-то сломалось.","en":"Incorrect Factory Server JSON response, something is broken.","action":"die","instantly":true},"ERROR_FACTORY_SERVER_ERRORID_MISSING":{"ru":"API фабрики не вернул обязательное поле errorId.","en":"Factory Server API did not send any errorId.","action":"die","instantly":true},"ERROR_FACTORY_SERVER_ERRORID_NOT_ZERO":{"ru":"Ожидали errorId = 0 в ответе API фабрики, получили другое значение.","en":"Factory Server API reported errorId != 0, check this error.","action":"die","instantly":true},"ERROR_FACTORY_MISSING_PROPERTY":{"ru":"Значения некоторых требуемых полей в запросе к фабрике отсутствуют. Клиент должен прислать все требуемы поля.","en":"Some of the required property values are missing in Factory form specifications. Customer must send all required values.","action":"die","instantly":true},"ERROR_FACTORY_PROPERTY_INCORRECT_FORMAT":{"ru":"Тип значения не соответствует ожидаемому в структуре задачи фабрики. Клиент должен прислать значение с требуемым типом.","en":"Expected other type of property value in Factory form structure. Customer must send specified value type.","action":"die","instantly":true},"ERROR_FACTORY_ACCESS_DENIED":{"ru":"Доступ к управлению фабрикой принадлежит другой учетной записи. Проверьте свой ключ доступа.","en":"Factory control belong to another account, check your account key.","action":"die","instantly":true},"ERROR_FACTORY_SERVER_OPERATION_FAILED":{"ru":"Общий код ошибки сервера фабрики.","en":"Factory Server general error code.","action":"fail"},"ERROR_FACTORY_PLATFORM_OPERATION_FAILED":{"ru":"Общий код ошибки платформы.","en":"Factory Platform general error code.","action":"fail"},"ERROR_FACTORY_PROTOCOL_BROKEN":{"ru":"Ошибка в протоколе во время выполнения задачи фабрики.","en":"Factory task lifetime protocol broken during task workflow.","action":"fail"},"ERROR_FACTORY_TASK_NOT_FOUND":{"ru":"Задача не найдена или недоступна для этой операции.","en":"Task not found or not available for this operation.","action":"fail"},"ERROR_FACTORY_IS_SANDBOXED":{"ru":"Фабрика находится в режиме песочницы, создание задач доступно только для владельца фабрики. Переведите фабрику в боевой режим, чтобы сделать ее доступной для всех клиентов.","en":"Factory is sandboxed, creating tasks is possible only by Factory owner. Switch it to production mode to make it available for other customers.","action":"fail"},"ERROR_PROXY_NOT_AUTHORISED":{"ru":"Заданы неверные логин и пароль для прокси.","en":"Proxy login and password are incorrect.","action":"fail"},"ERROR_FUNCAPTCHA_NOT_ALLOWED":{"ru":"Заказчик не включил тип задач Funcaptcha Proxyless в панели клиентов - Настройки API. Все заказчики должны прочитать условия, пройти мини тест и подписать/принять форму до того как смогут использовать данный тип задач.","en":"Customer did not enable Funcaptcha Proxyless tasks in Customers Area - API Settings. All customers must read terms, pass mini test and sign/accept the form before being able to use this feature.","action":"die","instantly":true},"ERROR_INVISIBLE_RECAPTCHA":{"ru":"Обнаружена попытка решить невидимую рекапчу в обычном режиме. В случае возникновения этой ошибки вам ничего не нужно предпринимать, наша система через некоторое время начнет решать задачи с этим ключом в невидимом режиме. Просто шлите еще задачи с тем же ключом и доменом.","en":"Recaptcha was attempted to be solved as usual one, instead of invisible mode. Basically you don't need to do anything when this error occurs, just continue sending tasks with this domain. Our system will self-learn to solve recaptchas from this sitekey in invisible mode.","action":"fail"},"ERROR_FAILED_LOADING_WIDGET":{"ru":"Не удалось загрузить виджет капчи в браузере работника. Попробуйте прислать новую задачу.","en":"Could not load captcha provider widget in worker browser. Please try sending new task.","action":"fail"}};
	};
	if(_CAPTCHA_API_VERSION=="rucaptcha"){
		errors = {"ERROR_WRONG_USER_KEY":{"ru":"Вы указали значение параметра key в неверном формате, ключ должен содержать 32 символа.","en":"You've provided key parameter value in incorrect format, it should contain 32 symbols.","action":"die","instantly":true},"ERROR_KEY_DOES_NOT_EXIST":{"ru":"Ключ, который вы указали, не существует.","en":"The key you've provided does not exists.","action":"die","instantly":true},"ERROR_ZERO_BALANCE":{"ru":"На вашем счету недостаточно средств.","en":"You don't have funds on your account.","action":"die","instantly":false},"ERROR_PAGEURL":{"ru":"Параметр pageurl не задан в запросе.","en":"pageurl parameter is missing in your request.","action":"die","instantly":true},"ERROR_NO_SLOT_AVAILABLE":{"ru":"Очередь ваших капч, которые ещё не распределены на работников, слишком длинная. Или максимальная ставка, которую вы указали в настройках аккаунта ниже текущей ставки на сервере.","en":"The queue of your captchas that are not distributed to workers is too long. Or your maximum rate that you specified in account settings is lower than current rate on the server.","action":"fail"},"ERROR_ZERO_CAPTCHA_FILESIZE":{"ru":"Размер вашего изображения менее 100 байт.","en":"Image size is less than 100 bytes.","action":"die","instantly":true},"ERROR_TOO_BIG_CAPTCHA_FILESIZE":{"ru":"Размер вашего изображения более 100 Кбайт.","en":"Image size is more than 100 kB.","action":"die","instantly":true},"ERROR_WRONG_FILE_EXTENSION":{"ru":"Файл имеет неподдерживаемое расширение. Допустимые расширения: jpg, jpeg, gif, png.","en":"Image file has unsupported extension. Accepted extensions: jpg, jpeg, gif, png.","action":"die","instantly":true},"ERROR_IMAGE_TYPE_NOT_SUPPORTED":{"ru":"Сервер не может опознать тип вашего файла.","en":"Server can't recognize image file type.","action":"fail"},"ERROR_UPLOAD":{"ru":"Сервер не может прочитать файл из вашего POST-запроса.Это происходит, если POST-запрос некорректно сформирован в части отправки файла, либо содержит невалидный base64.","en":"Server can't get file data from your POST-request.That happens if your POST-request is malformed or base64 data is not a valid base64 image.","action":"die","instantly":true},"ERROR_IP_NOT_ALLOWED":{"ru":"Запрос отправлен с IP-адреса, который не добавлен в список разрешённых вами IP-адресов.","en":"The request is sent from the IP that is not on the list of your allowed IPs.","action":"die","instantly":true},"IP_BANNED":{"ru":"Ваш IP-адрес заблокирован за чрезмерное количество попыток авторизации с неверным ключем авторизации.","en":"Your IP address is banned due to many frequent attempts to access the server using wrong authorization keys.","action":"die","instantly":true},"ERROR_BAD_TOKEN_OR_PAGEURL":{"ru":"Параметры pageurl и sitekey не заданы или имеют некорректный формат.","en":"pageurl and sitekey parameters is missing or incorrect.","action":"die","instantly":true},"ERROR_GOOGLEKEY":{"ru":"Параметр sitekey не задан или имеет некорректный формат.","en":"sitekey parameter is missing or invalid format.","action":"die","instantly":true},"ERROR_CAPTCHAIMAGE_BLOCKED":{"ru":"Вы отправили изображение, которые помечено в нашей базе данных как нераспознаваемое. Обычно это происходит, если сайт, на котором вы решаете капчу, прекратил отдавать вам капчу и вместо этого выдает изображение с информацией о блокировке.","en":"You've sent an image that is marked in our database as unrecognizable. Usually that happens if the website where you found the captcha stopped sending you captchas and started to send \"deny access\" image.","action":"die","instantly":true},"MAX_USER_TURN":{"ru":"Вы делаете больше 60 обращений к in.php в течение 3 секунд. Ваш ключ API заблокирован на 10 секунд. Блокировка будет снята автоматически.","en":"You made more than 60 requests to in.php within 3 seconds. Your account is banned for 10 seconds. Ban will be lifted automatically.","action":"die","instantly":false},"ERROR_BAD_PARAMETERS":{"ru":"Параметры для разгадывания капчи не заданы или имеют некорректный формат.","en":"Parameters for solving captcha is missing or incorrect.","action":"die","instantly":true},"ERROR_BAD_PROXY":{"ru":"Вы можете получить эту ошибку, если ваш прокси-сервер был помечен ПЛОХИМ, т.к. нам не удалось к нему подключиться.","en":"You can get this error code when sending a captcha via proxy server which is marked as BAD by our API.","action":"fail"},"CAPCHA_NOT_READY":{"ru":"Ваша капча ещё не решена.","en":"Your captcha is not solved yet.","action":"fail"},"ERROR_CAPTCHA_UNSOLVABLE":{"ru":"Мы не можем решить вашу капчу — три наших работника не смогли её решить, либо мы не получили ответ в течение 90 секунд. Мы не спишем с вас деньги за этот запрос.","en":"We are unable to solve your captcha - three of our workers were unable solve it or we didn't get an answer within 90 seconds (300 seconds for ReCaptcha V2). We will not charge you for that request.","action":"fail"},"ERROR_WRONG_ID_FORMAT":{"ru":"Вы отправили ID капчи в неправильном формате. ID состоит только из цифр.","en":"You've provided captcha ID in wrong format. The ID can contain numbers only.","action":"fail"},"ERROR_WRONG_CAPTCHA_ID":{"ru":"Вы отправили неверный ID капчи.","en":"You've provided incorrect captcha ID.","action":"fail"},"ERROR_BAD_DUPLICATES":{"ru":"Ошибка возвращается, если вы используете функцию 100% распознавания. Ошибка означает, что мы достигли максимального числа попыток, но требуемое количество совпадений достигнуто не было.","en":"Error is returned when 100% accuracy feature is enabled. The error means that max numbers of tries is reached but min number of matches not found.","action":"fail"},"REPORT_NOT_RECORDED":{"ru":"Ошибка возвращается при отправке жалобы на неверный ответ если вы уже пожаловались на большое количество верно решённых капч (более 40%). Или если прошло более 15 минут с момента отправки капчи на решение.","en":"Error is returned to your complain request if you already complained lots of correctly solved captchas (more than 40%). Or if more than 15 minutes passed after you submitted the captcha.","action":"fail"},"ERROR_IP_ADDRES":{"ru":"Ошибка возвращается при добавлении домена или IP для pingback (callback). Это происходит, если вы отправляете запрос на добавление IP или домена с IP адреса, не совпадающего с вашим IP или доменом для pingback.","en":"You can receive this error code when registering a pingback (callback) IP or domain. That happes if your request is coming from an IP address that doesn't match the IP address of your pingback IP or domain.","action":"die","instantly":true},"ERROR_TOKEN_EXPIRED":{"ru":"Вы можете получить эту ошибку, если решаете капчу GeeTest. Этот код ошибки означает, что истек срок действия значения challenge из вашего запроса.","en":"You can receive this error code when sending GeeTest. That error means that challenge value you provided is expired.","action":"fail"},"ERROR_EMPTY_ACTION":{"ru":"Параметр action не задан или имеет некорректный формат.","en":"action parameter is missing or incorrect.","action":"die","instantly":true},"ERROR_PROXY_CONNECTION_FAILED":{"ru":"Вы можете получить эту ошибку, если нам не удалось загрузить капчу через ваш прокси-сервер. Этот прокси будет помечен ПЛОХИМ и мы не будем принимать запросы с ним в течении 10 минут. А in.php будет возвращать ошибку ERROR_BAD_PROXY при использовании этого прокси.","en":"You can get this error code if we were unable to load a captcha through your proxy server. The proxy will be marked as BAD by our API and we will not accept requests with the proxy during 10 minutes. You will recieve ERROR_BAD_PROXY code from in.php API endpoint in such case.","action":"fail"}};
	};
	if(errors[error]){
		message += " - " + errors[error][_K]
		if(errors[error]["action"]=="fail"){
			fail(message);
		}else{
			die(message, errors[error]["instantly"]);
		}
	}else{
		if(error==error_text || !error_text){
			fail(message + ".");
		}else{
			fail(message + ", " + error_text + ".");
		}
	};
};
function CaptchaCustomByUserTrue_IsJsonString(str){
	if((typeof str==="string" && str.length > 0) && ((str.slice(0,1)=="[" && str.slice(-1)=="]") || (str.slice(0,1)=="{" && str.slice(-1)=="}"))){
		try{
			JSON.parse(str);
		}catch(e){
			return false;
		};
		return true;
	}else{
		return false;
	};
};
function CaptchaCustomByUserTrue_Clean(v,u){
	switch (v) {
		case 1:
			return u.slice(-1)=="/" ? u.slice(0, -1) : u;
		case 2:
			return u.replace(new RegExp('https?://'),"");
		case 3:
			return CaptchaCustomByUserTrue_Clean(2, u).replace(/^api./,"");
	};
};
function CaptchaCustomByUserTrue_SetService(){
	switch (_CAPTCHA_SERVICE) {
		case "rucaptcha":
			_CAPTCHA_SERVICE_URL = "https://rucaptcha.com";
			_CAPTCHA_SERVICE_NAME = "RuCaptcha";
			_CAPTCHA_API_VERSION = "rucaptcha";
			_CAPTCHA_SUPPORTED = ["Image","RecaptchaV2","RecaptchaV3","hCaptcha","FunCaptcha", "AWSCaptcha"];
			_CAPTCHA_SOFTID = 2098;
			_CAPTCHA_SOFTID_TITLE = "soft_id";
			break;
		case "2captcha":
			_CAPTCHA_SERVICE_URL = "https://2captcha.com";
			_CAPTCHA_SERVICE_NAME = "2Captcha";
			_CAPTCHA_API_VERSION = "rucaptcha";
			_CAPTCHA_SUPPORTED = ["Image","RecaptchaV2","RecaptchaV3","hCaptcha","FunCaptcha"];
			_CAPTCHA_SOFTID = 2098;
			_CAPTCHA_SOFTID_TITLE = "soft_id";
			break;
		case "antigate":
			_CAPTCHA_SERVICE_URL = "https://api.anti-captcha.com";
			_CAPTCHA_SERVICE_NAME = "Anti-Captcha";
			_CAPTCHA_API_VERSION = "antigate";
			_CAPTCHA_SUPPORTED = ["Image","RecaptchaV2","RecaptchaV3","hCaptcha","FunCaptcha"];
			_CAPTCHA_SOFTID = 878;
			_CAPTCHA_SOFTID_TITLE = "softId";
			break;
		case "anycaptcha":
			_CAPTCHA_SERVICE_URL = "https://api.anycaptcha.com";
			_CAPTCHA_SERVICE_NAME = "Anycaptcha";
			_CAPTCHA_API_VERSION = "antigate";
			_CAPTCHA_SUPPORTED = ["Image","RecaptchaV2","RecaptchaV3","hCaptcha","FunCaptcha"];
			_CAPTCHA_SOFTID = 6630;
			_CAPTCHA_SOFTID_TITLE = "softId";
			break;
		case "captchaguru":
			_CAPTCHA_SERVICE_URL = "https://api.captcha.guru";
			_CAPTCHA_SERVICE_NAME = "Captcha.Guru";
			_CAPTCHA_API_VERSION = "rucaptcha";
			_CAPTCHA_SUPPORTED = ["Image","RecaptchaV2","RecaptchaV3","hCaptcha"];
			_CAPTCHA_SOFTID = 100408;
			_CAPTCHA_SOFTID_TITLE = "softguru";
			break;
		case "capcloud":
			_CAPTCHA_SERVICE_URL = "https://api.capmonster.cloud";
			_CAPTCHA_SERVICE_NAME = "Capmonster.Cloud";
			_CAPTCHA_API_VERSION = "antigate";
			_CAPTCHA_SUPPORTED = ["Image","RecaptchaV2","RecaptchaV3","hCaptcha","FunCaptcha"];
			_CAPTCHA_SOFTID = "";
			_CAPTCHA_SOFTID_TITLE = "softId";
			break;
		case "capmonster":
			_CAPTCHA_SERVICE_URL = CaptchaCustomByUserTrue_Clean(1, _CAPTCHA_SERVER_URL);
			_CAPTCHA_SERVICE_NAME = "Capmonster";
			_CAPTCHA_API_VERSION = "antigate";
			_CAPTCHA_SUPPORTED = ["Image","RecaptchaV2","RecaptchaV3","FunCaptcha"];
			_CAPTCHA_SOFTID = "";
			_CAPTCHA_SOFTID_TITLE = "softId";
			break;
		case "xevil":
			_CAPTCHA_SERVICE_URL = CaptchaCustomByUserTrue_Clean(1, _CAPTCHA_SERVER_URL);
			_CAPTCHA_SERVICE_NAME = "XEvil";
			_CAPTCHA_API_VERSION = "rucaptcha";
			_CAPTCHA_SUPPORTED = ["Image","RecaptchaV2","RecaptchaV3"];
			_CAPTCHA_SOFTID = "";
			_CAPTCHA_SOFTID_TITLE = "soft_id";
			break;
		default:
			die(_K=="ru" ? ("Сервиса " + _CAPTCHA_SERVICE + " нет в списке доступных") : (_CAPTCHA_SERVICE + " service is not in the list of available"), true);
	};
	if(_CAPTCHA_REPLACE_SERVICE && _CAPTCHA_REPLACE_TO && _CAPTCHA_SERVICE!="capmonster" && _CAPTCHA_SERVICE!="xevil"){
		_CAPTCHA_SERVICE_URL = CaptchaCustomByUserTrue_Clean(1, _CAPTCHA_REPLACE_TO);
		_CAPTCHA_SERVICE_NAME = CaptchaCustomByUserTrue_Clean(3, _CAPTCHA_SERVICE_URL);
		_CAPTCHA_SUPPORTED = ["Image","RecaptchaV2","RecaptchaV3","hCaptcha","FunCaptcha"];
		_CAPTCHA_SOFTID = "";
	};
};
function CaptchaCustomByUserTrue_GetBalance(){
	_CAPTCHA_SERVICE = _function_argument("service");
	_CAPTCHA_SERVICE_KEY = _function_argument("serviceKey");
	_CAPTCHA_SERVER_URL = _function_argument("serverUrl");
	_CAPTCHA_REPLACE_SERVICE = _function_argument("replaceService").toString() === 'true';
	_CAPTCHA_REPLACE_TO = _function_argument("replaceTo");
	
	CaptchaCustomByUserTrue_SetService();
	
	_switch_http_client_internal();

	_if(_CAPTCHA_API_VERSION=="antigate",function(){
    var body = got.createData('json')
    body.add('clientKey', _CAPTCHA_SERVICE_KEY);
    _call_function(got.post, {
      url: _CAPTCHA_SERVICE_URL + "/getBalance",
      body: body,
      contentType: body.contentType,
      attempts: 10
    })!

		var resp = JSON.parse(http_client_encoded_content("auto"));
		
		if(resp["errorId"]){
			CaptchaCustomByUserTrue_ErrorHandler(resp["errorCode"], resp["errorDescription"]);
		}else{
			_CAPTCHA_BALANCE = resp["balance"];
		};
	})!
	
	_if(_CAPTCHA_API_VERSION=="rucaptcha",function(){
    _call_function(got.get, {
      url: _CAPTCHA_SERVICE_URL + "/res.php?key=" + _CAPTCHA_SERVICE_KEY + "&action=getbalance&json=1",
      attempts: 10
    })!
		
		var resp = http_client_encoded_content("auto");
			
		_if_else(CaptchaCustomByUserTrue_IsJsonString(resp), function(){
			resp = JSON.parse(resp);

			if(resp["status"]){
				_CAPTCHA_BALANCE = resp["request"];
			}else{
				CaptchaCustomByUserTrue_ErrorHandler(resp["request"], resp["error_text"]);
			};
		}, function(){
			if(resp.indexOf("OK") > -1){
				_CAPTCHA_BALANCE = resp.split("|")[1];
			}else{
				CaptchaCustomByUserTrue_ErrorHandler(resp, "");
			};
		})!
	})!
	
	_function_return(parseFloat(_CAPTCHA_BALANCE))
};
function CaptchaCustomByUserTrue_SolveCaptcha(){
	_CAPTCHA_VERSION = _function_argument("version");
	_CAPTCHA_DELAY_FIRST_RESULT = _CAPTCHA_DELAY_FIRST_RESULT*1000;
	_CAPTCHA_DELAY_RESULTS = _CAPTCHA_DELAY_RESULTS*1000;

	CaptchaCustomByUserTrue_SetService();
	
	if(_CAPTCHA_SUPPORTED.indexOf(_CAPTCHA_VERSION) < 0){
		die(_K == "ru" ? (_CAPTCHA_SERVICE_NAME + " не умеет решать " + _CAPTCHA_VERSION) : (_CAPTCHA_SERVICE_NAME + " can't solve " + _CAPTCHA_VERSION), true);
	};
	
	_switch_http_client_internal();

	if(_CAPTCHA_VERSION!="Image" && _CAPTCHA_USEPROXY){
		_CAPTCHA_PROXYHASH = proxy_parse(_CAPTCHA_PROXY);
		if(_CAPTCHA_PROXYTYPE!="auto"){
			_CAPTCHA_PROXYHASH["IsHttp"] = _CAPTCHA_PROXYTYPE=="http"
		};
		if(_CAPTCHA_PROXYLOGIN && _CAPTCHA_PROXYPASSWORD){
			_CAPTCHA_PROXYHASH["name"] = _CAPTCHA_PROXYLOGIN;
			_CAPTCHA_PROXYHASH["password"] = _CAPTCHA_PROXYPASSWORD;
		};
	};

	_if(_CAPTCHA_API_VERSION=="antigate",function(){
		var data = {"clientKey":_CAPTCHA_SERVICE_KEY};

		var task = _CAPTCHA_VERSION=="Image" ? {} : {"websiteURL":_CAPTCHA_SITE_URL};
		
		switch (_CAPTCHA_VERSION) {
			case "Image":
				task["type"] = "ImageToTextTask";
        task["languagePool"] = _CAPTCHA_LANG === 'ru' ? 'rn' : 'en'
				task["body"] = _CAPTCHA_BODY;
				break;
			case "RecaptchaV2":
				task["type"] = (_CAPTCHA_USEPROXY && _CAPTCHA_PROXYHASH["server"]) ? (_CAPTCHA_IS_ENTERPRISE ? "RecaptchaV2EnterpriseTask" : "RecaptchaV2Task") : (_CAPTCHA_IS_ENTERPRISE ? "RecaptchaV2EnterpriseTaskProxyless" : "RecaptchaV2TaskProxyless");
				task["websiteKey"] = _CAPTCHA_SITE_KEY;
				if(!_CAPTCHA_IS_ENTERPRISE && _CAPTCHA_DATA_S){
					task["recaptchaDataSValue"] = _CAPTCHA_DATA_S;
				};
				if(!_CAPTCHA_IS_ENTERPRISE && _CAPTCHA_INVISIBLE){
					task["isInvisible"] = true;
				};
				if(_CAPTCHA_COOKIES){
					task["cookies"] = _CAPTCHA_COOKIES;
				};
				break;
			case "RecaptchaV3":
				task["type"] = "RecaptchaV3TaskProxyless";
				task["websiteKey"] = _CAPTCHA_SITE_KEY;
				task["minScore"] = parseFloat(_CAPTCHA_MIN_SCORE);
				if(_CAPTCHA_ACTION){
					task["pageAction"] = _CAPTCHA_ACTION;
				};
				if(_CAPTCHA_IS_ENTERPRISE){
					task["isEnterprise"] = true;
				};
				break;
			case "hCaptcha":
				task["type"] = (_CAPTCHA_USEPROXY && _CAPTCHA_PROXYHASH["server"]) ? "HCaptchaTask" : "HCaptchaTaskProxyless";
				task["websiteKey"] = _CAPTCHA_SITE_KEY;
        if (_CAPTCHA_ENTERPRISE_PAYLOAD) {
          task["enterprisePayload"] = {
            rqdata: _CAPTCHA_ENTERPRISE_PAYLOAD,
            apiEndpoint: _CAPTCHA_DOMAIN
          }
        }
        task["isInvisible"] = true;
				break;
			case "FunCaptcha":
				task["type"] = (_CAPTCHA_USEPROXY && _CAPTCHA_PROXYHASH["server"]) ? "FunCaptchaTask" : "FunCaptchaTaskProxyless";
				task["websitePublicKey"] = _CAPTCHA_SITE_KEY;
				if(_CAPTCHA_SURL){
					task["funcaptchaApiJSSubdomain"] = CaptchaCustomByUserTrue_Clean(2, _CAPTCHA_SURL);
				};
				if(_CAPTCHA_DATA){
					if(typeof _CAPTCHA_DATA=="object"){
						_CAPTCHA_DATA = JSON.stringify(_CAPTCHA_DATA);
					};
					task["data"] = _CAPTCHA_DATA;
				};
				break;
			default:
				die(_K=="ru" ? ("Решение " + _CAPTCHA_VERSION + " не поддерживается") : (_CAPTCHA_VERSION + " solution not supported"), true);
		};
		
		if(_CAPTCHA_VERSION!="Image"){
			if(_CAPTCHA_USEPROXY && _CAPTCHA_PROXYHASH["server"]){
				task["proxyAddress"] = _CAPTCHA_PROXYHASH["server"];
				task["proxyPort"] = _CAPTCHA_PROXYHASH["Port"];
				if(_CAPTCHA_PROXYHASH["name"] && _CAPTCHA_PROXYHASH["password"]){
					task["proxyLogin"] = _CAPTCHA_PROXYHASH["name"];
					task["proxyPassword"] = _CAPTCHA_PROXYHASH["password"];
				};
				task["proxyType"] = _CAPTCHA_PROXYHASH["IsHttp"] ? "http" : "socks5";
			};
			
			if(_CAPTCHA_USERAGENT){
				task["userAgent"] = _CAPTCHA_USERAGENT;
			};
		};
		
		if(_CAPTCHA_SOFTID){
			data[_CAPTCHA_SOFTID_TITLE] = _CAPTCHA_SOFTID;
		};

		data["task"] = task;
    var body = got.createData('custom/application/json')
    body.add(JSON.stringify(data));

    _call_function(got.post, {
      url: _CAPTCHA_SERVICE_URL + "/createTask",
      body: body,
      contentType: body.contentType,
      attempts: 10
    })!

		var resp = JSON.parse(http_client_encoded_content("auto"));

		if(resp["errorId"]){
			CaptchaCustomByUserTrue_ErrorHandler(resp["errorCode"], resp["errorDescription"]);
		}else{
			_CAPTCHA_TASKID = resp["taskId"];
		};
		
		sleep(_CAPTCHA_DELAY_FIRST_RESULT)!
		
		_do(function(){
      var body = got.createData('json')
      body.add('clientKey', _CAPTCHA_SERVICE_KEY);
      body.add('taskId', _CAPTCHA_TASKID);

      _call_function(got.post, {
        url: _CAPTCHA_SERVICE_URL + "/getTaskResult",
        body: body,
        contentType: body.contentType,
        attempts: 10
      })!
			
			var resp = JSON.parse(http_client_encoded_content("auto"));
			
			if(resp["errorId"]){
				CaptchaCustomByUserTrue_ErrorHandler(resp["errorCode"], resp["errorDescription"]);
			}else{
				if(resp["status"]=="ready"){
					var result_name = _CAPTCHA_VERSION=="Image" ? "text" : _CAPTCHA_VERSION=="FunCaptcha" ? "token" : "gRecaptchaResponse";
					if(resp["solution"][result_name].indexOf("ERROR") > -1){
						CaptchaCustomByUserTrue_ErrorHandler(resp["solution"][result_name], "");
					};
					_CAPTCHA_RESPONSE = resp["solution"][result_name];
					_break("function");
				}else{
					if(resp["status"]!="processing"){
						CaptchaCustomByUserTrue_ErrorHandler(resp["errorCode"], resp["errorDescription"]);
					};
				};
			};
			
			sleep(_CAPTCHA_DELAY_RESULTS)!
		})!
	})!
	
	_if(_CAPTCHA_API_VERSION=="rucaptcha",function(){
    var body = got.createData('multipart');
    body.add('key', _CAPTCHA_SERVICE_KEY);
    body.add('json', 1);

    if (_CAPTCHA_VERSION !== "Image") {
      body.add('pageurl', _CAPTCHA_SITE_URL);
    }

		switch (_CAPTCHA_VERSION) {
			case "Image":
        body.add("method", "base64");
        body.add("language", _CAPTCHA_LANG);
				body.add("body", _CAPTCHA_BODY);
				break;
			case "RecaptchaV2":
				body.add("method", "userrecaptcha");
				body.add("googlekey", _CAPTCHA_SITE_KEY);
				if(_CAPTCHA_IS_ENTERPRISE){
					body.add("version", "enterprise");
				};
				if(!_CAPTCHA_IS_ENTERPRISE && _CAPTCHA_DATA_S){
					body.add("data-s", _CAPTCHA_DATA_S);
				};
				if(!_CAPTCHA_IS_ENTERPRISE && _CAPTCHA_INVISIBLE){
					body.add("invisible", 1);
				};

				if(_CAPTCHA_COOKIES){
					body.add("cookies", _CAPTCHA_COOKIES);
				};

        if (_CAPTCHA_IS_ENTERPRISE && _CAPTCHA_ENTERPRISE_ACTION !== '') {
          body.add("action", _CAPTCHA_ENTERPRISE_ACTION);
        }
				break;
			case "RecaptchaV3":
				body.add("method", "userrecaptcha");
				body.add("googlekey", _CAPTCHA_SITE_KEY);
				if(_CAPTCHA_IS_ENTERPRISE){
					body.add("version", "enterprise");
				}else{
					body.add("version", "v3");
				};
				body.add("min_score", _CAPTCHA_MIN_SCORE);
				if(_CAPTCHA_ACTION){
					body.add("action", _CAPTCHA_ACTION);
				};
				break;
			case "hCaptcha":
				body.add("method", "hcaptcha");
				body.add("sitekey", _CAPTCHA_SITE_KEY);
        if (_CAPTCHA_ENTERPRISE_PAYLOAD) {
          body.add("data", _CAPTCHA_ENTERPRISE_PAYLOAD);
        }

        if (_CAPTCHA_DOMAIN) {
          body.add("domain", _CAPTCHA_DOMAIN);
        }
        body.add("invisible", Number(_CAPTCHA_INVISIBLE));
				break;
			case "FunCaptcha":
				body.add("method", "funcaptcha");
				body.add("publickey", _CAPTCHA_SITE_KEY);
        body.add("action", 'get');
				if(_CAPTCHA_SURL){
					body.add("surl", _CAPTCHA_SURL);
				};
				if(_CAPTCHA_DATA){
					if(typeof _CAPTCHA_DATA!="object"){
						_CAPTCHA_DATA = JSON.parse(_CAPTCHA_DATA);
					};
					Object.keys(_CAPTCHA_DATA).forEach(function (key){
						body.add("data[" + key + "]", _CAPTCHA_DATA[key]);
					});
				};
				break;
      case "AWSCaptcha":
        body.add("method", "amazon_waf");
				body.add("sitekey", _CAPTCHA_SITE_KEY);
        body.add("action", 'get');
				body.add("iv", _CAPTCHA_IV);
        body.add("context", _CAPTCHA_DATA);
				break;
			default:
				die(_K=="ru" ? ("Решение " + _CAPTCHA_VERSION + " не поддерживается") : (_CAPTCHA_VERSION + " solution not supported"), true);
		};
		
		if(_CAPTCHA_VERSION!="Image"){
			if(_CAPTCHA_USEPROXY && _CAPTCHA_PROXYHASH["server"]){
				body.add("proxytype", _CAPTCHA_PROXYHASH["IsHttp"] ? "HTTPS" : "SOCKS5")
				if(_CAPTCHA_PROXYHASH["name"] && _CAPTCHA_PROXYHASH["password"]){
					body.add("proxy", _CAPTCHA_PROXYHASH["name"] + ":" + _CAPTCHA_PROXYHASH["password"] + "@" + _CAPTCHA_PROXYHASH["server"] + ":" + _CAPTCHA_PROXYHASH["Port"])
				}else{
					body.add("proxy", _CAPTCHA_PROXYHASH["server"] + ":" + _CAPTCHA_PROXYHASH["Port"])
				};
			};
			
			if(_CAPTCHA_USERAGENT){
				body.add("userAgent", encodeURIComponent(_CAPTCHA_USERAGENT));
			};
		};
		
		if(_CAPTCHA_SOFTID){
			body.add(_CAPTCHA_SOFTID_TITLE, _CAPTCHA_SOFTID);
		};
		
    _call_function(got.post, {
      url: _CAPTCHA_SERVICE_URL + "/in.php",
      body: body,
      contentType: body.contentType,
      attempts: 10
    })!
		
		var resp = http_client_encoded_content("auto");
			
		_if_else(CaptchaCustomByUserTrue_IsJsonString(resp), function(){
			resp = JSON.parse(resp);

			if(resp["status"]){
				_CAPTCHA_TASKID = resp["request"];
			}else{
				CaptchaCustomByUserTrue_ErrorHandler(resp["request"], resp["error_text"]);
			};
		}, function(){
			if(resp.indexOf("OK") > -1){
				_CAPTCHA_TASKID = resp.split("|")[1];
			}else{
				CaptchaCustomByUserTrue_ErrorHandler(resp, "");
			};
		})!
		
		sleep(_CAPTCHA_DELAY_FIRST_RESULT)!
		
		_do(function(){
      _call_function(got.get, {
        url: _CAPTCHA_SERVICE_URL + "/res.php?key=" + _CAPTCHA_SERVICE_KEY + "&action=get&id=" + _CAPTCHA_TASKID + "&json=1",
        attempts: 10
      })!
			
			var resp = http_client_encoded_content("auto");
			
			_if_else(CaptchaCustomByUserTrue_IsJsonString(resp), function(){
				resp = JSON.parse(resp);

				if(resp["request"].indexOf("ERROR") > -1 || resp["request"]=="IP_BANNED" || resp["request"]=="MAX_USER_TURN"){
					CaptchaCustomByUserTrue_ErrorHandler(resp["request"], resp["error_text"]);
				};

				if(resp["status"]){
					if(resp["status"]==1){
						_CAPTCHA_RESPONSE = resp["request"];
						_break("function");
					}else{
						CaptchaCustomByUserTrue_ErrorHandler(resp["request"], resp["error_text"]);
					};
				};
			}, function(){
				if(resp.indexOf("ERROR") > -1 || resp=="IP_BANNED" || resp=="MAX_USER_TURN"){
					CaptchaCustomByUserTrue_ErrorHandler(resp, "");
				};
				
				if(resp!="CAPCHA_NOT_READY"){
					if(resp.indexOf("OK") > -1){
						_CAPTCHA_RESPONSE = resp.split("|")[1];
						_break("function");
					}else{
						CaptchaCustomByUserTrue_ErrorHandler(resp, "");
					};
				};
			})!
			
			sleep(_CAPTCHA_DELAY_RESULTS)!
		})!
	})!
};
function CaptchaCustomByUserTrue_Image(){
	_CAPTCHA_SERVICE = _function_argument("service");
	_CAPTCHA_SERVICE_KEY = _function_argument("serviceKey");
	_CAPTCHA_SERVER_URL = _function_argument("serverUrl");
  _CAPTCHA_LANG = _function_argument("lang");
	_CAPTCHA_BODY = _function_argument("body");
	_CAPTCHA_REPLACE_SERVICE = _function_argument("replaceService").toString() === 'true';
	_CAPTCHA_REPLACE_TO = _function_argument("replaceTo");
	_CAPTCHA_DELAY_FIRST_RESULT = _function_argument("delayFirstResult");
	_CAPTCHA_DELAY_RESULTS = _function_argument("delayResults");
	_CAPTCHA_USEPROXY = false;

	_call_function(CaptchaCustomByUserTrue_SolveCaptcha,{"version":"Image"})!
	_result_function()

	_function_return(_CAPTCHA_RESPONSE)
};
function CaptchaCustomByUserTrue_RecaptchaV2(){
	_CAPTCHA_SERVICE = _function_argument("service");
	_CAPTCHA_SERVICE_KEY = _function_argument("serviceKey");
	_CAPTCHA_SERVER_URL = _function_argument("serverUrl");
	_CAPTCHA_SITE_URL = _function_argument("siteURL");
	_CAPTCHA_SITE_KEY = _function_argument("siteKey");
	_CAPTCHA_IS_ENTERPRISE = _function_argument("isEnterprise").toString() === 'true';
  _CAPTCHA_ENTERPRISE_ACTION = _function_argument("enterpriseAction");
	_CAPTCHA_DATA_S = _function_argument("dataS");
	_CAPTCHA_INVISIBLE = _function_argument("isInvisible").toString() === 'true';
	_CAPTCHA_COOKIES = _function_argument("cookies");
	_CAPTCHA_REPLACE_SERVICE = _function_argument("replaceService").toString() === 'true';
	_CAPTCHA_REPLACE_TO = _function_argument("replaceTo");
	_CAPTCHA_USEPROXY = _function_argument("useProxy").toString() === 'true';
	_CAPTCHA_PROXY = _function_argument("proxy");
	_CAPTCHA_PROXYTYPE = _function_argument("proxyType");
	_CAPTCHA_PROXYLOGIN = _function_argument("proxyLogin");
	_CAPTCHA_PROXYPASSWORD = _function_argument("proxyPassword");
	_CAPTCHA_USERAGENT = _function_argument("userAgent");
	_CAPTCHA_DELAY_FIRST_RESULT = _function_argument("delayFirstResult");
	_CAPTCHA_DELAY_RESULTS = _function_argument("delayResults");

	_call_function(CaptchaCustomByUserTrue_SolveCaptcha, {"version":"RecaptchaV2"})!
	_result_function()

	_function_return(_CAPTCHA_RESPONSE)
};
function CaptchaCustomByUserTrue_RecaptchaV3(){
	_CAPTCHA_SERVICE = _function_argument("service");
	_CAPTCHA_SERVICE_KEY = _function_argument("serviceKey");
	_CAPTCHA_SERVER_URL = _function_argument("serverUrl");
	_CAPTCHA_SITE_URL = _function_argument("siteURL");
	_CAPTCHA_SITE_KEY = _function_argument("siteKey");
	_CAPTCHA_ACTION = _function_argument("pageAction");
	_CAPTCHA_MIN_SCORE = _function_argument("minScore");
	_CAPTCHA_IS_ENTERPRISE = _function_argument("isEnterprise").toString() === 'true';
	_CAPTCHA_REPLACE_SERVICE = _function_argument("replaceService").toString() === 'true';
	_CAPTCHA_REPLACE_TO = _function_argument("replaceTo");
	_CAPTCHA_USEPROXY = _function_argument("useProxy").toString() === 'true';
	_CAPTCHA_PROXY = _function_argument("proxy");
	_CAPTCHA_PROXYTYPE = _function_argument("proxyType");
	_CAPTCHA_PROXYLOGIN = _function_argument("proxyLogin");
	_CAPTCHA_PROXYPASSWORD = _function_argument("proxyPassword");
	_CAPTCHA_USERAGENT = _function_argument("userAgent");
	_CAPTCHA_DELAY_FIRST_RESULT = _function_argument("delayFirstResult");
	_CAPTCHA_DELAY_RESULTS = _function_argument("delayResults");

	_call_function(CaptchaCustomByUserTrue_SolveCaptcha,{"version":"RecaptchaV3"})!
	_result_function()

	_function_return(_CAPTCHA_RESPONSE)
};
function CaptchaCustomByUserTrue_hCaptcha(){
	_CAPTCHA_SERVICE = _function_argument("service");
	_CAPTCHA_SERVICE_KEY = _function_argument("serviceKey");
	_CAPTCHA_SERVER_URL = _function_argument("serverUrl");
	_CAPTCHA_SITE_URL = _function_argument("siteURL");
	_CAPTCHA_SITE_KEY = _function_argument("siteKey");
	_CAPTCHA_REPLACE_SERVICE = _function_argument("replaceService").toString() === 'true';
	_CAPTCHA_REPLACE_TO = _function_argument("replaceTo");
  _CAPTCHA_INVISIBLE = _function_argument("isInvisible").toString() === 'true';
	_CAPTCHA_USEPROXY = _function_argument("useProxy").toString() === 'true';
	_CAPTCHA_PROXY = _function_argument("proxy");
	_CAPTCHA_PROXYTYPE = _function_argument("proxyType");
	_CAPTCHA_PROXYLOGIN = _function_argument("proxyLogin");
	_CAPTCHA_PROXYPASSWORD = _function_argument("proxyPassword");
	_CAPTCHA_USERAGENT = _function_argument("userAgent");
	_CAPTCHA_DELAY_FIRST_RESULT = _function_argument("delayFirstResult");
	_CAPTCHA_DELAY_RESULTS = _function_argument("delayResults");
  _CAPTCHA_ENTERPRISE_PAYLOAD = _function_argument("enterprisePayload");
  _CAPTCHA_DOMAIN = _function_argument("captchaDomain");
	_call_function(CaptchaCustomByUserTrue_SolveCaptcha,{"version":"hCaptcha"})!
	_result_function()

	_function_return(_CAPTCHA_RESPONSE)
};
function CaptchaCustomByUserTrue_FunCaptcha(){
	_CAPTCHA_SERVICE = _function_argument("service");
	_CAPTCHA_SERVICE_KEY = _function_argument("serviceKey");
	_CAPTCHA_SERVER_URL = _function_argument("serverUrl");
	_CAPTCHA_SITE_URL = _function_argument("siteURL");
	_CAPTCHA_SITE_KEY = _function_argument("siteKey");
	_CAPTCHA_DATA = _function_argument("data");
	_CAPTCHA_SURL = _function_argument("surl");
	_CAPTCHA_REPLACE_SERVICE = _function_argument("replaceService").toString() === 'true';
	_CAPTCHA_REPLACE_TO = _function_argument("replaceTo");
	_CAPTCHA_USEPROXY = _function_argument("useProxy").toString() === 'true';
	_CAPTCHA_PROXY = _function_argument("proxy");
	_CAPTCHA_PROXYTYPE = _function_argument("proxyType");
	_CAPTCHA_PROXYLOGIN = _function_argument("proxyLogin");
	_CAPTCHA_PROXYPASSWORD = _function_argument("proxyPassword");
	_CAPTCHA_USERAGENT = _function_argument("userAgent");
	_CAPTCHA_DELAY_FIRST_RESULT = _function_argument("delayFirstResult");
	_CAPTCHA_DELAY_RESULTS = _function_argument("delayResults");

	_call_function(CaptchaCustomByUserTrue_SolveCaptcha,{"version":"FunCaptcha"})!
	_result_function()

	_function_return(_CAPTCHA_RESPONSE)
};

function CaptchaCustomByUserTrue_AWSCaptcha(){
	_CAPTCHA_SERVICE = _function_argument("service");
	_CAPTCHA_SERVICE_KEY = _function_argument("serviceKey");
	_CAPTCHA_SITE_URL = _function_argument("siteURL");
	_CAPTCHA_SITE_KEY = _function_argument("siteKey");
	_CAPTCHA_DATA = _function_argument("data");
	_CAPTCHA_IV = _function_argument("iv");
	_CAPTCHA_REPLACE_SERVICE = _function_argument("replaceService").toString() === 'true';
	_CAPTCHA_REPLACE_TO = _function_argument("replaceTo");
	_CAPTCHA_USEPROXY = _function_argument("useProxy").toString() === 'true';
	_CAPTCHA_PROXY = _function_argument("proxy");
	_CAPTCHA_PROXYTYPE = _function_argument("proxyType");
	_CAPTCHA_PROXYLOGIN = _function_argument("proxyLogin");
	_CAPTCHA_PROXYPASSWORD = _function_argument("proxyPassword");
	_CAPTCHA_USERAGENT = _function_argument("userAgent");
	_CAPTCHA_DELAY_FIRST_RESULT = _function_argument("delayFirstResult");
	_CAPTCHA_DELAY_RESULTS = _function_argument("delayResults");

	_call_function(CaptchaCustomByUserTrue_SolveCaptcha,{"version":"AWSCaptcha"})!
	_result_function()

	_function_return(_CAPTCHA_RESPONSE)
};

function CaptchaCustomByUserTrue_ReportGood(){
	_if(_CAPTCHA_API_VERSION=="rucaptcha",function(){		
		_switch_http_client_internal();
    _call_function(got.get, {
      url: _CAPTCHA_SERVICE_URL + "/res.php?key=" + _CAPTCHA_SERVICE_KEY + "&action=reportgood&id=" + _CAPTCHA_TASKID + "&json=1",
      attempts: 10
    })!
	})!
};

function CaptchaCustomByUserTrue_ReportBad(){
	_if(_CAPTCHA_API_VERSION=="antigate",function(){
		_if(_CAPTCHA_VERSION=="RecaptchaV2" || _CAPTCHA_VERSION=="RecaptchaV3",function(){
			_switch_http_client_internal();
      var body = got.createData('json')
      body.add('clientKey', _CAPTCHA_SERVICE_KEY);
      body.add('taskId', _CAPTCHA_TASKID);

      _call_function(got.post, {
        url: _CAPTCHA_SERVICE_URL + "/reportIncorrectRecaptcha",
        body: body,
        contentType: body.contentType,
        attempts: 10
      })!
		})!

		_if(_CAPTCHA_VERSION=="Image",function(){
			_switch_http_client_internal();
      var body = got.createData('json')
      body.add('clientKey', _CAPTCHA_SERVICE_KEY);
      body.add('taskId', _CAPTCHA_TASKID);

      _call_function(got.post, {
        url: _CAPTCHA_SERVICE_URL + "/reportIncorrectImageCaptcha",
        body: body,
        contentType: body.contentType,
        attempts: 10
      })!
		})!
	})!

	_if(_CAPTCHA_API_VERSION=="rucaptcha",function(){
		_switch_http_client_internal();
    _call_function(got.get, {
      url: _CAPTCHA_SERVICE_URL + "/res.php?key=" + _CAPTCHA_SERVICE_KEY + "&action=reportbad&id=" + _CAPTCHA_TASKID + "&json=1",
      attempts: 10
    })!
	})!
};
