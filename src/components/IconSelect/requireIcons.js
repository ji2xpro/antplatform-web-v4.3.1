const req = require.context('../../icons/svg', true, /\.svg$/)
const requireAll = requireContext => requireContext.keys()

// const re = /\.\/(.*)\.svg/
const re = /\/([\w|-]+)\.svg/

const icons = requireAll(req).map(i => {
  console.log('index：' + i)
  return i.match(re)[1]
})

export default icons
