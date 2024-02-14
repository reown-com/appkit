import { DEVICES } from '../constants/devices'

export function getAvailableDevices(): string[] {
  if (!process.env['CI']) {

    return DEVICES
  }
  
  return DEVICES.filter(d => d !== 'Desktop Safari')
}
