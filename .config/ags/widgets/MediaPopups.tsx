import { bind } from "astal";
import Player from "./Player";

import AstalMpris from "gi://AstalMpris?version=0.1";
import { App, Astal, Gdk } from "astal/gtk4";
import { barOrientation, globalMargin } from "../variables";
import { hideWindow } from "../utils/window";
import { getMonitorName } from "../utils/monitor";

const mpris = AstalMpris.get_default();
const players = bind(mpris, "players");

export default (monitor: Gdk.Monitor) => {
  const monitorName = getMonitorName(monitor);
  return (
    <window
      gdkmonitor={monitor}
      name={`media-${monitorName}`}
      namespace={"media"}
      application={App}
      anchor={bind(barOrientation).as((orientation) =>
        orientation ? Astal.WindowAnchor.TOP : Astal.WindowAnchor.BOTTOM
      )}
      margin={globalMargin}
      visible={false}
      child={
        <box
          className="media-popup"
          child={
            <box
              child={
                <box vertical={true} spacing={10}>
                  {players.as((p: AstalMpris.Player[]) =>
                    p.map((player: AstalMpris.Player) => (
                      <Player player={player} playerType="popup" />
                    ))
                  )}
                </box>
              }></box>
          }></box>
      }></window>
  );
};
