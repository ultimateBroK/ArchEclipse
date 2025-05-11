import { Astal, Gtk, Gdk } from "astal/gtk4"

export function playerToIcon(name: string)
{
    let icons: {
        [key: string]: string
    } = {
        spotify: "󰓇",
        VLC: "󰓈",
        YouTube: "󰓉",
        Brave: "",
        Audacious: "󰓋",
        Rhythmbox: "󰓌",
        Chromium: "",
        Firefox: "󰈹",
        firefox: "󰈹",
    }
    return icons[name] || ""
}

export const lookupIcon = (name: string): string =>
{
    const display = Gdk.Display.get_default();
    if (!display) {
        return "audio-x-generic-symbolic"; // Cannot get display, return fallback
    }
    const iconTheme = Gtk.IconTheme.get_for_display(display);
    if (iconTheme.has_icon(name)) {
        return name;
    }
    return "audio-x-generic-symbolic";
}

