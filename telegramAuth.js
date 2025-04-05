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
    const url =  PROD_SCRIPT_URL ; // Замените на ваш URL
    const params = {
      method: 'GET',
      contentType: 'application/json',
      payload: JSON.stringify(data)
    };

    fetch(url, params)
      .then(response => response.json())
      .then(result => {
        console.log('Данные успешно отправлены:', result);
      })
      .catch(error => {
        console.error('Ошибка при отправке данных:', error);
      });

  }