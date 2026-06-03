# НейроХАБ

Статический `file://` режим теперь поддерживает локальные mock-ответы для теста интерфейса. Чтобы использовать настоящий OpenAI API, запускай локальный сервер с `OPENAI_API_KEY`.

## Запуск

Тестовый режим без API:

```powershell
node server.js
```

Настоящий OpenAI API:

```powershell
$env:OPENAI_API_KEY="your_api_key_here"
node server.js
```

Открой:

```text
http://localhost:4173
```

По умолчанию кнопка `Chat GPT` использует модель `gpt-5.2`. Можно переопределить:

```powershell
$env:OPENAI_MODEL="gpt-5.2"
```

`Gemini` пока оставлена в интерфейсе как вариант модели, но API-подключение сейчас настроено для `Chat GPT`.

Принудительный mock-режим даже при наличии ключа:

```powershell
$env:LOCAL_MOCK="true"
node server.js
```
