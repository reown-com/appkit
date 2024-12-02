import { createHashRouter, RouterProvider } from 'react-router-dom'
import { Home } from './pages/Home'
import { useSnapshot } from 'valtio'
import { PageController } from './controllers/PageController'
import { ChooseNetwork } from './components/ChooseNetwork'
import { ReactNode } from 'react'

function HomeRoute({ children }: { children: ReactNode }) {
  const { page } = useSnapshot(PageController.state)

  if (!page) {
    return <ChooseNetwork />
  }

  return children
}

const ROUTE_DATA = [
  {
    path: '/',
    element: (
      <HomeRoute>
        <Home />
      </HomeRoute>
    )
  }
]

const router = createHashRouter(ROUTE_DATA)

export function Routes() {
  return <RouterProvider router={router} />
}
