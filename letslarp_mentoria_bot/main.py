#!/usr/bin/env python3
"""
Mentoria Hub Telegram Bot
- Приветствует пользователей
- Отправляет напоминания о дедлайнах
- Уведомляет о новых возможностях
"""

import os
import logging
from datetime import datetime
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

# Загружаем переменные окружения
load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

# Логирование
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /start — приветствие"""
    user = update.effective_user
    welcome_text = f"""
👋 Привет, {user.first_name}!

Я — Mentoria Hub бот. Вот что я умею:

📬 **Напоминания о дедлайнах** — я буду уведомлять тебя о близких дедлайнах олимпиад и конкурсов
📚 **Рекомендации курсов** — подскажу какие курсы подходят именно тебе
🎯 **Новые возможности** — не пропустишь ни одну интересную олимпиаду

Чтобы подписаться на уведомления, используй /subscribe
Чтобы отписаться, используй /unsubscribe

Заходи на платформу: https://mentoria-hub.vercel.app/
    """
    await update.message.reply_text(welcome_text, parse_mode='Markdown')


async def subscribe(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /subscribe — подписка на уведомления"""
    user_id = update.effective_user.id
    # TODO: Сохранить user_id в Supabase таблицу telegram_subscribers
    await update.message.reply_text(
        "✅ Ты подписан на уведомления Mentoria Hub!\n\n"
        "Теперь будешь получать:\n"
        "• Напоминания за 3 дня до дедлайна\n"
        "• Новые олимпиады и конкурсы\n"
        "• Советы по подготовке"
    )
    logger.info(f'User {user_id} subscribed')


async def unsubscribe(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /unsubscribe — отписка от уведомлений"""
    user_id = update.effective_user.id
    # TODO: Удалить user_id из таблицы telegram_subscribers в Supabase
    await update.message.reply_text(
        "❌ Ты отписан от уведомлений.\n\n"
        "Если передумаешь — напиши /subscribe"
    )
    logger.info(f'User {user_id} unsubscribed')


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Команда /help — справка"""
    help_text = """
/start — приветствие и инструкция
/subscribe — подписаться на уведомления
/unsubscribe — отписаться
/help — эта справка

Вопросы? Напиши в Mentoria Hub чат-ассистенту 🤖
    """
    await update.message.reply_text(help_text)


async def send_deadline_notification(context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Периодическое задание — отправляет напоминания о дедлайнах
    
    TODO: Реализовать:
    1. Получить список всех подписчиков из Supabase (telegram_subscribers)
    2. Для каждого подписчика получить его сохранённые возможности
    3. Проверить какие из них близятся к дедлайну (за 3 дня)
    4. Отправить напоминание в Telegram
    """
    # Заглушка:
    logger.info('Проверка дедлайнов (TODO: реализовать)')


def main() -> None:
    """Главная функция — запуск бота"""
    if not TELEGRAM_BOT_TOKEN:
        raise ValueError('TELEGRAM_BOT_TOKEN не установлен в .env')

    # Создаём приложение
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Регистрируем обработчики команд
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CommandHandler('subscribe', subscribe))
    application.add_handler(CommandHandler('unsubscribe', unsubscribe))
    application.add_handler(CommandHandler('help', help_command))

    # TODO: Добавить периодическое задание для отправки напоминаний
    # job_queue = application.job_queue
    # job_queue.run_repeating(send_deadline_notification, interval=3600)  # каждый час

    logger.info('🤖 Mentoria Hub бот запущен')
    
    # Запускаем бота
    application.run_polling()


if __name__ == '__main__':
    main()
