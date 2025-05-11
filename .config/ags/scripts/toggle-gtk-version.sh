#!/bin/bash

# Script to toggle between GTK3 and GTK4 modes for AGS

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
AGS_CONFIG_DIR="$CURRENT_DIR/.."
HYPR_EXEC_CONF="$HOME/.config/hypr/configs/exec.conf"
HYPR_BAR_SCRIPT="$HOME/.config/hypr/scripts/bar.sh"

# Check current mode from tsconfig.json
if grep -q "gtk4" "$AGS_CONFIG_DIR/tsconfig.json"; then
    NEW_MODE="gtk3"
    echo "Switching to GTK3 mode..."
else
    NEW_MODE="gtk4"
    echo "Switching to GTK4 mode..."
fi

# Update app.ts
sed -i "s/from \"astal\/gtk[34]\"/from \"astal\/$NEW_MODE\"/" "$AGS_CONFIG_DIR/app.ts"

# Update scss.ts
sed -i "s/from \"astal\/gtk[34]\"/from \"astal\/$NEW_MODE\"/" "$AGS_CONFIG_DIR/utils/scss.ts"

# Update tsconfig.json
sed -i "s|\"jsxImportSource\": \"/usr/share/astal/gjs/gtk[34]\"|\"jsxImportSource\": \"/usr/share/astal/gjs/$NEW_MODE\"|" "$AGS_CONFIG_DIR/tsconfig.json"

# Find and update all widget files
find "$AGS_CONFIG_DIR" -name "*.tsx" -type f -exec sed -i "s/from \"astal\/gtk[34]\"/from \"astal\/$NEW_MODE\"/" {} \;

# Update Hyprland config
if [ "$NEW_MODE" == "gtk4" ]; then
    # Update to GTK4 mode
    sed -i 's/ags run$/ags run --gtk4/' "$HYPR_EXEC_CONF"
    sed -i 's/ags run &$/ags run --gtk4 &/' "$HYPR_BAR_SCRIPT"
else
    # Update to GTK3 mode
    sed -i 's/ags run --gtk4$/ags run/' "$HYPR_EXEC_CONF"
    sed -i 's/ags run --gtk4 &$/ags run &/' "$HYPR_BAR_SCRIPT"
fi

echo "Configuration updated to $NEW_MODE. Restart AGS using: ags quit && ags run$([ "$NEW_MODE" == "gtk4" ] && echo " --gtk4")" 