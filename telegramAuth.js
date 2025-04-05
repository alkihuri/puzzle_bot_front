
var deployUrl = 'https://script.google.com/macros/s/AKfycbwxR0x16wF50Paj1u3OYqWtWBOaymAVLj5lz6N7kStGmB5qf8t2C16uYCdUEiehMTCy/exec';



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

  async function sendDataToServer(data) {

    // достаем данные с файла confgi.js 
    const url = deployUrl ; // Замените на ваш URL скрипта
    // гет запрос
    const params = new URLSearchParams(data);
    const requestUrl = `${url}?${params.toString()}`;
    console.log('Отправка данных на сервер:', requestUrl);  
    // Отправляем данные на сервер  no cors 
    var resp = await fetch(requestUrl, {
      method: 'GET',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      }
    }) 
    .then(async response => { 
      console.log('Ответ сервера:', response);  
      // close if telegram
      if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.close();
      }
      else 
      {
        // написать на экране вы успешно отправили данные
        alert('Вы успешно отправили данные');
        await new Promise(resolve => setTimeout(resolve, 2000)).then(() => {window.close();});  
      }
    })
  }