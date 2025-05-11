# GTK3 to GTK4 Migration Notes

## Completed Changes

1. Created a migration script in `scripts/migrate-gtk3-to-gtk4.sh` to update all imports from `astal/gtk3` to `astal/gtk4`
2. Modified `utils/gtk4-compat.ts` to only use GTK4 imports and avoid mixing GTK3 and GTK4
3. Fixed the missing `App.start` method in the compatibility layer
4. Fixed `BarHover.tsx` to remove the direct import from GTK3 widget path
5. Implemented a custom `FileChooserButton` in `widgets/FileChooser.tsx` since the GTK3 version doesn't exist in GTK4
6. Updated `toggleButton.tsx` to use GTK4's CSS class methods instead of `toggleClassName`
7. Fixed the `GLib` import in `Information.tsx`

## Remaining Issues

1. **JSX Element Property Type Mismatches**: Many components use attributes like `className` which need to be changed to `cssName` in GTK4. Examples include:
   - Label elements
   - Box elements
   - Button elements

2. **Custom Components**: Several custom components like `circularprogress` don't exist in the JSX.IntrinsicElements type for GTK4.

3. **Widget Methods**: Some widget methods like `reveal_child` may have changed in GTK4.

## Migration Strategy

To complete the migration, you need to:

1. Update all widget property names to match GTK4 expectations:
   - Change `className` to `cssName`
   - Check for any other renamed or deprecated properties

2. Implement any missing custom components to work with GTK4

3. Update widget method usage to match GTK4 API

## Running the App

Make sure to run AGS with the `--gtk4` flag:

```bash
ags run --gtk4
```

This ensures the GTK4 layer shell is used.

## Additional Resources

- [GTK4 Migration Guide](https://docs.gtk.org/gtk4/migrating-3to4.html)
- [Astal GTK4 Documentation](https://aylur.github.io/astal/guide/typescript/widget)
