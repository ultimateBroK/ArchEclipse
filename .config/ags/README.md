# AGS Configuration

This is a GTK4-based AGS (Aylur's GTK Shell) configuration.

## GTK4 Migration Notes

The configuration has been migrated from GTK3 to GTK4. Here are the key changes:

1. All imports now use `astal/gtk4` instead of `astal/gtk3`
2. API changes:
   - `App.get_monitors()` → `App.monitors()`
   - `App.reset_css()` → `App.styleManager.removeAll()`
   - `App.apply_css()` → `App.styleManager.loadCss()`
   - `monitor.get_display()` → `monitor.display`
   - `getMonitorName()` implementation updated to use `monitor.get_model()`

3. A compatibility layer is provided to handle API differences between GTK3 and GTK4.

## Switching Between GTK3 and GTK4

A utility script is provided to easily switch between GTK3 and GTK4 modes:

```bash
# Toggle between GTK3 and GTK4
.config/ags/scripts/toggle-gtk-version.sh
```

## Running the Configuration

```bash
# Run with GTK4
ags run --gtk4

# Run with GTK3 (if switched to GTK3 mode)
ags run
``` 