declare const acquireVsCodeApi: <T = unknown>() => {
  getState: () => T
  setState: (data: T) => void
  postMessage: (msg: unknown) => void
}

declare const globalData: Record<string, TreeItem>

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
