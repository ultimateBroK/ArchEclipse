import { Binding, Variable } from "astal";
import { Widget, Gtk, hook } from "astal/gtk4";

// Define the props interface for the ToggleButton component
export interface ToggleButtonProps extends Widget.ButtonProps {
  // Callback function triggered when the button is toggled
  onToggled?: (self: Gtk.Button, on: boolean) => void;

  // The state of the button can be a boolean or a reactive Binding<boolean>
  state?: Binding<boolean> | boolean;

  // The child component inside the button
  child?: JSX.Element;

  // CSS class name
  cssClass?: string;
}

// ToggleButton functional component
export default function ToggleButton(btnprops: ToggleButtonProps) {
  // Destructure properties from props, providing default values if needed
  const { state = false, onToggled, setup, child, cssClass, ...props } = btnprops;

  // Create an internal state variable
  // If `state` is a Binding, initialize with its current value; otherwise, use the boolean value directly
  const innerState = Variable(state instanceof Binding ? state.get() : state);

  return (
    <button
      {...props} // Spread other button props
      setup={(self: Gtk.Button) => {
        // Call the original setup function if provided
        setup?.(self);
        
        // Apply CSS classes based on state
        const updateClass = (isChecked: boolean) => {
          if (isChecked) {
            self.add_css_class("checked");
          } else {
            self.remove_css_class("checked");
          }
          
          // Apply custom CSS class if provided
          if (cssClass) {
            self.add_css_class(cssClass);
          }
        };
        
        // Initialize with current state
        updateClass(innerState.get());
        
        // Update classes when state changes
        hook(self, innerState, () => {
          updateClass(innerState.get());
        });

        // If `state` is a Binding, sync the inner state whenever `state` updates
        if (state instanceof Binding) {
          hook(self, state, () => innerState.set(state.get()));
        }
      }}
      onClicked={(self: Gtk.Button) => {
        // Toggle the state and trigger the `onToggled` callback with the new value
        innerState.set(!innerState.get());
        onToggled?.(self, innerState.get());
      }}
      child={child} // Set the button's child element
    />
  );
}
