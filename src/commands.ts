import * as vscode from 'vscode';
import { aiService } from './aiService';

function getPresets(configKey: string): { [key: string]: string } {
  const config = vscode.workspace.getConfiguration('openWritePartner');
  const presets = config.get<{ [key: string]: string }>(configKey, {});
  return presets || {};
}

function getDefaultPrompt(configKey: string): string {
  const config = vscode.workspace.getConfiguration('openWritePartner');
  return config.get<string>(configKey, '');
}

async function selectPrompt(
  presetsKey: string,
  defaultPromptKey: string,
  title: string
): Promise<string | undefined> {
  const presets = getPresets(presetsKey);
  const defaultPrompt = getDefaultPrompt(defaultPromptKey);

  const items: vscode.QuickPickItem[] = [];

  for (const name of Object.keys(presets)) {
    const content = presets[name];
    const preview = content.length > 50 ? content.substring(0, 50) + '...' : content;
    items.push({
      label: `$(check) ${name}`,
      description: preview,
      detail: content
    });
  }

  if (defaultPrompt && defaultPrompt.trim().length > 0) {
    const preview = defaultPrompt.length > 50 ? defaultPrompt.substring(0, 50) + '...' : defaultPrompt;
    items.push({
      label: '$(gear) 使用默认提示词',
      description: preview,
      detail: defaultPrompt
    });
  }

  items.push({
    label: '$(edit) 本次临时输入提示词',
    description: '临时使用一次自定义提示词，不保存',
    detail: ''
  });

  const selected = await vscode.window.showQuickPick(items, {
    title: title,
    placeHolder: '选择一个提示词预设',
    matchOnDetail: true,
    matchOnDescription: true
  });

  if (!selected) {
    return undefined;
  }

  if (selected.label.includes('本次临时输入')) {
    const input = await vscode.window.showInputBox({
      prompt: '请输入本次使用的系统提示词',
      placeHolder: '例如：你是一位专业的文学编辑...',
      value: ''
    });
    if (!input || !input.trim()) {
      return undefined;
    }
    return input;
  }

  return selected.detail;
}

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

  const prompt = await selectPrompt(
    'rewritePresets',
    'rewritePrompt',
    '选择 AI 改写的提示词预设'
  );

  if (!prompt) {
    return;
  }

  let systemPrompt = prompt;

  // 只有当预设中含有 {instruction} 占位符时，才询问用户补充改写要求
  if (prompt.includes('{instruction}')) {
    const instruction = await vscode.window.showInputBox({
      prompt: '请输入改写要求',
      placeHolder: '例如：改写成古风风格 / 让对话更幽默'
    });

    const instructionText = instruction && instruction.trim() ? instruction.trim() : '按预设要求改写';
    systemPrompt = prompt.replace('{instruction}', instructionText);
  }

  const loading = vscode.window.setStatusBarMessage('正在AI改写中...');

  try {
    const result = await aiService.rewriteNovelWithPrompt(selectedText, systemPrompt);
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

  const prompt = await selectPrompt(
    'polishPresets',
    'polishPrompt',
    '选择 AI 润色的提示词预设'
  );

  if (!prompt) {
    return;
  }

  const loading = vscode.window.setStatusBarMessage('正在AI润色中...');

  try {
    const result = await aiService.polishNovelWithPrompt(selectedText, prompt);
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

  const prompt = await selectPrompt(
    'reviewPresets',
    'reviewPrompt',
    '选择 AI 审稿的提示词预设'
  );

  if (!prompt) {
    return;
  }

  const loading = vscode.window.setStatusBarMessage('正在AI审稿中...');

  try {
    const result = await aiService.reviewNovelWithPrompt(selectedText, prompt);
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
