import { getPackageInfo } from './version'

describe('getPackageInfo', () => {
  it('le nome e versao do package.json', () => {
    const { name, version } = getPackageInfo()

    expect(name).toBe('exemplo-ci')
    expect(version).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
