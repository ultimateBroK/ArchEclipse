#!/bin/bash

# This script converts all imports from astal/gtk3 to astal/gtk4

# Find all TypeScript files that import from astal/gtk3
FILES=$(grep -l "import.*astal/gtk3" --include="*.ts" --include="*.tsx" -r . | grep -v "node_modules")

for FILE in $FILES; do
  echo "Converting $FILE"
  
  # Replace astal/gtk3 imports with astal/gtk4
  sed -i 's/import \(.*\) from "astal\/gtk3"/import \1 from "astal\/gtk4"/g' "$FILE"
  
  # Replace astal/gtk3/widget imports with astal/gtk4/widget
  sed -i 's/import \(.*\) from "astal\/gtk3\/widget"/import \1 from "astal\/gtk4\/widget"/g' "$FILE"
done

echo "Conversion complete!" 