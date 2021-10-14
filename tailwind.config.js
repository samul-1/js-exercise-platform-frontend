module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx',
    './src/**/*.js'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {}
  },
  variants: {
    extend: {
      borderWidth: ['last'],
      opacity: ['disabled'],
      backgroundOpacity: ['disabled'],
      backgroundColor: ['active'],
      cursor: ['disabled']
    }
  },
  plugins: []
}
