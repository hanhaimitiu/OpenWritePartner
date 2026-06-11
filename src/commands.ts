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

export async function reviewCommand() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('请先打开一个文件');
    return;
  }

  const document = editor.document;
  let selectedText: string;

  if (editor.selection && !editor.selection.isEmpty) {
    selectedText = document.getText(editor.selection);
  } else {
    selectedText = document.getText();
  }

  if (!selectedText.trim()) {
    vscode.window.showErrorMessage('请选择要审稿的文本');
    return;
  }

  const loading = vscode.window.setStatusBarMessage('正在AI审稿中...');

  try {
    const result = await aiService.reviewNovel(selectedText);
    if (result) {
      const panel = vscode.window.createOutputChannel('AI审稿结果');
      panel.clear();
      panel.appendLine(result);
      panel.show();
      vscode.window.showInformationMessage('审稿完成，结果已显示在输出面板中');
    } else {
      vscode.window.showErrorMessage('未能获取到审稿结果');
    }
  } catch (error) {
    console.error('审稿失败:', error);
    vscode.window.showErrorMessage(`审稿失败: ${error instanceof Error ? error.message : '未知错误'}`);
  } finally {
    loading.dispose();
  }
}
