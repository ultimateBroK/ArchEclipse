import { WidgetSelector } from "../interfaces/widgetSelector.interface";
import Calendar from "../widgets/Calendar";
import ChatBot from "../widgets/leftPanel/components/ChatBot";
import CustomScripts from "../widgets/leftPanel/components/CustomScripts";
import MediaWidget from "../widgets/MediaWidget";
import NotificationHistory from "../widgets/rightPanel/NotificationHistory";

import Workspaces from "../widgets/bar/components/Workspaces";
import Information from "../widgets/bar/components/Information";
import Utilities from "../widgets/bar/components/Utilities";
import { Gtk } from "astal/gtk3";


export const barWidgetSelectors: WidgetSelector[] = [
    {
        name: "workspaces",
        icon: "󰒘",
        widget: (monitorName: string) => Workspaces({ monitorName, halign: Gtk.Align.START }),
    },
    {
        name: "information",
        icon: "󰒘",
        widget: (monitorName: string) => Information({ monitorName, halign: Gtk.Align.CENTER }),
    },
    {
        name: "utilities",
        icon: "󰒘",
        widget: (monitorName: string) => Utilities({ monitorName, halign: Gtk.Align.END }),
    },
]

export const rightPanelWidgetSelectors: WidgetSelector[] = [
    {
        name: "Media",
        icon: "",
        widget: () => MediaWidget(),
    },
    {
        name: "NotificationHistory",
        icon: "",
        widget: () => NotificationHistory(),
    },
    {
        name: "Calendar",
        icon: "",
        widget: () => Calendar(),
    },
    // {
    //   name: "Resources",
    //   icon: "",
    //   widget: () => Resources(),
    // },
    // {
    //   name: "Update",
    //   icon: "󰚰",
    //   widget: () => Update(),
    // },
];

export const leftPanelWidgetSelectors: WidgetSelector[] = [
    {
        name: "ChatBot",
        icon: "",
        widget: () => ChatBot(),
    },
    {
        name: "CustomScripts",
        icon: "",
        widget: () => CustomScripts(),
    }
];