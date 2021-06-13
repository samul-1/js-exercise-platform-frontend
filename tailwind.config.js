module.exports = {
  purge: ['./src/**/*.html', './src/**/*.vue', './src/**/*.jsx'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {}
  },
  variants: {
    extend: {
      borderWidth: ['last'],
      opacity: ['disabled'],
      backgroundColor: ['active']
    }
  },
  plugins: []
}
