/*
* Vieb - Vim Inspired Electron Browser
* Copyright (C) 2019 Jelmer van Arnhem
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
"use strict"

const {ipcRenderer} = require("electron")
const path = require("path")

// Some styling is flagged with important, because of the default light theme
const styling = `
body {background: #333 !important;color: #eee !important;display: flex;
    font-family: monospace;line-height: 1.5;margin: 0;}
main {margin: 50px auto;width: 50vw;background: #444;padding: 50px;
    min-width: 300px;overflow: hidden;text-overflow: ellipsis;}
a {color: #eee;}
h2 {font-size: 2em;margin: 1em 0;}
.dir, .file {margin: 10px;cursor: pointer;}
.dir {font-weight: bold;color: #ffc;}
.file {color: #cff;}
.error {color: #fcc;}
`

const createElement = (type, loc, customTitle = "") => {
    const element = document.createElement("div")
    element.className = type
    element.textContent = customTitle || path.basename(loc)
    element.onclick = () => {
        ipcRenderer.sendToHost("navigate-to", toUrl(loc))
    }
    return element
}

const toUrl = loc => {
    return `file:${loc}`.replace(/^file:\/*/, "file:///")
}

const isRoot = loc => {
    return path.normalize(loc) === path.join(loc, "../")
}

ipcRenderer.on("insert-current-directory-files",
    (_, directories, files, allowed, folder) => {
        // Styling
        const styleElement = document.createElement("style")
        styleElement.textContent = styling
        document.head.appendChild(styleElement)
        // Main
        const main = document.createElement("main")
        const title = document.createElement("h2")
        title.textContent = folder
        main.appendChild(title)
        if (!isRoot(folder)) {
            main.appendChild(createElement(
                "dir", path.join(folder, "../"), ".."))
        }
        if (!allowed) {
            const error = document.createElement("span")
            error.textContent = "Permission denied"
            error.className = "error"
            main.appendChild(error)
        } else if (directories.length === 0 && files.length === 0) {
            const error = document.createElement("span")
            error.textContent = "Empty directory"
            error.className = "error"
            main.appendChild(error)
        } else {
            directories.forEach(dir => {
                main.appendChild(createElement("dir", dir))
            })
            files.forEach(file => {
                main.appendChild(createElement("file", file))
            })
        }
        document.body.appendChild(main)
    })
