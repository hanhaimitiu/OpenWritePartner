import * as vscode from 'vscode';
import { aiService } from './aiService';
import { polishCommand, continueCommand, rewriteCommand } from './commands';

export function activate(context: vscode.ExtensionContext) {
  aiService.configure();

  const polishDisposable = vscode.commands.registerCommand(
    'open-write-partner.polish',
    polishCommand
  );

  const continueDisposable = vscode.commands.registerCommand(
    'open-write-partner.continue',
    continueCommand
  );

  const rewriteDisposable = vscode.commands.registerCommand(
    'open-write-partner.rewrite',
    rewriteCommand
  );

  context.subscriptions.push(polishDisposable);
  context.subscriptions.push(continueDisposable);
  context.subscriptions.push(rewriteDisposable);

  const configChangeDisposable = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('openWritePartner')) {
      aiService.configure();
    }
  });

  context.subscriptions.push(configChangeDisposable);
}

export function deactivate() {}
