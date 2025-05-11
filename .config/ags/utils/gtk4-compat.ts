/**
 * Compatibility utilities for handling GTK4 API differences
 */

import { App as Astal3App } from "astal/gtk4";
import Gtk from "gi://Gtk?version=4.0";

// Create alignment constants that work with both GTK3 and GTK4
export const Align = {
    START: Gtk.Align.START,
    END: Gtk.Align.END,
    CENTER: Gtk.Align.CENTER,
    FILL: Gtk.Align.FILL
    // Note: BASELINE_FILL only exists in GTK4
};

// Create a wrapper for the App object that works with both GTK3 and GTK4
export const App = {
    // Original App object
    ...Astal3App,
    
    // Monitor handling
    getMonitors: () => {
        // Consistently use get_monitors() for GTK4
        return Astal3App.get_monitors?.();
    },
    
    // CSS handling
    resetCss: () => {
        Astal3App.reset_css?.();
    },
    
    applyCss: (cssPath: string) => {
        Astal3App.apply_css?.(cssPath);
    },
    
    // App.start method
    start: (options: {
        css?: string;
        main: () => void;
    }) => {
        if (options.css) {
            App.applyCss(options.css);
        }
        
        // Run the main function
        options.main();
        
        // In GTK4, there might be different startup mechanics
        // This simple approach just runs the main function
        return true;
    }
}; 