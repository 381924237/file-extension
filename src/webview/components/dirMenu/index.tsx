import { For, createSignal, Setter } from 'solid-js'
import './index.css'

const dirList = Object.keys(globalData).filter(
  (id) => globalData[id].childrens.length > 0
)

const DirMenu = (props: {
  currentDir: string
  setCurrentDir: Setter<string>
}) => {
  return (
    <div class='dir-menu'>
      <For each={dirList}>
        {(id: string) => (
          <div class='dir-item' onClick={[props.setCurrentDir, id]}>
            <For each={id.split('-')}>{() => <span class='gap' />}</For>
            <span
              classList={{
                'dir-name': true,
                active: props.currentDir === id
              }}
            >
              {globalData[id].name}
            </span>
          </div>
        )}
      </For>
    </div>
  )
}

export default DirMenu
