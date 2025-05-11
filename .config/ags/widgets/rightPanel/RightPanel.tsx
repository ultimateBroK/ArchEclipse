import { App, Astal, Gdk, Gtk } from "astal/gtk4";
import {
  globalMargin,
  globalTransition,
  rightPanelExclusivity,
  rightPanelLock,
  rightPanelVisibility,
  rightPanelWidgets,
  rightPanelWidth,
  widgetLimit,
} from "../../variables";
import { bind } from "astal";
import ToggleButton from "../toggleButton";
import { getMonitorName } from "../../utils/monitor";
import { WindowActions } from "../../utils/window";
import { rightPanelWidgetSelectors } from "../../constants/widget.constants";

const WidgetActions = () => {
  return (
    <box
      vertical={true}
      vexpand={true}
      cssClasses={["widget-actions"]}
      spacing={5}>
      {rightPanelWidgetSelectors.map((selector) => {
        const isActive = rightPanelWidgets
          .get()
          .some((w) => w.name === selector.name);
        return (
          <ToggleButton
            cssClass={"widget-selector"}
            label={selector.icon}
            state={isActive}
            onToggled={(self, on) => {
              if (on) {
                if (rightPanelWidgets.get().length >= widgetLimit) return;
                rightPanelWidgets.set([...rightPanelWidgets.get(), selector]);
              } else {
                const newWidgets = rightPanelWidgets
                  .get()
                  .filter((w) => w.name !== selector.name);
                rightPanelWidgets.set(newWidgets);
              }
            }}
          />
        );
      })}
    </box>
  );
};

const Actions = () => (
  <box cssClasses={["panel-actions"]} vertical={true}>
    <WidgetActions />
    <WindowActions
      windowWidth={rightPanelWidth}
      windowExclusivity={rightPanelExclusivity}
      windowLock={rightPanelLock}
      windowVisibility={rightPanelVisibility}
    />
  </box>
);

function Panel() {
  return (
    <box>
      <box
        setup={self => {
          self.connect("leave-notify-event", () => {
            if (!rightPanelLock.get()) rightPanelVisibility.set(false);
            return true;
          });
        }}
        child={<box cssClasses={["min-width"]} />}
      />
      <box
        cssClasses={["main-content"]}
        vertical={true}
        spacing={10}
        widthRequest={bind(rightPanelWidth)}>
        {bind(rightPanelWidgets).as((widgets) => {
          return widgets
            .map((widget) =>
              rightPanelWidgetSelectors.find((w) => w.name === widget.name)
            ) // Find and call the widget function
            .filter((widget) => widget && widget.widget) // Filter out invalid widgets
            .map((widget) => {
              try {
                return widget!.widget();
              } catch (error) {
                console.error(`Error rendering widget:`, error);
                return <box />; // Fallback component
              }
            });
        })}
      </box>
      <Actions />
    </box>
  );
}
export default (monitor: Gdk.Monitor) => {
  // Create a binding for CSS classes based on exclusivity
  const panelClasses = bind(rightPanelExclusivity).as(exclusivity => 
    exclusivity ? ["right-panel", "exclusive"] : ["right-panel", "normal"]
  );
  
  return (
    <window
      gdkmonitor={monitor}
      name={`right-panel-${getMonitorName(monitor)}`}
      namespace={"right-panel"}
      application={App}
      cssClasses={panelClasses.get()}
      setup={self => {
        // Update CSS classes when exclusivity changes
        rightPanelExclusivity.subscribe(exclusivity => {
          self.set_css_classes(
            exclusivity ? ["right-panel", "exclusive"] : ["right-panel", "normal"]
          );
        });
      }}
      anchor={
        Astal.WindowAnchor.RIGHT |
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.BOTTOM
      }
      exclusivity={bind(rightPanelExclusivity).as((exclusivity) =>
        exclusivity ? Astal.Exclusivity.EXCLUSIVE : Astal.Exclusivity.NORMAL
      )}
      layer={bind(rightPanelExclusivity).as((exclusivity) =>
        exclusivity ? Astal.Layer.BOTTOM : Astal.Layer.TOP
      )}
      margin={bind(rightPanelExclusivity).as((exclusivity) =>
        exclusivity ? 0 : globalMargin
      )}
      keymode={Astal.Keymode.ON_DEMAND}
      visible={bind(rightPanelVisibility)}
      child={<Panel />}
    />
  );
};

export function RightPanelVisibility() {
  return (
    <revealer
      revealChild={bind(rightPanelLock).as((lock) => lock)}
      transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
      transitionDuration={globalTransition}
      child={
        <ToggleButton
          state={bind(rightPanelVisibility)}
          label={bind(rightPanelVisibility).as((v) => (v ? "" : ""))}
          onToggled={(self, on) => rightPanelVisibility.set(on)}
          cssClass="panel-trigger icon"
        />
      }
    />
  );
}
