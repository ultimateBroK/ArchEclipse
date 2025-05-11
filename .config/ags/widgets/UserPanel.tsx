import { bind, exec, execAsync, Variable } from "astal";
import MediaWidget from "./MediaWidget";

import NotificationHistory from "./rightPanel/NotificationHistory";
import { App, Astal, Gdk, Gtk, hook } from "astal/gtk4";
import GLib from 'gi://GLib';

import hyprland from "gi://AstalHyprland";
import { date_less } from "../variables";
import { hideWindow } from "../utils/window";
import { getMonitorName } from "../utils/monitor";
import { notify } from "../utils/notification";
import { FileChooserButton } from "./FileChooser";
const Hyprland = hyprland.get_default();

const pfpPath = exec(`bash -c "echo $HOME/.face.icon"`);
const username = exec(`whoami`);
const uptime = Variable("-").poll(600000, "uptime -p");

// Changed to export default
export default (monitor: Gdk.Monitor) => {
  const monitorName = getMonitorName(monitor);
  
  const Profile = () => {
    const UserName = (
      <box halign={Gtk.Align.CENTER} cssName="user-name">
        <label label="I'm " />
        <label cssName="name" label={username} />
      </box>
    );

    const Uptime = (
      <box
        halign={Gtk.Align.CENTER}
        cssName="up-time"
        child={<label cssName="uptime" label={bind(uptime)} />}></box>
    );

    const pfpVariable = Variable(pfpPath);

    const ProfilePicture = (
      <box
        cssName="profile-picture"
        setup={(self) => {
          const cssProvider = new Gtk.CssProvider();
          self.get_style_context().add_provider(cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_USER);

          const updateCss = (path: string) => {
            const style = `
              .profile-picture {
                background-image: url("${path}");
                min-height: 100px;
                min-width: 100px;
                background-size: cover;
                background-position: center;
              }
            `;
            cssProvider.load_from_string(style);
          };

          hook(self, pfpVariable, () => updateCss(pfpVariable.get()));
          updateCss(pfpVariable.get());
        }}
      >
        <FileChooserButton
          hexpand
          vexpand
          usePreviewLabel={false}
          fileSet={(self: any) => {
            let uri = self.get_uri();
            if (!uri) return;
            const cleanUri = uri.replace("file://", "");
            execAsync(`bash -c "cp '${cleanUri}' '${pfpPath}'"`)
              .then(() => {
                pfpVariable.set(pfpPath + "?timestamp=" + globalThis.Date.now());
              })
              .finally(() => {
                notify({
                  summary: "Profile picture",
                  body: `${cleanUri} set to ${pfpPath}`,
                });
              })
              .catch((err) => notify({ summary: "PFP Error", body: String(err) }));
          }}
        />
      </box>
    );

    return (
      <box cssName="profile" vertical={true}>
        {ProfilePicture}
        {UserName}
        {Uptime}
      </box>
    );
  };

  const Actions = () => {
    const Logout = () => (
      <button
        hexpand={true}
        cssName="logout"
        label="󰍃"
        onClicked={() => {
          Hyprland.message_async("dispatch exit", () => {});
        }}
      />
    );

    const Shutdown = () => (
      <button
        hexpand={true}
        cssName="shutdown"
        label=""
        onClicked={() => {
          execAsync(`shutdown now`);
        }}
      />
    );

    const Restart = () => (
      <button
        hexpand={true}
        cssName="restart"
        label="󰜉"
        onClicked={() => {
          execAsync(`reboot`);
        }}
      />
    );

    const Sleep = () => (
      <button
        hexpand={true}
        cssName="sleep"
        label="󰤄"
        onClicked={() => {
          hideWindow(`user-panel-${monitorName}`);
          execAsync(`bash -c "$HOME/.config/hypr/scripts/hyprlock.sh suspend"`);
        }}
      />
    );

    return (
      <box cssName="system-actions" vertical={true} spacing={10}>
        <box cssName="action" spacing={10}>
          {Shutdown()}
          {Restart()}
        </box>
        <box cssName="action" spacing={10}>
          {Sleep()}
          {Logout()}
        </box>
      </box>
    );
  };

  const right = (
    <box
      halign={Gtk.Align.CENTER}
      cssName="bottom"
      vertical={true}
      spacing={10}>
      {Profile()}
      {Actions()}
    </box>
  );

  const Date = (
    <box
      cssName="date"
      child={
        <label
          halign={Gtk.Align.CENTER}
          hexpand={true}
          label={bind(date_less)}
        />
      }></box>
  );

  const middle = (
    <box
      cssName="middle"
      vertical={true}
      hexpand={true}
      vexpand={true}
      spacing={10}>
      {NotificationHistory()}
      {Date}
    </box>
  );

  const WindowActions = (
    <box
      cssName="window-actions"
      hexpand={true}
      halign={Gtk.Align.END}
      child={
        <button
          cssName="close"
          label=""
          onClicked={() => {
            hideWindow(`user-panel-${monitorName}`);
          }}
        />
      }
    />
  );

  return (
    <window
      gdkmonitor={monitor}
      name={`user-panel-${monitorName}`}
      namespace="user-panel"
      application={App}
      visible={false}
      child={
        <box cssName="user-panel-container" vertical>
          {WindowActions}
          <box cssName="user-panel" spacing={10}>
            {MediaWidget()}
            {middle}
            {right}
          </box>
        </box>
      }
    />
  );
};