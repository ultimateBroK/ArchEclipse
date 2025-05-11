import { execAsync } from "astal"
import { monitorFile } from "astal/file"
import { App as Astal3App } from "astal/gtk4"
import { App } from "./gtk4-compat"
import { globalFontSize, globalIconSize, globalOpacity, globalScale } from "../variables"
import { notify } from "./notification"

// target css file
const tmpCss = `/tmp/tmp-style.css`
const tmpScss = `/tmp/tmp-style.scss`
const scss_dir = `./scss`

const walColors = `./../../.cache/wal/colors.scss`
const defaultColors = `./scss/defaultColors.scss`

export const getCssPath = () =>
{
    refreshCss()
    return tmpCss
}

export async function refreshCss()
{
    const scss = `./scss/style.scss`

    try {

        await execAsync(`bash -c "echo '
        $OPACITY: ${globalOpacity.get().value};
        $ICON-SIZE: ${globalIconSize.get().value}px;
        $FONT-SIZE: ${globalFontSize.get().value}px;
        $SCALE: ${globalScale.get().value}px;
        ' | cat - ${defaultColors} ${walColors} ${scss} > ${tmpScss} && sassc ${tmpScss} ${tmpCss} -I ${scss_dir}"`)

        // Use compatibility layer for CSS
        App.resetCss();
        App.applyCss(tmpCss);

    } catch (e) {
        notify({ summary: `Error while generating css`, body: String(e) })
        console.error(e)
    }
}

monitorFile(
    // directory that contains the scss files
    `./scss`,
    () => refreshCss()
)

monitorFile(
    // directory that contains pywal colors
    `./../../.cache/wal/colors.scss`,
    () => refreshCss()
)
