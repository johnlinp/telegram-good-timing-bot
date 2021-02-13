#!/usr/bin/env python3

import os
import logging
import telegram.ext

import goodtiming


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bot = goodtiming.Bot(os.environ.get('LANGUAGE'))


def start_command(update, context):
    update.message.reply_text(bot.start(str(update.effective_chat.id)))


def help_command(update, context):
    update.message.reply_text(bot.help())


def reply_message(update, context):
    update.message.reply_text(bot.chat(update.message.text, str(update.effective_chat.id)))


def main():
    logger.info('starting telegram-good-timing-bot app...')

    updater = telegram.ext.Updater(os.environ.get('BOT_TOKEN'))

    updater.dispatcher.add_handler(telegram.ext.CommandHandler("start", start_command))
    updater.dispatcher.add_handler(telegram.ext.CommandHandler("help", help_command))

    updater.dispatcher.add_handler(telegram.ext.MessageHandler(telegram.ext.Filters.text & ~telegram.ext.Filters.command, reply_message))

    updater.start_webhook(listen='0.0.0.0',
            port=os.environ.get('PORT', 8443),
            url_path=os.environ.get('BOT_TOKEN'))
    updater.bot.set_webhook('{}{}'.format(os.environ.get('WEBHOOK_BASE_URL'), os.environ.get('BOT_TOKEN')))

    updater.idle()


if __name__ == '__main__':
    main()
