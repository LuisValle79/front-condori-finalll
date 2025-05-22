
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: undefined,
  entryPointToBrowserMapping: {
  "node_modules/html2canvas/dist/html2canvas.js": [
    {
      "path": "chunk-SWBZ2T66.js",
      "dynamicImport": false
    }
  ],
  "node_modules/dompurify/dist/purify.es.mjs": [
    {
      "path": "chunk-QPCAL7IA.js",
      "dynamicImport": false
    }
  ],
  "node_modules/canvg/lib/index.es.js": [
    {
      "path": "chunk-L2OSWPB4.js",
      "dynamicImport": false
    }
  ]
},
  assets: {
    'index.csr.html': {size: 66053, hash: '5505df25ed0841630ceaa7e69adfc591f2bc01532ea75ce03042558d51bba0c1', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 18004, hash: '135831874dbbaa52ebaab4b4b60f03133fc11faa603a5f5bd383c617a786756d', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-Q77SJWRH.css': {size: 3054665, hash: 'kpyPMoKcsKU', text: () => import('./assets-chunks/styles-Q77SJWRH_css.mjs').then(m => m.default)}
  },
};
