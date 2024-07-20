const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = 3000;
const TELEGRAM_BOT_TOKEN = '6484936425:AAEvjBQfhzDXABjiKs_6m0ztpIzV1H-vUwk';
const CHAT_ID = '438516634';

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Telegram Bot Notification</title>
    </head>
    <body>
        <input type="text" id="messageInput" placeholder="Enter your message here">
        <button id="notifyButton">Send Notification</button>

        <script>
            document.getElementById('notifyButton').addEventListener('click', function() {
                const message = document.getElementById('messageInput').value;
                fetch('/send_notification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: message })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            });
        </script>
    </body>
    </html>
    `);
});

app.post('/send_notification', async (req, res) => {
    const { message } = req.body;
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
            }),
        });

        const data = await response.json();
        if (data.ok) {
            res.json({ status: 'success', message: 'Notification sent!' });
        } else {
            res.status(500).json({ status: 'error', message: data.description });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
