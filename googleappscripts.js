// Конфигурация приложения
const CONFIG = {
    SPREADSHEET_ID: '1qxuDpJwBrzmWynQ4LK5ahUEUMBh9MHFaFmrIvXi8Hzc',
    SHEET_NAME: 'ArticlesTest',
    DRIVE_FOLDER_ID: '1zwJnTYiMYTFBNVmq8_6h12cxMOO2JZ4p',
    TELEGRAM_BOT_TOKEN: '7989929865:AAGJX_N-80Y4ILfTxDhgFufkp2afQPaSY8c',
    ADMIN_CHAT_ID: '-4696414312'
  };
  
function testDoPost() {
    const mockRequest = {
        postData: {
            type: 'application/json',
            contents: JSON.stringify({
                title: "Test Title",
                text: "Test Content",
                type: "Test Type"
            })
        }
    };
    const result = doPost(mockRequest); 
}

/**
 * Обработчик GET запросов (для веб-интерфейса)
 */
function doGet() { 
    testDoPost(); 
}

/**
 * Основной обработчик POST запросов
 */
function doPost(e) {
  Logger.log('Received POST request');
  Logger.log(JSON.stringify(e));
  
  try {
    let data = {};
    let fileUrl = '';

    // Обработка разных типов контента
    if (!e.postData) {
      throw new Error('No post data received');
    }

    switch(e.postData.type) {
      case 'multipart/form-data':
        data = parseMultipartFormData(e);
        if (data.file) {
          fileUrl = uploadFileToDrive(data.file);
        }
        break;
        
      case 'application/json':
        data = JSON.parse(e.postData.contents);
        break;
        
      default:
        throw new Error('Unsupported content type: ' + e.postData.type);
    }

    // Проверка обязательных полей
    const requiredFields = ['title', 'text', 'type'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error('Missing required fields: ' + missingFields.join(', '));
    }

    // Запись в таблицу
    const recordId = writeToSpreadsheet(data, fileUrl);

    // Отправка в Telegram (раскомментируйте если нужно)
    // sendTelegramNotification(data, recordId, fileUrl);

    // Успешный ответ
    const response = {
      success: true,
      id: recordId,
      fileUrl: fileUrl || null
    };

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Server error: ' + error.message);
    console.error('Server error: ' + error.message);
    
    // Ошибка
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
/**
 * Запись данных в Google Sheets
 */
function writeToSpreadsheet(data, fileUrl) {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
        .getSheetByName(CONFIG.SHEET_NAME);
    
    const recordId = Utilities.formatString('%08d', sheet.getLastRow() + 1);
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd.MM.yyyy HH:mm:ss');
    
    sheet.appendRow([
        recordId,          // ID_article
        timestamp,         // date
        data.title,        // title
        data.text,         // text
        fileUrl || '',     // image
        data.study || '',  // study
        data.type,         // type
        'На модерации'     // status
    ]);
    
    return recordId;
}

/**
 * Загрузка файла в Google Drive
 */
function uploadFileToDrive(fileData) {
    try {
        const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
        const blob = Utilities.newBlob(fileData.bytes, fileData.mimeType, fileData.filename);
        const file = folder.createFile(blob);
        
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return `https://drive.google.com/file/d/${file.getId()}/view`;
    } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        return '';
    }
}

/**
 * Отправка уведомления в Telegram
 */
function sendTelegramNotification(data, recordId, fileUrl) {
    if (!CONFIG.TELEGRAM_BOT_TOKEN || !CONFIG.ADMIN_CHAT_ID) return;

    try {
        const text = `📌 Новая статья на модерации\n\n` +
                                 `📝 *${data.title}*\n` +
                                 `🆔 ID: ${recordId}\n` +
                                 `📂 Тип: ${data.type}\n` +
                                 (fileUrl ? `📎 Файл: [Открыть](${fileUrl})\n` : '') +
                                 `\n_${data.text.substring(0, 100)}..._`;
        
        const response = UrlFetchApp.fetch(
            `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'post',
                contentType: 'application/json',
                payload: JSON.stringify({
                    chat_id: CONFIG.ADMIN_CHAT_ID,
                    text: text,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: false
                }),
                muteHttpExceptions: true
            });
        
        if (response.getResponseCode() !== 200) {
            console.error('Ошибка Telegram API:', response.getContentText());
        }
    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error);
    }
}

/**
 * Парсинг multipart/form-data
 */ 
function parseMultipartFormData(e) {
    const boundary = e.postData.boundary;
    const parts = e.postData.contents.split(boundary);
    const result = {};
    
    for (let part of parts) {
        const nameMatch = part.match(/name="([^"]+)"/);
        if (!nameMatch) continue;
        
        const name = nameMatch[1];
        const start = part.indexOf('\r\n\r\n') + 4;
        const end = part.lastIndexOf('\r\n--');
        
        if (part.includes('filename="')) {
            // Обработка файла
            result[name] = {
                filename: part.match(/filename="([^"]+)"/)[1],
                mimeType: part.match(/Content-Type:\s*([^\r\n]+)/)?.[1] || 'application/octet-stream',
                bytes: Utilities.newBlob(part.substring(start, end)).getBytes()
            };
        } else {
            // Обработка текстовых полей
            result[name] = part.substring(start, end);
        }
    }
    
    return result;
}
  
  /**
   * Создание HTTP ответа
   */
  function createResponse(data, statusCode = 200) {
    const response = ContentService.createTextOutput(JSON.stringify(data));
    response.setMimeType(ContentService.MimeType.JSON);
    
    // Установка заголовков CORS
    try {
      response.setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
    } catch (e) {
      console.log('Не удалось установить заголовки:', e);
    }
    
    return response;
  }
  
  /**
   * Обработчик OPTIONS запросов для CORS
   */
  function doOptions() {
    return createResponse({});
  }