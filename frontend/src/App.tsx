import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes'

const App = () => {
  return (
    <>
      <Toaster position="top-center" />
      <AppRoutes/>
    </>
  )
}

export default App
