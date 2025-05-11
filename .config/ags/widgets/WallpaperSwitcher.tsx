import hyprland from "gi://AstalHyprland";
import { bind, exec, execAsync, monitorFile, Variable } from "astal";
import { App, Gdk, Gtk } from "astal/gtk4";
import { notify } from "../utils/notification";
import { focusedWorkspace, globalTransition } from "../variables";
import ToggleButton from "./toggleButton";
import { Widget } from "astal/gtk4";
import { getMonitorName } from "../utils/monitor";
import { hideWindow } from "../utils/window";
import { Align } from "../utils/gtk4-compat";

const Hyprland = hyprland.get_default();

// State management
const selectedWorkspaceState = {
  id: Variable<number>(0),
  widget: Variable<Gtk.Button>(new Gtk.Button()),
};

focusedWorkspace.subscribe((workspace) => {
  if (workspace) {
    selectedWorkspaceState.id.set(workspace.id);
  }
});

const targetTypes = ["workspace", "sddm", "lockscreen"];
const targetType = Variable<string>("workspace");
const wallpaperType = Variable<boolean>(false);

// Wallpaper data
const wallpaperData = {
  default: {
    wallpapers: [] as string[],
    thumbnails: [] as string[],
  },
  custom: {
    wallpapers: [] as string[],
    thumbnails: [] as string[],
  },
};

const allWallpapers = Variable<string[]>([]);
const allThumbnails = Variable<string[]>([]);

// Utility functions
const shuffleArraysTogether = (
  arr1: string[],
  arr2: string[]
): [string[], string[]] => {
  const combined = arr1.map((item, index) => ({ item, thumb: arr2[index] }));
  combined.sort(() => Math.random() - 0.5);
  return [combined.map((c) => c.item), combined.map((c) => c.thumb)];
};

const updateSelectedWorkspaceWidget = (workspaceId: number, widget: Gtk.Button) => {
  selectedWorkspaceState.id.set(workspaceId);
  selectedWorkspaceState.widget.set(widget);
};

const FetchWallpapers = async () => {
  try {
    await execAsync("bash ./scripts/wallpaper-to-thumbnail.sh");

    const [defaultThumbs, customThumbs, defaultWalls, customWalls] =
      await Promise.all([
        execAsync(
          "bash ./scripts/get-wallpapers-thumbnails.sh --defaults"
        ).then(JSON.parse),
        execAsync("bash ./scripts/get-wallpapers-thumbnails.sh --custom").then(
          JSON.parse
        ),
        execAsync("bash ./scripts/get-wallpapers.sh --defaults").then(
          JSON.parse
        ),
        execAsync("bash ./scripts/get-wallpapers.sh --custom").then(JSON.parse),
      ]);

    wallpaperData.default.thumbnails = defaultThumbs;
    wallpaperData.custom.thumbnails = customThumbs;
    wallpaperData.default.wallpapers = defaultWalls;
    wallpaperData.custom.wallpapers = customWalls;

    if (wallpaperType.get()) {
      allWallpapers.set(wallpaperData.custom.wallpapers);
      allThumbnails.set(wallpaperData.custom.thumbnails);
    } else {
      const [shuffledWallpapers, shuffledThumbnails] = shuffleArraysTogether(
        [
          ...wallpaperData.default.wallpapers,
          ...wallpaperData.custom.wallpapers,
        ],
        [
          ...wallpaperData.default.thumbnails,
          ...wallpaperData.custom.thumbnails,
        ]
      );
      allWallpapers.set(shuffledWallpapers);
      allThumbnails.set(shuffledThumbnails);
    }
  } catch (err) {
    notify({ summary: "Error", body: String(err) });
  }
};

function loadThumbnailCSS(file: string, index: number) {
  App.apply_css(`
    .wallpaper-event-box-${index} {
      background-image: url("${file}");
    }
  `);
}

function loadWallpaperCSS(file: string, workspaceId: number) {
  App.apply_css(`
    .workspace-wallpaper-${workspaceId} {
      background-image: url("${file}");
    }
  `);
}

