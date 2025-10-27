import * as clack from '@clack/prompts'
import { getExports, handleClackCancel } from '../utils'

export async function listCommand() {
  try {
    const exports = await getExports()
    const exportKeys = Object.keys(exports)

    const selectedExport = await clack.select({
      message: 'Available exports:',
      options: exportKeys.map(key => ({
        value: key,
        label: key,
      })),
    })

    handleClackCancel(selectedExport)

    // You can add logic here to handle the selected export
    clack.info(`You selected: ${selectedExport}`)
  } catch (error) {
    clack.error('Failed to list exports from package.json')
    console.error(error)
  }
}
