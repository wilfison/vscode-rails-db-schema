import * as vscode from "vscode";

import SchemaExplorer from "./schema_explorer";
import SchemaNode from "./schema_node";

export function activate(context: vscode.ExtensionContext) {
  const schemaExplorer = new SchemaExplorer();
  schemaExplorer.initialize();

  let watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(
      vscode.workspace.workspaceFolders?.[0].uri.path || "",
      "**/*schema.rb"
    )
  );

  watcher.onDidChange(() => {
    schemaExplorer.treeDataProvider.refresh();
  });

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

  context.subscriptions.push(disposable);
}

export function deactivate() {}