function Wallpapers(monitor: string) {
  // Load all CSS for thumbnails and workspaces
  allThumbnails.get().forEach((thumb, i) => loadThumbnailCSS(thumb, i));

  const getAllWallpapers = () => (
    <box
      cssClasses={["all-wallpapers-scrollable"]}
      hexpand
      vexpand
      child={
        <box cssClasses={["all-wallpapers"]} spacing={5}>
          {bind(
            Variable.derive(
              [bind(allWallpapers), bind(allThumbnails)],
              (allWallpapers, allThumbnails) =>
                allWallpapers.map((wallpaper, key) => {
                  // Load CSS for this thumbnail
                  loadThumbnailCSS(allThumbnails[key], key);
                  
                  return (
                    <box
                      cssClasses={["wallpaper-event-box", `wallpaper-event-box-${key}`]}
                      setup={self => {
                        self.connect("button-press-event", () => {
                          const target = targetType.get();
                          const command = {
                            sddm: `pkexec sh -c 'sed -i "s|^background=.*|background=\"${wallpaper}\"|" /usr/share/sddm/themes/where_is_my_sddm_theme/theme.conf'`,
                            lockscreen: `bash -c "cp ${wallpaper} $HOME/.config/wallpapers/lockscreen/wallpaper"`,
                            workspace: `bash -c "$HOME/.config/hypr/hyprpaper/set-wallpaper.sh ${selectedWorkspaceState.id.get()} ${wallpaper} ${monitor}"`,
                          }[target];

                          execAsync(command!)
                            .then(() => {
                              if (target === "workspace") {
                                const widget = selectedWorkspaceState.widget.get();
                                widget.add_css_class("active");
                                selectedWorkspaceState.widget.set(widget);
                              }
                              notify({
                                summary: target,
                                body: `${target} wallpaper changed successfully!`,
                              });
                            })
                            .catch(notify);
                          return true;
                        });
                      }}
                      child={
                        <box
                          cssClasses={["wallpaper"]}
                          vertical
                          child={
                            <button
                              visible={wallpaperType.get()}
                              cssClasses={["delete-wallpaper"]}
                              halign={Gtk.Align.END}
                              valign={Gtk.Align.START}
                              label=""
                              onClicked={() => {
                                execAsync(
                                  `bash -c "rm -f '${allThumbnails[key]}' '${wallpaper}'"`
                                )
                                  .then(() =>
                                    notify({
                                      summary: "Success",
                                      body: "Wallpaper deleted successfully!",
                                    })
                                  )
                                  .catch((err) =>
                                    notify({
                                      summary: "Error",
                                      body: String(err),
                                    })
                                  );
                              }}
                            />
                          }
                        />
                      }
                    />
                  );
                })
            )
          )}
        </box>
      }
    />
  );

  const getWorkspaceButtons = () => {
    const activeId = focusedWorkspace.as((workspace) => workspace.id || 1);
    const wallpapers: string[] = JSON.parse(
      exec(`bash ./scripts/get-wallpapers.sh --current ${monitor}`) || "[]"
    );

    // Load CSS for all wallpapers
    wallpapers.forEach((wallpaper, key) => {
      loadWallpaperCSS(wallpaper, key + 1);
    });

    return wallpapers.map((wallpaper, key) => {
      const workspaceId = key + 1;

      return (
        <button
          valign={Gtk.Align.CENTER}
          setup={self => {
            // Add appropriate CSS classes
            self.add_css_class("workspace-wallpaper");
            self.add_css_class(`workspace-wallpaper-${workspaceId}`);
            
            if (activeId.get() === workspaceId) {
              self.add_css_class("focused");
              updateSelectedWorkspaceWidget(workspaceId, self);
            }
            
            self.connect("clicked", () => {
              targetType.set("workspace");
              revealer.set_reveal_child(true);
              updateSelectedWorkspaceWidget(workspaceId, self);
            });
            
            activeId.subscribe(i => {
              if (i === workspaceId) {
                self.add_css_class("focused");
                updateSelectedWorkspaceWidget(workspaceId, self);
              } else {
                self.remove_css_class("focused");
              }
            });
          }}
          label={`${workspaceId}`}
        />
      );
    });
  };

  const resetButton = (
    <button
      valign={Gtk.Align.CENTER}
      cssClasses={["reload-wallpapers"]}
      label="󰑐"
      onClicked={() => {
        execAsync('bash -c "$HOME/.config/hypr/hyprpaper/reload.sh"')
          .finally(FetchWallpapers)
          .catch(notify);
      }}
    />
  );

  const randomButton = (
    <button
      valign={Gtk.Align.CENTER}
      cssClasses={["random-wallpaper"]}
      label=""
      onClicked={() => {
        const randomWallpaper =
          allWallpapers.get()[
            Math.floor(Math.random() * allWallpapers.get().length)
          ];
        execAsync(
          `bash -c "$HOME/.config/hypr/hyprpaper/set-wallpaper.sh ${selectedWorkspaceState.id.get()} ${randomWallpaper} ${monitor}"`
        )
          .finally(() => {
            const newWallpaper = JSON.parse(
              exec(`bash ./scripts/get-wallpapers.sh --current ${monitor}`)
            )[selectedWorkspaceState.id.get() - 1];
            const widget = selectedWorkspaceState.widget.get();
            const workspaceId = selectedWorkspaceState.id.get();
            
            // Update the CSS for this workspace wallpaper
            loadWallpaperCSS(newWallpaper, workspaceId);
            
            selectedWorkspaceState.widget.set(widget);
          })
          .catch(notify);
      }}
    />
  );

  const customToggle = (
    <ToggleButton
      valign={Gtk.Align.CENTER}
      cssClass="custom-wallpaper"
      label="all"
      onToggled={(self, on) => {
        wallpaperType.set(on);
        self.label = on ? "custom" : "all";
      }}
    />
  );

  let revealer: Gtk.Revealer;
  
  const revealButton = (
    <ToggleButton
      cssClass="bottom-revealer-button"
      label=""
      onToggled={(self, on) => {
        revealer.set_reveal_child(on);
        self.label = on ? "" : "";
      }}
    />
  );

  const targetButtons = (
    <box cssClasses={["targets"]} hexpand={true} halign={Gtk.Align.CENTER}>
      {targetTypes.map((type) => (
        <ToggleButton
          valign={Gtk.Align.CENTER}
          cssClass={type}
          label={type}
          state={bind(targetType).as((t) => t === type)}
          onToggled={() => targetType.set(type)}
        />
      ))}
    </box>
  );

  const selectedWorkspaceLabel = (
    <label
      cssClasses={["button", "selected-workspace"]}
      label={bind(
        Variable.derive(
          [bind(selectedWorkspaceState.id), bind(targetType)],
          (workspace, targetType) =>
            `Wallpaper -> ${targetType} ${
              targetType === "workspace" ? workspace : ""
            }`
        )
      )}
    />
  );

  const addWallpaperButton = (
    <button
      label=""
      cssClasses={["upload"]}
      onClicked={() => {
        let dialog = new Gtk.FileChooserDialog({
          title: "Open Image",
          action: Gtk.FileChooserAction.OPEN,
        });
        dialog.add_button("Upload", Gtk.ResponseType.OK);
        dialog.add_button("Cancel", Gtk.ResponseType.CANCEL);
        
        dialog.show();
        dialog.connect("response", (_, response) => {
          if (response == Gtk.ResponseType.OK) {
            let file = dialog.get_file();
            if (file) {
              let filename = file.get_path();
              execAsync(
                `bash -c "cp '${filename}' $HOME/.config/wallpapers/custom"`
              )
                .then(() =>
                  notify({
                    summary: "Success",
                    body: "Wallpaper added successfully!",
                  })
                )
                .catch((err) => notify({ summary: "Error", body: String(err) }));
            }
          }
          dialog.destroy();
        });
      }}
    />
  );

  const actions = (
    <box
      cssClasses={["actions"]}
      hexpand={true}
      halign={Gtk.Align.CENTER}
      spacing={10}
    >
      {targetButtons}
      {selectedWorkspaceLabel}
      {revealButton}
      {customToggle}
      {randomButton}
      {resetButton}
      {addWallpaperButton}
    </box>
  );

  const revealerContent = getAllWallpapers();
  
  const revealerWidget = (
    <revealer
      visible={true}
      revealChild={false}
      transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
      transitionDuration={globalTransition}
      setup={self => {
        revealer = self;
      }}
      child={<box child={revealerContent}></box>}
    />
  );

  return (
    <box cssClasses={["wallpaper-switcher"]} vertical={true} spacing={20}>
      <box hexpand={true} vexpand={true} halign={Align.CENTER} spacing={10}>
        {getWorkspaceButtons()}
      </box>
      {actions}
      <box
        cssClasses={["bottom"]}
        hexpand={true}
        vexpand={true}
        child={revealerWidget}
      ></box>
    </box>
  );
}

// Initialize
FetchWallpapers();
monitorFile("./../wallpapers/custom", FetchWallpapers);
wallpaperType.subscribe(FetchWallpapers);

export default (monitor: Gdk.Monitor) => {
  const monitorName = getMonitorName(monitor);
  return (
    <window
      gdkmonitor={monitor}
      namespace="wallpaper-switcher"
      name={`wallpaper-switcher-${monitorName}`}
      application={App}
      visible={false}
      child={Wallpapers(monitorName)}
    />
  );
};
