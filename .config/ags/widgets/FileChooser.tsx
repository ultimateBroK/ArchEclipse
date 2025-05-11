import { GObject } from "astal";
import { Gtk } from "astal/gtk4";

// Create a custom FileChooserButton using Gtk4 components
export const FileChooserButton = (props: {
  hexpand?: boolean;
  vexpand?: boolean;
  usePreviewLabel?: boolean;
  fileSet?: (widget: { get_uri: () => string | null }) => void;
  [key: string]: any;
}) => {
  const { fileSet, ...otherProps } = props;
  
  return (
    <button
      {...otherProps}
      label="Select File"
      onClicked={(button) => {
        const dialog = new Gtk.FileChooserDialog({
          title: "Select File",
          action: Gtk.FileChooserAction.OPEN,
        });
        
        dialog.add_button("Cancel", Gtk.ResponseType.CANCEL);
        dialog.add_button("Open", Gtk.ResponseType.ACCEPT);
        
        dialog.connect("response", (dialog, response) => {
          if (response === Gtk.ResponseType.ACCEPT && fileSet) {
            // Create a wrapper object with get_uri method
            const wrapper = {
              get_uri: () => dialog.get_file()?.get_uri() || null
            };
            fileSet(wrapper);
          }
          dialog.destroy();
        });
        
        dialog.show();
      }}
    />
  );
}; 