import * as vscode from 'vscode';
import { aiService } from './aiService';
import { polishCommand, continueCommand } from './commands';

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

  context.subscriptions.push(polishDisposable);
  context.subscriptions.push(continueDisposable);

  const configChangeDisposable = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('openWritePartner')) {
      aiService.configure();
    }
  });

  context.subscriptions.push(configChangeDisposable);
}

export function deactivate() {}
