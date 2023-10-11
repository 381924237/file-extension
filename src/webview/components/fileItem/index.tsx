import { Show, createSignal } from 'solid-js'
import './index.css'

const vscode = acquireVsCodeApi()

const FileItem = (props: TreeItem) => {
  const [filename, setFilename] = createSignal(props.name)

  const copyFileName = () => {
    navigator.clipboard.writeText(filename()).then(() => {
      vscode.postMessage({
        type: 'toast',
        level: 'info',
        text: '复制成功'
      })
    })
  }

  const copyAbsolutePath = () => {
    navigator.clipboard.writeText(props.absolutePath).then(() => {
      vscode.postMessage({
        type: 'toast',
        level: 'info',
        text: '复制成功'
      })
    })
  }

  const onNameChange = (e: any) => {
    const newName = e.target.value
    vscode.postMessage({
      type: 'rename',
      absolutePath: props.absolutePath,
      newName
    })
    globalData[props.id].absolutePath = globalData[
      props.id
    ].absolutePath.replace(globalData[props.id].name, newName)
    globalData[props.id].name = newName
    setFilename(newName)
  }

  return (
    <div class='file-item'>
      <div class='image'>
        <Show when={!!props.url} fallback={props.ext}>
          <img alt='' src={props.url} />
        </Show>
      </div>
      <div class='info'>
        <div class='name'>
          文件名：
          <input value={filename()} onChange={onNameChange} />
          {/* {filename()} */}
        </div>
        <Show when={!!props.url}>
          <div class='stat'>
            尺寸：{props.width} * {props.height}
          </div>
        </Show>
        <div class='size'>大小：{props.size}</div>
        <div class='btn-list'>
          <div class='copy-name' onClick={copyFileName}>
            复制文件名
          </div>
          <div class='copy-path' onClick={copyAbsolutePath}>
            复制绝对路径
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileItem
