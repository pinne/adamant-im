import { isValidAddress } from 'ethereumjs-util'
import { Cryptos, isErc20 } from './constants'

const RE_ADM_ADDRESS = /^U([0-9]{6,})$/
const RE_DOGE_ADDRESS = /^D([0-9a-zA-Z]{10,})$/

/**
 * Checks if `address` is a valid address for the specified `crypto`.
 *
 * @param {string} crypto one of 'ADM' or 'ETH'
 * @param {string} address value to check
 * @returns {boolean} `true` if address is valid, `false` otherwise
 */
export default function validateAddress (crypto, address) {
  if (crypto === Cryptos.ADM) {
    return RE_ADM_ADDRESS.test(address)
  } else if (crypto === Cryptos.ETH || isErc20(crypto)) {
    return isValidAddress(address)
  } else if (crypto === Cryptos.DOGE) {
    return RE_DOGE_ADDRESS.test(address)
  }
  return true
}
