// api/roadmap-ai.js
import Groq from 'groq-sdk';

// Инициализируем Groq с АПИ-ключом из переменных окружения
const groq = new Groq({
  apiKey: process.env.ROADMAP_GROQ_API_KEY, 
});

export default async function handler(req, res) {
  // Разрешаем только POST-запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { grade, interests, targetGoal } = req.body;

    // Системный промпт, задающий жесткие правила генерации JSON
    const systemPrompt = `Ты — опытный академический консультант и ИИ-наставник для школьников. 
Твоя задача — составить персонализированный пошаговый план развития (roadmap) для ученика школы с 8 по 11 класс.

Ты ДОЛЖЕН ответить СТРОГО в формате JSON. Не пиши никакого текста, вступлений или заключений вокруг JSON-объекта. 
Структура ответа должна быть строго следующей:
{
  "advice": "Общий вдохновляющий или стратегический совет от наставника, учитывающий цели ученика.",
  "roadmap": [
    {
      "grade": "8 класс",
      "steps": [
        { "done": false, "text": "Конкретная рекомендация на этот год..." }
      ]
    },
    {
      "grade": "9 класс",
      "steps": [
        { "done": false, "text": "Конкретная рекомендация на этот год..." }
      ]
    },
    {
      "grade": "10 класс",
      "steps": [
        { "done": false, "text": "Конкретная рекомендация на этот год..." }
      ]
    },
    {
      "grade": "11 класс",
      "steps": [
        { "done": false, "text": "Конкретная рекомендация на этот год..." }
      ]
    }
  ]
}

Важные правила контента:
1. Пиши рекомендации на русском языке.
2. Шаги должны быть реалистичными и применимыми (подготовка к олимпиадам, хакатоны, волонтерство, ведение проектов, летние школы, курсы, подготовка к IELTS/SAT/ЕНТ).
3. Адаптируй фокус под интересы и целевой ВУЗ ученика. Ученику в 8 классе давай базовые советы, а в 10-11 классах — упор на портфолио, эссе и подачу документов.`;

    const userPrompt = `Составь индивидуальный трек обучения.
Данные ученика:
- Текущий класс: ${grade || '8'}
- Интересы: ${Array.isArray(interests) ? interests.join(', ') : 'Не указаны'}
- Цель поступления / Целевой ВУЗ: ${targetGoal || 'Поступление в ведущий университет'}

Сделай план интересным и интерактивным!`;

    // Вызываем Groq Cloud API
    const chatCompletion = await groq.chat.completions.create({
      // Используем самую умную и сбалансированную модель в Groq (Llama 3 70B)
      model: 'llama3-70b-8192', 
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      // Заставляем Groq отвечать только валидным JSON-объектом
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 2048,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    
    // Парсим результат от Groq и возвращаем на фронтенд
    const parsedData = JSON.parse(responseContent);
    return res.status(200).json(parsedData);

  } catch (error) {
    console.error('Ошибка на бэкенде Groq Roadmap:', error);
    return res.status(500).json({ error: 'Не удалось сгенерировать роадмап через Groq' });
  }
}