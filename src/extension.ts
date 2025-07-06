import * as vscode from "vscode";

import SchemaExplorer from "./schema_explorer";

export function activate(context: vscode.ExtensionContext) {
  new SchemaExplorer(context);
}

export function deactivate() {}
