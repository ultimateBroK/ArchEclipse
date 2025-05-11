#!/bin/bash

# Translate a text to Vietnamese
text=$1
language=$2

if [ -z "$language" ]; then
    language="vn"
fi

result=$(trans -brief "$text" -t "$language")

# Escape single quotes in the result
escaped_result=$(echo "$result" | sed "s/'/'\\\\''/g")

app_name=$result
app_exec="wl-copy '$escaped_result'"

# echo "[{\"app_name\": \"$app_name\", \"app_exec\": \"$app_exec\"}]"
echo "$result"
