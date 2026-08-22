import { defineConfig, type Plugin } from 'vite'

// 98.css ships `@media (not(hover))`, which lightningcss rejects as invalid
// CSS during minification. Insert the missing space before it gets there.
function fix98cssMediaQuery(): Plugin {
  return {
    name: 'fix-98css-media-query',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('98.css')) return null
      return code.replaceAll('(not(hover))', '(not (hover))')
    },
  }
}

export default defineConfig({
  plugins: [fix98cssMediaQuery()],
})
