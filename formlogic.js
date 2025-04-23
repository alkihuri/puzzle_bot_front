const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzg4tCS79XocvKulFgEhq0kjgnKec3Ho7pxe1Swm6kHNjnk5WKxcOXvCxzTfNuHKXi0/exec"; // замените на ваш URL
const form = document.getElementById("articleForm");
const messageEl = document.getElementById("message");
const loadingEl = document.querySelector(".loading");
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");

imageInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const file = document.getElementById("image").files[0];

  if (!file) {
    showMessage("Пожалуйста, выберите изображение", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function () {
    const base64Data = reader.result.split(",")[1]; 

    const payload = {
      title: document.getElementById("title").value.trim(),
      text: document.getElementById("text").value.trim(),
      type: document.getElementById("type").value,
      study: getStudyDirections(),
      image: {
        name: file.name,
        type: file.type,
        data: base64Data
      }
    };

    if (!payload.title || !payload.text || !payload.type) {
      showMessage("Пожалуйста, заполните все обязательные поля", "error");
      return;
    }

    toggleLoading(true);
    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode:"no-cors",
        body: JSON.stringify(payload)
      });

      if (window.Telegram?.WebApp) {
        Telegram.WebApp.close();
      } else {
        showMessage("Данные успешно отправлены!", "success");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      showMessage("Ошибка отправки данных", "error");
    } finally {
      toggleLoading(false);
    }
  };

  reader.readAsDataURL(file);
});

function getStudyDirections() {
  const directions = [];
  if (document.getElementById("uiuxbox").checked) directions.push("UI/UX");
  if (document.getElementById("backendbox").checked) directions.push("Backend");
  if (document.getElementById("frontendbox").checked) directions.push("Frontend");
  return directions.join(", ");
}

function showMessage(text, type = "success") {
  messageEl.className = `alert alert-${type}`;
  messageEl.textContent = text;
  messageEl.style.display = "block";
  setTimeout(() => { messageEl.style.display = "none"; }, 5000);
}

function toggleLoading(show) {
  loadingEl.style.display = show ? "block" : "none";
}

