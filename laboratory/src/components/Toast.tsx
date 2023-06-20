import { toast, Toaster } from 'react-hot-toast'

export const showToast = toast

export default function Toast() {
  return (
    <Toaster
      toastOptions={{
        position: 'bottom-right',
        style: {
          borderRadius: '16px',
          background: 'linear-gradient(97.02deg, #272A2A 0%, #141414 100%)',
          color: '#ffffff',
          border: '1px solid #585f5f',
          paddingTop: '12px',
          paddingBottom: '10px',
          paddingLeft: '16px',
          paddingRight: '16px'
        },
        error: {
          style: {
            borderColor: '#ff974c'
          }
        },
        success: {
          style: {
            borderColor: '#2bee4b'
          }
        }
      }}
    />
  )
}
