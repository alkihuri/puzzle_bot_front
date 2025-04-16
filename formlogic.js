
// URL вашего веб-приложения Google Apps Scriptconst 
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw__K5Slzx48Dtz6dDDPFNtTI6mDGD6rtIXzkvANmUHziJZ2pxBu3Ii4UkZURcPH3L8/exec'; // Замените на ваш URL скрипта
const form = document.getElementById('articleForm');
const messageEl = document.getElementById('message');
const loadingEl = document.querySelector('.loading');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');

// Предпросмотр изображения
imageInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.src = e.target.result;
      imagePreview.style.display = 'block';
    }
    reader.readAsDataURL(file);
  }
});

// Отправка формы
form.addEventListener('submit', async function (e) {
  e.preventDefault();

   


  var directions = [];

  // Получаем выбранные направления 

  if(document.getElementById("uiuxbox").checked) 
  {
    directions.push('UI/UX');
  }
  if(document.getElementById("backendbox").checked) 
  {
    directions.push('backend'); 
  }
  if(document.getElementById("frontendbox").checked)
  {
    directions.push('frontend');
  }

  console.log('Выбранные направления:', directions.join(', '));  


    // Данные по умолчанию (для теста вне Telegram)
    let userData = {
      telegram_id: 123,
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

  const formData = {
    title: document.getElementById('title').value.trim(),
    text: document.getElementById('text').value.trim(),
    study:  directions.join(', '),
    type: document.getElementById('type').value 
  };

   


  console.log('Отправка данных  :', formData);
  // Валидация
  if (!formData.title || !formData.text || !formData.type) {
    showMessage('Пожалуйста, заполните все обязательные поля', 'error');
    return;
  }

  toggleLoading(true);

  try {

    await submitRegularForm(formData);

  }
  catch (error) {
    console.error('Error:', error);
    showMessage(`Ошибка: ${error.message}`, 'error');
  } finally {
    toggleLoading(false);
  }
});

// Стандартная отправка формы
async function submitRegularForm(formData) {



  console.log('Отправка данных:', JSON.stringify(formData));

  try {

    // Отправка данных на сервер
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Allow': '*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify(formData),
      mode: 'no-cors'
    }).then(async response => {

      // если телеграмм то закрываем 
      if (window.Telegram && Telegram.WebApp) {
        const tg = Telegram.WebApp;
        tg.close();
      } else {
        // Если не в Telegram, просто показываем сообщение
        showMessage('Данные успешно отправлены!', 'success');
      }

    });


  } catch (error) {
    console.error('Ошибка отправки:', error);
    showMessage(`Ошибка отправки: ${error.message}`, 'error');
  }
}

function showMessage(text, type = 'success') {
  messageEl.className = `alert alert-${type}`;
  messageEl.textContent = text;
  messageEl.style.display = 'block';

  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 5000);
}

function toggleLoading(show) {
  loadingEl.style.display = show ? 'block' : 'none';
}
