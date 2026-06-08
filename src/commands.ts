import * as vscode from 'vscode';
import { aiService } from './aiService';

export async function rewriteCommand() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('请先打开一个文件');
    return;
  }

  const document = editor.document;
  const selection = editor.selection;
  
  if (!selection || selection.isEmpty) {
    vscode.window.showErrorMessage('请先选择要改写的文本');
    return;
  }

  const selectedText = document.getText(selection);
  
  if (!selectedText.trim()) {
    vscode.window.showErrorMessage('请选择要改写的文本');
    return;
  }

  const instruction = await vscode.window.showInputBox({
    prompt: '请输入改写要求',
    placeHolder: '例如：将这段文字改写成古风风格，或者让语气更激昂'
  });

  if (!instruction || !instruction.trim()) {
    vscode.window.showErrorMessage('请输入改写要求');
    return;
  }

  const loading = vscode.window.setStatusBarMessage('正在AI改写中...');

  try {
    const result = await aiService.rewriteNovel(selectedText, instruction);
    if (result) {
      await editor.edit((editBuilder) => {
        editBuilder.replace(selection, result);
      });
      vscode.window.showInformationMessage('文本改写完成');
    } else {
      vscode.window.showErrorMessage('未能获取到改写结果');
    }
  } catch (error) {
    console.error('改写失败:', error);
    vscode.window.showErrorMessage(`改写失败: ${error instanceof Error ? error.message : '未知错误'}`);
  } finally {
    loading.dispose();
  }
}

export async function polishCommand() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('请先打开一个文件');
    return;
  }

  const document = editor.document;
  let selectedText: string;
  let selection: vscode.Selection;

  if (editor.selection && !editor.selection.isEmpty) {
    selection = editor.selection;
    selectedText = document.getText(selection);
  } else {
    selection = new vscode.Selection(0, 0, document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
    selectedText = document.getText();
  }

  if (!selectedText.trim()) {
    vscode.window.showErrorMessage('请选择要润色的文本');
    return;
  }

  const loading = vscode.window.setStatusBarMessage('正在AI润色中...');

  try {
    const result = await aiService.polishNovel(selectedText);
    if (result) {
      await editor.edit((editBuilder) => {
        editBuilder.replace(selection, result);
      });
      vscode.window.showInformationMessage('文本润色完成');
    } else {
      vscode.window.showErrorMessage('未能获取到润色结果');
    }
  } catch (error) {
    console.error('润色失败:', error);
    vscode.window.showErrorMessage(`润色失败: ${error instanceof Error ? error.message : '未知错误'}`);
  } finally {
    loading.dispose();
  }
}

export async function continueCommand() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('请先打开一个文件');
    return;
  }

  const document = editor.document;
  let selectedText: string;
  let position: vscode.Position;

  if (editor.selection && !editor.selection.isEmpty) {
    selectedText = document.getText(editor.selection);
    position = editor.selection.end;
  } else {
    selectedText = document.getText();
    position = new vscode.Position(document.lineCount, 0);
  }

  if (!selectedText.trim()) {
    vscode.window.showErrorMessage('请先编写一些文本作为上下文');
    return;
  }

  const loading = vscode.window.setStatusBarMessage('正在AI续写中...');

  try {
    const result = await aiService.continueNovel(selectedText);
    if (result) {
      await editor.edit((editBuilder) => {
        editBuilder.insert(position, '\n' + result);
      });
      vscode.window.showInformationMessage('小说续写完成');
    } else {
      vscode.window.showErrorMessage('未能获取到续写结果');
    }
  } catch (error) {
    console.error('续写失败:', error);
    vscode.window.showErrorMessage(`续写失败: ${error instanceof Error ? error.message : '未知错误'}`);
  } finally {
    loading.dispose();
  }
}
