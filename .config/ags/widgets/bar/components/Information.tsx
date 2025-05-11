import Hyprland from "gi://AstalHyprland";
const hyprland = Hyprland.get_default();
import Mpris from "gi://AstalMpris";
const mpris = Mpris.get_default();
import Cava from "gi://AstalCava";
const cava = Cava.get_default()!;
import GLib from "gi://GLib";
import Pango from "gi://Pango";

import { playerToColor } from "../../../utils/color";
import { lookupIcon, playerToIcon } from "../../../utils/icon";
import {
  date_less,
  date_more,
  dateFormat,
  emptyWorkspace,
  focusedClient,
  globalTransition,
} from "../../../variables";
import {
  bind,
  exec,
  Variable,
} from "astal";
import { App, Gtk } from "astal/gtk4";
import CustomRevealer from "../../CustomRevealer";
import { showWindow } from "../../../utils/window";
import { dateFormats } from "../../../constants/date.constants";

cava?.set_bars(12);
const bars = Variable("");
const blocks = [
  "\u2581",
  "\u2582",
  "\u2583",
  "\u2584",
  "\u2585",
  "\u2586",
  "\u2587",
  "\u2588",
];
// Assuming blocks is constant, move it outside
const BLOCKS_LENGTH = blocks.length;
const EMPTY_BARS = "".padEnd(12, "\u2581");

function AudioVisualizer() {
  let revealerWidget: Gtk.Revealer;
  
  const revealer = (
    <revealer
      revealChild={false}
      transitionDuration={globalTransition}
      transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
      setup={self => {
        revealerWidget = self;
      }}
      child={
        <label
          cssClasses={["cava"]}
          onDestroy={() => bars.drop()}
          label={bind(bars)}
        />
      }
    />
  );

  let pendingUpdate = false;
  let lastValues: any = null;
  const UPDATE_INTERVAL = 50; // ms

  cava?.connect("notify::values", () => {
    if (pendingUpdate) {
      lastValues = cava.get_values(); // Store latest values
      return;
    }

    pendingUpdate = true;
    lastValues = cava.get_values();

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, UPDATE_INTERVAL, () => {
      const values = lastValues;
      const barArray = new Array(values.length);

      for (let i = 0; i < values.length; i++) {
        const val = values[i];
        const index = Math.min(Math.floor(val * 8), BLOCKS_LENGTH - 1);
        barArray[i] = blocks[index];
      }

      const b = barArray.join("");
      bars.set(b);
      revealerWidget.set_reveal_child(b !== EMPTY_BARS);

      pendingUpdate = false;
      return GLib.SOURCE_REMOVE;
    });
  });

  return revealer;
}

function Media({ monitorName }: { monitorName: string }) {
  const progress = (player: Mpris.Player) => {
    const playerIcon = bind(player, "entry").as((e) => playerToIcon(e));
    // Replace circularprogress custom component with a standard box for now
    return (
      <box
        cssClasses={["progress"]}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        child={
          <label cssClasses={["icon"]} label={playerIcon} />
        }
      />
    );
  };

  const title = (player: Mpris.Player) => (
    <label
      cssClasses={["title"]}
      max_width_chars={20}
      ellipsize={Pango.EllipsizeMode.END}
      label={bind(player, "title").as((t) => t || "Unknown Track")}></label>
  );

  const artist = (player: Mpris.Player) => (
    <label
      cssClasses={["artist"]}
      max_width_chars={20}
      ellipsize={Pango.EllipsizeMode.END}
      label={bind(player, "artist").as(
        (a) => `[${a}]` || "Unknown Artist"
      )}></label>
  );

  function Player(player: Mpris.Player) {
    return (
      <box
        cssClasses={["media"]}
        setup={self => {
          // Handle entry binding for the class
          self.connect("realize", () => {
            const updateEntryClass = () => {
              const entryVal = player.entry;
              self.add_css_class(entryVal);
            };
            
            // Initial setup
            updateEntryClass();
            
            // Listen for changes
            player.connect("notify::entry", updateEntryClass);
          });
          
          // Handle cover art changes using a custom ID-based approach
          const playerId = player.bus_name;
          const cssId = `player-${playerId.replace(/\./g, "-")}`;
          
          player.connect("notify::cover-art", () => {
            const coverArt = player.coverArt;
            if (coverArt) {
              // Add a unique identifier class to the player box
              self.add_css_class(cssId);
              
              // Create a global CSS rule specific to this player
              const cssText = `
                .${cssId} {
                  background-image: linear-gradient(
                    to right,
                    #000000,
                    rgba(0, 0, 0, 0.5)
                  ),
                  url("${coverArt}");
                }
              `;
              
              // Apply to the application globally via App
              App.apply_css(cssText);
              
            } else {
              self.remove_css_class(cssId);
            }
          });
        }}
        spacing={10}>
        {progress(player)}
        {title(player)}
        {artist(player)}
      </box>
    );
  }

  const activePlayer = () =>
    Player(
      mpris.players.find(
        (player) => player.playbackStatus === Mpris.PlaybackStatus.PLAYING
      ) || mpris.players[0]
    );

  return (
    <revealer
      revealChild={bind(mpris, "players").as((arr) => arr.length > 0)}
      transitionDuration={globalTransition}
      transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
      child={
        <box
          cssClasses={["media-event"]}
          setup={self => {
            self.connect("button-press-event", () => {
              hyprland.message_async("dispatch workspace 4", (res) => {});
              return true;
            });
            self.connect("notify::hover", () => {
              if (self.get_state_flags() & Gtk.StateFlags.PRELIGHT) {
                showWindow(`media-${monitorName}`);
              }
            });
          }}
          child={bind(mpris, "players").as((arr) =>
            arr.length > 0 ? activePlayer() : <box />
          )}
        />
      }></revealer>
  );
}

