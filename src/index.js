const vscode = require('vscode')
const DICTQuery = require('./query')
const formatter = require('./format')

const markdownHeader = `翻译 \`$word\` :  
`
const markdownFooter = `  
`
const markdownLine = `  
*****
`

const genMarkdown = function (word, translation, p) {
  if (!translation && !p) {
    return `- [${word}](https://translate.google.com?text=${word}) :  
本地词库暂无结果 , 查看 [Google翻译](https://translate.google.com?text=${word}) [百度翻译](https://fanyi.baidu.com/#en/zh/${word})`
  }
  return `- [${word}](https://translate.google.com?text=${word}) ${p ? '*/' + p + '/*' : ''}:  
${translation.replace(/\\n/g, `  
`)}`
}

function init(context) {
  // The `vscode.TextEditorDecorationType` object should only be created once
  // Otherwise, the hoverMessage will be displayed repeatedly
  const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: new vscode.ThemeColor('editor.background'),
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
  });
  context.subscriptions.push(
    vscode.commands.registerCommand('word-translation.translate',
      async function(){
        //1.generate tranlation `hoverMessage`
        const editor = vscode.window.activeTextEditor
        const selectedText = editor.document.getText(editor.selection)
        const originText = formatter.cleanWord(selectedText)
        const header = markdownHeader.replace('$word', originText)
        const hoverMessage = new vscode.MarkdownString(header)
        const words = formatter.getWordArray(originText)
        for (const i in words) {
          let word = words[i]
          let ret = await DICTQuery(word)
          if (i == 0) {
            hoverMessage.appendMarkdown(genMarkdown(word, ret.w, ret.p))
          } else {
            hoverMessage.appendMarkdown(markdownLine + genMarkdown(word, ret.w, ret.p))
          }
        }
        hoverMessage.appendMarkdown(markdownFooter)
        hoverMessage.isTrusted = true

        //2.set `hoverMessage` decoration to editor
        const range = new vscode.Range(editor.selection.start, editor.selection.end)
        const decorationOptions = [{range, hoverMessage}]
        editor.setDecorations(decorationType, decorationOptions)
        vscode.commands.executeCommand('editor.action.showHover') //display the translation decoration
        editor.setDecorations(decorationType, []) //clear the translation decoration after display
      }
    )
  )
}


module.exports = {
  init
}
