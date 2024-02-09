import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.paste-stack', () => {
        vscode.env.clipboard.readText().then((clipboardText) => {
            if (!clipboardText) {
                vscode.window.showInformationMessage('Clipboard is empty');
                return;
            }

            let outputText = '';

            // 检查字符串是否可能是 JSON
            if (clipboardText.trim().startsWith('{') && clipboardText.trim().endsWith('}')) {
                try {
                    // 尝试将剪贴板文本解析为 JSON
                    const json = JSON.parse(clipboardText);

                    // 遍历 JSON 对象的每个键值对
                    for (const [key, value] of Object.entries(json)) {
                        // 对 value 进行处理
                        let processedValue = typeof value === 'string' ? processText(value) : value;
                        // 构造输出文本
                        outputText += `[${key}]\n${processedValue}\n--------------\n`;
                    }
                } catch (e) {
                    // 如果解析出错，则按原样处理文本
                    outputText = processText(clipboardText);
                }
            } else {
                // 如果不是 JSON 格式，直接处理文本
                outputText = processText(clipboardText);
            }

            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const selection = editor.selection;

                // 在编辑器中插入处理后的文本
                editor.edit(editBuilder => {
                    editBuilder.replace(selection, outputText);
                });
            } else {
                vscode.window.showInformationMessage('No active editor');
            }
        });
    });

    context.subscriptions.push(disposable);
}

function processText(text: string): string {
    // 替换 \\n 为换行符 \n 和 \\t 为制表符 \t
    return text.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}

export function deactivate() {}