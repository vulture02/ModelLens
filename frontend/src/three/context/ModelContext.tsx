import { createContext, useContext, useState } from "react"

export type ModelType = "glb" | "gltf" | "fbx" | "obj" | "stl"

type ModelContextType = {
  modelUrl: string | null
  modelType: ModelType | null
  setModel: (url: string, type: ModelType) => void
  clearModel: () => void
}

const ModelContext = createContext<ModelContextType | null>(null)

export const ModelProvider = ({ children }: { children: React.ReactNode }) => {
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [modelType, setModelType] = useState<ModelType | null>(null)

  const setModel = (url: string, type: ModelType) => {
    setModelUrl(url)
    setModelType(type)
  }

  const clearModel = () => {
    setModelUrl(null)
    setModelType(null)
  }

  return (
    <ModelContext.Provider value={{ modelUrl, modelType, setModel, clearModel }}>
      {children}
    </ModelContext.Provider>
  )
}

export const useModel = () => {
  const ctx = useContext(ModelContext)
  if (!ctx) {
    throw new Error("useModel must be used inside ModelProvider")
  }
  return ctx
}