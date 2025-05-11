import { Gdk } from "astal/gtk4";

export function getMonitorName(monitor: Gdk.Monitor): string {
    // In GTK4, we can directly get the model name from the monitor
    return monitor.get_model() || `Monitor-${monitor.get_connector()}`;
}