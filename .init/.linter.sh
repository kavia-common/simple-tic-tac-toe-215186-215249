#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-tic-tac-toe-215186-215249/frontend_tic_tac_toe
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

