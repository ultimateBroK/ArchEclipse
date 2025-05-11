import { App, Astal, Gdk, Gtk } from "astal/gtk4";
import { getMonitorName } from "../../utils/monitor";
import { bind, Variable } from "astal";
import {
  globalMargin,
  globalTransition,
  leftPanelExclusivity,
  leftPanelLock,
  leftPanelVisibility,
  leftPanelWidget,
  leftPanelWidth,
} from "../../variables";

import { WindowActions } from "../../utils/window";
import ToggleButton from "../toggleButton";
import { leftPanelWidgetSelectors } from "../../constants/widget.constants";

const WidgetActions = () => (
  <box cssClasses={["widget-actions"]} vertical={true} spacing={10}>
    {leftPanelWidgetSelectors.map((widgetSelector) => (
      <ToggleButton
        state={bind(leftPanelWidget).as((w) => w.name === widgetSelector.name)}
        label={widgetSelector.icon}
        onToggled={() => leftPanelWidget.set(widgetSelector)}
      />
    ))}
  </box>
);

const Actions = () => (
  <box cssClasses={["panel-actions"]} vertical={true}>
    <WidgetActions />
    <WindowActions
      windowWidth={leftPanelWidth}
      windowExclusivity={leftPanelExclusivity}
      windowLock={leftPanelLock}
      windowVisibility={leftPanelVisibility}
    />
  </box>
);

function Panel() {
  return (
    <box>
      <Actions />
      <box
        cssClasses={["main-content"]}
        widthRequest={bind(leftPanelWidth)}
        child={bind(leftPanelWidget).as(
          (widget) =>
            leftPanelWidgetSelectors
              .find((ws) => ws.name === widget.name)
              ?.widget() || <box />
        )}></box>
      <box
        setup={self => {
          self.connect("leave-notify-event", () => {
            if (!leftPanelLock.get()) leftPanelVisibility.set(false);
            return true;
          });
        }}
        child={<box css={"min-width:5px"} />}></box>
    </box>
  );
}

export default (monitor: Gdk.Monitor) => {
  // Create a binding for CSS classes based on exclusivity
  const panelClasses = bind(leftPanelExclusivity).as(exclusivity => 
    exclusivity ? ["left-panel", "exclusive"] : ["left-panel", "normal"]
  );
  
  return (
    <window
      gdkmonitor={monitor}
      name={`left-panel-${getMonitorName(monitor)}`}
      namespace={"left-panel"}
      application={App}
      cssClasses={panelClasses.get()}
      setup={self => {
        // Update CSS classes when exclusivity changes
        leftPanelExclusivity.subscribe(exclusivity => {
          self.set_css_classes(
            exclusivity ? ["left-panel", "exclusive"] : ["left-panel", "normal"]
          );
        });
      }}
      anchor={
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.BOTTOM
      }
      exclusivity={bind(leftPanelExclusivity).as((exclusivity) =>
        exclusivity ? Astal.Exclusivity.EXCLUSIVE : Astal.Exclusivity.NORMAL
      )}
      layer={bind(leftPanelExclusivity).as((exclusivity) =>
        exclusivity ? Astal.Layer.BOTTOM : Astal.Layer.TOP
      )}
      margin={bind(leftPanelExclusivity).as((exclusivity) =>
        exclusivity ? 0 : globalMargin
      )}
      keymode={Astal.Keymode.ON_DEMAND}
      visible={bind(leftPanelVisibility)}
      child={<Panel />}
    />
  );
};

export function LeftPanelVisibility() {
  return (
    <revealer
      revealChild={bind(leftPanelLock).as((lock) => lock)}
      transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
      transitionDuration={globalTransition}
      child={
        <ToggleButton
          state={bind(leftPanelVisibility)}
          label={bind(leftPanelVisibility).as((v) => (v ? "" : ""))}
          onToggled={(self, on) => leftPanelVisibility.set(on)}
          cssClass="panel-trigger icon"
        />
      }
    />
  );
}
