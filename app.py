#!/usr/bin/env python3

import os
import logging
import i18n
import telegram.ext


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def start_command(update, context):
    update.message.reply_text(_('Start!'))


def help_command(update, context):
    update.message.reply_text(_('Help!'))


def reply_message(update, context):
    update.message.reply_text(update.message.text)


def main():
    logger.info('starting telegram-good-timing-bot app...')

    updater = telegram.ext.Updater(os.environ.get('BOT_TOKEN'))

    updater.dispatcher.add_handler(telegram.ext.CommandHandler("start", start_command))
    updater.dispatcher.add_handler(telegram.ext.CommandHandler("help", help_command))

    updater.dispatcher.add_handler(telegram.ext.MessageHandler(telegram.ext.Filters.text & ~telegram.ext.Filters.command, reply_message))

    updater.start_polling()

    updater.idle()


if __name__ == '__main__':
    main()
