import { GObject } from "astal";
import { astalify, ConstructProps, Gtk } from "astal/gtk4";

// Use astalify to create a type-safe Calendar component
const CalendarWidget = astalify<Gtk.Calendar, Gtk.Calendar.ConstructorProps>(Gtk.Calendar);

// Export a wrapper function that returns a Calendar widget
export default () => {
  return (
    <box cssName={"calendar"} vexpand={true} hexpand={true}>
      <CalendarWidget hexpand={true} vexpand={true} />
    </box>
  );
};