function Clock() {
  const revealer = <label cssClasses={["revealer"]} label={bind(date_more)}></label>;
  const trigger = <label cssClasses={["trigger"]} label={bind(date_less)}></label>;

  return (
    <box
      setup={self => {
        self.connect("button-press-event", () => {
          const currentFormat = dateFormat.get();
          const currentIndex = dateFormats.indexOf(currentFormat);
          dateFormat.set(dateFormats[(currentIndex + 1) % dateFormats.length]);
          return true;
        });
      }}
      child={
        <CustomRevealer
          trigger={trigger}
          child={revealer}
          custom_class="clock"
        />
      }
    />
  );
}

function Bandwidth() {
  const bandwidth = Variable<number[]>([0, 0, 0, 0]).poll(
    1000,
    ["./assets/binaries/bandwidth"],
    (out) => {
      return [
        JSON.parse(out)[0],
        JSON.parse(out)[1],
        JSON.parse(out)[2],
        JSON.parse(out)[3],
      ];
    }
  );

  // Utility function to format bytes into KB, MB, GB, etc.
  function formatKiloBytes(kiloBytes: number): string {
    const units = ["KB", "MB", "GB", "TB"];
    let unitIndex = 0;
    let formattedValue = kiloBytes;

    while (formattedValue >= 1024 && unitIndex < units.length - 1) {
      formattedValue /= 1024;
      unitIndex++;
    }

    return `${formattedValue.toFixed(2)} ${units[unitIndex]}`;
  }

  const totalBandwidth = (
    <label
      cssClasses={["bandwidth-total"]}
      onDestroy={() => bandwidth.drop()}
      label={bind(bandwidth).as((bandwidth) => {
        return `${formatKiloBytes(bandwidth[2])} | ${formatKiloBytes(
          bandwidth[3]
        )}`;
      })}
    />
  );

  const packet = (icon: string, value: string) => (
    <box cssClasses={["packet"]} spacing={1}>
      <label label={value} />
      <label cssClasses={["icon"]} label={icon} />
    </box>
  );

  const trigger = (
    <box cssClasses={["bandwidth"]} spacing={5}>
      {bind(bandwidth).as((bandwidth) => {
        return [
          packet("", String(bandwidth[0])),
          packet("", String(bandwidth[1])),
        ];
      })}
    </box>
  );

  return (
    <CustomRevealer
      trigger={trigger}
      child={totalBandwidth}
      custom_class="bandwidth"
    />
  );
}

function ClientTitle() {
  return (
    <revealer
      revealChild={emptyWorkspace.as((empty) => !empty)}
      transitionDuration={globalTransition}
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      child={focusedClient.as(
        (client) =>
          client && (
            <label
              cssClasses={["client-title"]}
              ellipsize={Pango.EllipsizeMode.END}
              max_width_chars={24}
              label={bind(client, "title").as(String)}
            />
          )
      )}></revealer>
  );
}

export default ({
  monitorName,
  halign,
}: {
  monitorName: string;
  halign: Gtk.Align;
}) => {
  return (
    <box cssClasses={["bar-middle"]} spacing={5} halign={halign} hexpand>
      <AudioVisualizer />
      <Media monitorName={monitorName} />
      <Clock />
      <Bandwidth />
      <ClientTitle />
    </box>
  );
};
