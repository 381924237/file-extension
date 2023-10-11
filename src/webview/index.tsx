import { render } from 'solid-js/web'
import { For, createSignal, Show } from 'solid-js'
import DirMenu from './components/dirMenu'
import FileItem from './components/fileItem'
import './index.css'

const App = () => {
  const [currentDir, setCurrentDir] = createSignal('0')
  const childrens = () => globalData[currentDir()].childrens

  return (
    <div class='container'>
      <DirMenu currentDir={currentDir()} setCurrentDir={setCurrentDir} />
      <div class='content-wrap'>
        <For each={childrens()}>
          {(id) => (
            <Show when={globalData[id].childrens.length === 0}>
              <FileItem {...globalData[id]} />
            </Show>
          )}
        </For>
      </div>
    </div>
  )
}

render(() => <App />, document.getElementById('root')!)
