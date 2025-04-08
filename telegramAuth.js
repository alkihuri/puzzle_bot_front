// URL для отправки данных
const deployUrl = 'https://script.google.com/macros/s/AKfycbwn89TGu6_jq3ca_SWpDJKPydQkq3O-lK5dWJpM4W7hgbHacbOkaya_i5XxHx8frF32/exec';

document.addEventListener('DOMContentLoaded', function() {
  const directions = [];
  const submitBtn = document.getElementById('submitBtn');
  
  // Получаем элементы кнопок
  const backendBtn = document.getElementById('backendButton');
  const frontendBtn = document.getElementById('frontendButton');
  const uiuxBtn = document.getElementById('uiuxButton');

  var buttonToDirectionMap = {
    'backend' : backendButton ,
    'frontend': frontendButton  ,
    'UI/UX': uiuxButton  
  };


  // Обработчики для кнопок направлений
  backendBtn.addEventListener('click', function() {
    toggleDirection('backend', backendBtn);
  });
  
  frontendBtn.addEventListener('click', function() {
    toggleDirection('frontend', frontendBtn);
  });
  
  uiuxBtn.addEventListener('click', function() {
    toggleDirection('UI/UX', uiuxBtn);
  });

  // Функция переключения состояния направления
  function toggleDirection(direction, button) {
    const index = directions.indexOf(direction);
    if (index > -1) {
      directions.splice(index, 1); 
      //  меняем цвет кнопки  
      button.classList.remove('direction-btn.selected');
      // меням текст кнопки
      button.textContent = direction + ' (выбрать)';
    } else {
      directions.push(direction);   
      button.classList.add('direction-btn.selected');
      // меняем текст кнопки
      button.textContent = direction + ' (выбрано)';
    }
    console.log('Выбранные направления:', directions);
    
    // Активируем кнопку отправки если есть выбранные направления
    submitBtn.disabled = directions.length === 0;
  }

  // Обработчик отправки данных
  submitBtn.addEventListener('click', async function() {
    if (directions.length === 0) return;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    
    try {
      await submitRegistration(directions);
      
      if (window.Telegram?.WebApp) {
        Telegram.WebApp.close();
      } else {
        alert('Регистрация успешно завершена!');
        // Через 2 секунды закрываем окно (для теста вне Telegram)
        setTimeout(() => window.close(), 2000);
      }
    } catch (error) {
      console.error('Ошибка при отправке:', error);
      alert('Произошла ошибка при отправке данных');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Зарегистрироваться';
    }
  });

  // Функция отправки данных
  async function submitRegistration(directions) {
    // Данные по умолчанию (для теста вне Telegram)
    let userData = {
      telegram_id: 0,
      name: 'No user',
      study: directions.join(', '),
    };

    // Если запущено в Telegram - берем реальные данные
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const tgUser = Telegram.WebApp.initDataUnsafe.user;
      userData = {
        telegram_id: tgUser.id,
        name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '),
        study: JSON.stringify(directions)
      };
    }

    // Формируем URL с параметрами
    const params = new URLSearchParams();
    for (const key in userData) {
      params.append(key, userData[key]);
    }

    const requestUrl = `${deployUrl}?${params.toString()}`;
    console.log('Отправка данных на:', requestUrl);

    // Отправляем GET-запрос
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      mode : 'no-cors'  
    }).then(async response => {
      console.log('Ответ сервера:', response);
      // удаляем все кнопки
      const buttons = document.querySelectorAll('.direction-btn');
      buttons.forEach(button => {
        button.remove();
      });

      submitBtn.remove();

      // создаем сообщение об успешной регистрации
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.textContent = 'Регистрация успешно завершена!';
      document.body.appendChild(successMessage);

      await new Promise(resolve => setTimeout(resolve, 2000)); // Ждем 2 секунды
      // закрываем окно если в Telegram
      if (window.Telegram?.WebApp) {
        Telegram.WebApp.close();
      } else {
        alert('Регистрация успешно завершена!');
        // Через 2 секунды закрываем окно (для теста вне Telegram)
        setTimeout(() => window.close(), 2000);
      }
      return response;
    });
 
  }
});