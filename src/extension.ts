import * as vscode from "vscode";

import SchemaExplorer from "./schema_explorer";
import SchemaNode from "./schema_node";
import { currentDocumentIsModel } from "./utils/files";
import { debaunce } from "./utils/debaunce";

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
        new vscode.RelativePattern(folder.uri.path, "**/db/*schema.rb")
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
    if (editor?.document && currentDocumentIsModel() && schemaExplorer.isViewVisible()) {
      await schemaExplorer.revealTables();
    }
  }, 300);

  const onDidChangeActiveEditor = vscode.window.onDidChangeActiveTextEditor(debaunceModel);
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
    vscode.commands.registerCommand("rails-db-schema.copyReference", (node: SchemaNode) => {
      schemaExplorer.copyReference(node);
    })
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
