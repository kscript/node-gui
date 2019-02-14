const fs = require('fs')
const path = require('path')
const gui = require('gui')

const menu = gui.MenuBar.create([
  {
    label: '文件',
    submenu: [
      {
        label: '退出',
        accelerator: 'CmdOrCtrl+Q',
        onClick: () => gui.MessageLoop.quit()
      },
    ],
  },
  {
    label: '编辑',
    submenu: [
      { role: 'copy', label: "复制" },
      { role: 'cut', label: "剪切" },
      { role: 'paste', label: "粘贴" },
      { role: 'select-all', label: "选择全部" },
      { type: 'separator' },
      { role: 'undo', label: "撤销" },
      { role: 'redo', label: "恢复" },
    ],
  },
])

const win = gui.Window.create({})
win.setContentSize({width: 400, height: 400})
win.onClose = () => gui.MessageLoop.quit()

const contentView = gui.Container.create()
contentView.setStyle({flexDirection: 'row'})
win.setContentView(contentView)

let sidebar
if (process.platform == 'darwin') {
  sidebar = gui.Vibrant.create()
  sidebar.setBlendingMode('behind-window')
  sidebar.setMaterial('dark')
} else {
  sidebar = gui.Container.create()
}
sidebar.setStyle({
  padding: 5,
  width: 100,
  height: 60
})
contentView.addChildView(sidebar)

const edit = gui.TextEdit.create()
edit.setStyle({flex: 1})
contentView.addChildView(edit)

let filename
let folder

const open = gui.Button.create('')
open.setImage(gui.Image.createFromPath(__dirname + '/eopen@2x.png'))
open.setStyle({marginBottom: 5})
open.onClick = () => {
  const dialog = gui.FileOpenDialog.create()
  dialog.setOptions(gui.FileDialog.optionShowHidden)
  dialog.setFilters([
    { description: 'All Files', extensions: ['*'] },
    { description: 'JavaScript Files', extensions: ['js'] },
  ])
  if (dialog.runForWindow(win)) {
    const p = dialog.getResult()
    folder = path.dirname(p)
    filename = path.basename(p)
    edit.setText(String(fs.readFileSync(p)))
    edit.focus()
    win.setTitle(filename)
  }
}
sidebar.addChildView(open)

const save = gui.Button.create('')
save.setImage(gui.Image.createFromPath(__dirname + '/esave@2x.png'))
save.onClick = () => {
  if (!folder)
    return
  const dialog = gui.FileSaveDialog.create()
  dialog.setFolder(folder)
  dialog.setFilename(filename)
  if (dialog.runForWindow(win)) {
    fs.writeFileSync(String(dialog.getResult()), edit.getText())
  }
}
sidebar.addChildView(save)

sidebar.setStyle({width: sidebar.getPreferredSize().width})

if (process.platform == 'darwin')
  gui.app.setApplicationMenu(menu)
else
  win.setMenuBar(menu)

win.center()
win.activate()

if (!process.versions.yode) {
  gui.MessageLoop.run()
  process.exit(0)
}
