import * as vscode from 'vscode';

import SchemaExplorer from './schema_explorer.js';
import SchemaNode from './schema_node.js';
import { currentDocumentIsModel } from './utils/files.js';
import { debaunce } from './utils/debaunce.js';
import { getConfig } from './utils/config.js';

export function activate(context: vscode.ExtensionContext) {
  const schemaExplorer = new SchemaExplorer();
  schemaExplorer.initialize();

  const createWatchers = () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return [];
    }

    return workspaceFolders.map((folder) =>
      vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(folder.uri.path, '**/db/*schema.rb')
      )
    );
  };

  const debouncedRefresh = debaunce(() => {
    schemaExplorer.treeDataProvider.refresh();
  }, 1000);

  const watchers = createWatchers();

  watchers.forEach((watcher) => {
    watcher.onDidChange(debouncedRefresh);
    watcher.onDidCreate(debouncedRefresh);
    watcher.onDidDelete(debouncedRefresh);
    context.subscriptions.push(watcher);
  });

  // Automatically reveal model table when the active editor changes
  const debaunceModel = debaunce(async (editor) => {
    const config = getConfig();
    if (
      config.autoReveal &&
      editor?.document &&
      currentDocumentIsModel() &&
      schemaExplorer.isViewVisible()
    ) {
      await schemaExplorer.revealTables();
    }
  }, 300);

  const onDidChangeActiveEditor = vscode.window.onDidChangeActiveTextEditor(debaunceModel);
  context.subscriptions.push(onDidChangeActiveEditor);

  // Reload tree when configuration changes
  const onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration((event) => {
    if (
      event.affectsConfiguration('rails-schemas.showIndexes') ||
      event.affectsConfiguration('rails-schemas.showTimestamps') ||
      event.affectsConfiguration('rails-schemas.showRailsTables')
    ) {
      schemaExplorer.treeDataProvider.refresh();
    }
  });
  context.subscriptions.push(onDidChangeConfiguration);

  let disposable = vscode.commands.registerCommand('rails-schemas.showRailsDbSchema', () =>
    schemaExplorer.reveal()
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('rails-schemas.openInSchema', async (node: SchemaNode) => {
      if (node.schemaUri === undefined) {
        return;
      }

      const document = await vscode.workspace.openTextDocument(node.schemaUri);
      schemaExplorer.openInSchema(document, node);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('rails-schemas.searchTables', () => {
      schemaExplorer.searchTables();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('rails-schemas.clearSearch', () => {
      schemaExplorer.clearSearch();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('rails-schemas.selectSchema', () => {
      schemaExplorer.selectSchema();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('rails-schemas.copyReference', (node: SchemaNode) => {
      schemaExplorer.copyReference(node);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('rails-schemas.copyColumnNames', (node: SchemaNode) => {
      schemaExplorer.copyColumnNames(node);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('rails-schemas.showStatistics', () => {
      schemaExplorer.showStatistics();
    })
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
