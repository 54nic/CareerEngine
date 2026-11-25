/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro SC"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
        serif: ['"Songti SC"', '"STSong"', 'SimSun', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
