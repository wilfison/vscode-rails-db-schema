import * as vscode from "vscode";

import SchemaExplorer from "./schema_explorer";
import SchemaNode from "./schema_node";
import { currentDocumentIsModel } from "./file_utils";

export function activate(context: vscode.ExtensionContext) {
  const schemaExplorer = new SchemaExplorer();
  schemaExplorer.initialize();

  let refreshTimeout: NodeJS.Timeout | undefined;
  const DEBOUNCE_DELAY = 1000; // 1 second delay

  const createWatchers = () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return [];
    }

    return workspaceFolders.map((folder) =>
      vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(folder.uri.path, "**/db/*schema.rb")
      )
    );
  };

  const debouncedRefresh = () => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    refreshTimeout = setTimeout(() => {
      schemaExplorer.treeDataProvider.refresh();
      refreshTimeout = undefined;
    }, DEBOUNCE_DELAY);
  };

  const watchers = createWatchers();

  watchers.forEach((watcher) => {
    watcher.onDidChange(debouncedRefresh);
    watcher.onDidCreate(debouncedRefresh);
    watcher.onDidDelete(debouncedRefresh);
    context.subscriptions.push(watcher);
  });

  let revealTimeout: NodeJS.Timeout | undefined;
  const REVEAL_DEBOUNCE_DELAY = 300;

  const onDidChangeActiveEditor = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
    if (revealTimeout) {
      clearTimeout(revealTimeout);
    }

    revealTimeout = setTimeout(async () => {
      if (editor && editor.document) {
        if (currentDocumentIsModel() && schemaExplorer.isViewVisible()) {
          await schemaExplorer.revealTables();
        }
      }
      revealTimeout = undefined;
    }, REVEAL_DEBOUNCE_DELAY);
  });

  context.subscriptions.push(onDidChangeActiveEditor);

  let disposable = vscode.commands.registerCommand("rails-db-schema.showRailsDbSchema", () =>
    schemaExplorer.reveal()
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("rails-db-schema.openInSchema", async (node: SchemaNode) => {
      if (node.schemaUri === undefined) {
        return;
      }

      const document = await vscode.workspace.openTextDocument(node.schemaUri);
      schemaExplorer.openInSchema(document, node);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("rails-db-schema.searchTables", () => {
      schemaExplorer.searchTables();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("rails-db-schema.clearSearch", () => {
      schemaExplorer.clearSearch();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("rails-db-schema.selectSchema", () => {
      schemaExplorer.selectSchema();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("rails-db-schema.copyColumnReference", (node: SchemaNode) => {
      schemaExplorer.copyColumnReference(node);
    })
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
