import telebot
from telebot import types #подключаем типы (кнопки)
from flask import Flask, request
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json

app = Flask(__name__)
bot = telebot.TeleBot('6484936425:AAEvjBQfhzDXABjiKs_6m0ztpIzV1H-vUwk')
a = 0

@app.route('/button_click', methods=['POST'])
def handle_button_click():
    # Получите данные из запроса, например, текст сообщения
    a = request.form.get('message_text')

    while(True):
        bot.send_message(438516634, f'{a}')


# 438516634
# 6484936425:AAEvjBQfhzDXABjiKs_6m0ztpIzV1H-vUwk