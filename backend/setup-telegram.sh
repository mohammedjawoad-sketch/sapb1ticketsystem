#!/bin/bash

echo "🤖 Telegram Bot Setup"
echo "===================="
echo ""
echo "1. Open Telegram and search for: @BotFather"
echo "2. Send: /newbot"
echo "3. Name: SAP B1 Support Bot"
echo "4. Username: sapb1support_bot"
echo "5. Copy the TOKEN"
echo ""
read -p "Enter your Bot Token: " BOT_TOKEN
echo ""
echo "6. Search for: @userinfobot"
echo "7. Send any message"
echo "8. Copy your Chat ID"
echo ""
read -p "Enter your Chat ID: " CHAT_ID
echo ""

# Update .env
cd /var/www/sapb1ticket-project/backend
sed -i "s/TELEGRAM_BOT_TOKEN=.*/TELEGRAM_BOT_TOKEN=$BOT_TOKEN/" .env
sed -i "s/TELEGRAM_CHAT_ID=.*/TELEGRAM_CHAT_ID=$CHAT_ID/" .env

echo "✅ Telegram configured!"
echo ""
echo "Now restart the backend server"
