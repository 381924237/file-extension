import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import imgSize from 'image-size'

type TreeItem = {
  id: string
  parentId: string | null
  childrens: string[]
  absolutePath: string
  name: string
  ext?: string
  url?: string
  width?: number
  height?: number
  size?: string
}

const EXT_LIST = ['webp', 'png', 'jpg', 'jpeg', 'svg']

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'picturePreview_2',
    (innerContext) => {
      const panel = vscode.window.createWebviewPanel(
        'webview',
        '图片预览',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      )

      const obj = generateFlatObj(innerContext.path, panel.webview)

      panel.webview.html = getWebviewContent(context, panel.webview, obj)

      panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.type) {
            case 'toast':
              handleToastMessage(message)
              break
            case 'rename':
              handleRenameFile(message)
              break
            default:
              break
          }
        },
        undefined,
        context.subscriptions
      )
    }
  )

  context.subscriptions.push(disposable)
}

const getWebviewContent = (
  context: vscode.ExtensionContext,
  webview: vscode.Webview,
  flatObj: Record<string, TreeItem>
) => {
  const jsFileName = 'webview.js'
  const cssFileName = 'webview.css'
  const localServerUrl = 'http://localhost:7777'

  let scriptUrl = `${localServerUrl}/${jsFileName}`
  let cssUrl = `${localServerUrl}/${cssFileName}`

  if (context.extensionMode === vscode.ExtensionMode.Production) {
    scriptUrl = webview
      .asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'out', jsFileName))
      )
      .toString()
    cssUrl = webview
      .asWebviewUri(
        vscode.Uri.file(path.join(context.extensionPath, 'out', cssFileName))
      )
      .toString()
  }

  const json = JSON.stringify(flatObj)

  return `<!doctype html>
  <html lang="en">
  
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="${cssUrl}" rel="stylesheet">
    <script>window.globalData=${json}</script>
  </head>
  
  <body>
    <div id="root"></div>
    <script src="${scriptUrl}"></script>
  </body>
  
  </html>`
}

const generateFlatObj = (dirPath: string, webview: vscode.Webview) => {
  let flatObj: Record<string, TreeItem> = {}

  const handleNode = (
    nodePath: string,
    id: string,
    parentId: string | null
  ) => {
    const stat = fs.statSync(nodePath)
    const obj: TreeItem = {
      id,
      parentId,
      absolutePath: nodePath,
      name: path.basename(nodePath),
      childrens: []
    }
    flatObj[id] = obj
    if (stat.isDirectory()) {
      fs.readdirSync(nodePath)
        .filter((file) => !file.startsWith('.'))
        .forEach((item, index) => {
          const childPath = path.join(nodePath, item)
          const childId = `${id}-${index}`
          obj.childrens.push(childId)
          handleNode(childPath, childId, id)
        })
    } else {
      const ext = path.extname(nodePath).split('.')[1]
      obj.ext = ext
      obj.size = formatBytes(stat.size)
      if (EXT_LIST.includes(ext)) {
        const url = webview.asWebviewUri(vscode.Uri.file(nodePath)).toString()
        const dimensions = imgSize(nodePath)
        const { width = 0, height = 0 } = dimensions || {}
        obj.url = url
        obj.width = width
        obj.height = height
      }
    }
  }
  handleNode(dirPath, '0', null)

  return flatObj
}

const formatBytes = (bytes = 0, decimals = 0) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1000
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const handleToastMessage = (params: Record<string, any>) => {
  vscode.window.setStatusBarMessage(params.text, 1000)
}

const handleRenameFile = (params: Record<string, any>) => {
  const { absolutePath, newName } = params
  const source = vscode.Uri.file(absolutePath)
  const target = vscode.Uri.file(path.join(path.dirname(absolutePath), newName))
  vscode.workspace.fs.rename(source, target, { overwrite: true }).then(() => {
    vscode.window.setStatusBarMessage('修改成功', 1000)
  })
}
