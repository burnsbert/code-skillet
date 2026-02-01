#!/bin/bash

# Code-Skillet launcher script
# Starts the dev server if not running, then opens the browser

cd "$(dirname "$0")"

UI_PORT=5173
SERVER_PORT=3002
URL="http://localhost:$UI_PORT"

# Check if UI server is already running
if lsof -i :$UI_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "Server already running on port $UI_PORT"
else
    echo "Starting Code-Skillet server..."
    npm run dev &

    # Wait for the UI server to be ready (up to 30 seconds)
    echo -n "Waiting for server"
    for i in {1..30}; do
        if lsof -i :$UI_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo " ready!"
            break
        fi
        echo -n "."
        sleep 1
    done

    # Final check
    if ! lsof -i :$UI_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo " failed to start!"
        exit 1
    fi
fi

# Open browser
echo "Opening $URL"
open "$URL"
