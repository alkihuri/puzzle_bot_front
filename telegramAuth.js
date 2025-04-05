
var deployUrl = 'https://script.google.com/macros/s/AKfycbxhkiChVfuaBiL4A2hcb-4787C9k3YnFj5W99998lMfhQiNEJtMefjtUb5ftHopU6EL/exec';



document.addEventListener('DOMContentLoaded', function() {
    // Данные по умолчанию (для теста вне Telegram)
    let userData = {
      telegram_id: 'test_user',
      name: 'Test User',
      study: 'Test Study'
    };

    // Если запущено в Telegram - берем реальные данные
    if (window.Telegram && Telegram.WebApp) {
      const tg = Telegram.WebApp;
      const tgUser = tg.initDataUnsafe.user;
      
      if (tgUser) {
        userData = {
          telegram_id: tgUser.id,
          name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '),
          study: 'Telegram User'
        };
      }
    } 

    // Отправляем данные на сервер
    sendDataToServer(userData);
  });

  function sendDataToServer(data) {

    // достаем данные с файла confgi.js 
    const url = deployUrl ; // Замените на ваш URL скрипта
    // гет запрос
    const params = new URLSearchParams(data);
    const requestUrl = `${url}?${params.toString()}`;
    console.log('Отправка данных на сервер:', requestUrl);
  }