// options for ace code editor component
export const aceEditorOptions = {
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
  fontSize: 17,
  highlightActiveLine: true,
  enableSnippets: true,
  showLineNumbers: true,
  tabSize: 2,
  showPrintMargin: false,
  showGutter: true
}

// vue editor toolbar
export const toolbar = [
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['image']
]

// called upon ace editor component initialization
export function editorInit () {
  require('brace/ext/language_tools') //language extension prerequsite
  require('brace/mode/html')
  require('brace/mode/javascript') //language
  require('brace/mode/less')
  require('brace/theme/monokai') //  theme
  require('brace/snippets/javascript') //snippet
}

// utility function to replace `'s and ```'s with markup to highlight code (inline or
// on their respective block)
export function highlightCode (text) {
  return text
    ?.replace(/```([^`]*)```/g, function (match, code) {
      return (
        `
        <div class="p-2 my-1 text-xs text-white break-all bg-gray-800 rounded-md shadow-sm -mono"><pre class=" language-javascript"><code class=" language-javascript">` +
        code.replace(/<p>/g, '').replace(/(?!^)<\/p>/g, '\n') +
        `</code></pre>
        </div>
      `
      )
    })
    ?.replace(
      /`([^`]*)`/g,
      `
    <div
    class="inline-block p-1 font-mono text-xs text-white break-all bg-gray-800 rounded-md shadow-sm"
    >
      <pre style="line-height: 0.95; overflow-y: hidden" class=" language-javascript"><code style="line-height: 0.5" class=" language-javascript">$1</code></pre>
    </div>
  `
    )
}

// determines how long users have to wait before they are able to send a second submission after they've sent one
export const SUBMIT_COOLDOWN = 10
