#!/bin/bash

# Script to update CSS gradients and other properties for GTK4 compatibility

SCSS_DIR="$HOME/.config/ags/scss"

echo "Searching for GTK3-specific CSS properties and updating them for GTK4..."

# Replace -gtk-icon-effect with the GTK4 equivalent
find "$SCSS_DIR" -name "*.scss" -type f -exec sed -i 's/-gtk-icon-effect: dim/-gtk-icon-filter: opacity(0.5)/g' {} \;
find "$SCSS_DIR" -name "*.scss" -type f -exec sed -i 's/-gtk-icon-effect: highlight/-gtk-icon-filter: brightness(1.2)/g' {} \;

# Replace -gtk-gradient with standard CSS gradients
find "$SCSS_DIR" -name "*.scss" -type f -exec sed -i 's/-gtk-gradient/linear-gradient/g' {} \;

# Replace -gtk-outline-...-radius with standard border-radius
find "$SCSS_DIR" -name "*.scss" -type f -exec grep -l "\-gtk-outline-" {} \; | xargs -I{} echo "Check {} for -gtk-outline- properties and update manually"

echo "CSS updates completed. Run 'sassc' to regenerate your CSS files."
echo "Refresh AGS to apply changes: ags quit && ags run --gtk4" 