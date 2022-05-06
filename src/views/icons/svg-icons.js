const req = require.context('../../icons/svg', true, /\.svg$/)
const requireAll = requireContext => requireContext.keys()

// const re = /\.\/(.*)\.svg/
const re = /\/([\w|-]+)\.svg/

const svgIcons = requireAll(req).map(i => {
  return i.match(re)[1]
})

export default svgIcons
