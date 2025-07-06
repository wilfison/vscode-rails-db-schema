import * as vscode from "vscode";

export async function getSchemaUris(): Promise<vscode.Uri[]> {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders === undefined || workspaceFolders.length === 0) {
    return [];
  }

  const schemaFiles = vscode.workspace.findFiles("**/db/*schema.rb", "**/node_modules/**");

  return schemaFiles;
}

export function getCurrentTableName(): string | null {
  // const pluralize = require("pluralize");
  const modelPathRegex = /(?<=models\/)([\s\S]*?)(?=(.rb))/g;

  const currentDocumentPath = vscode.window.activeTextEditor?.document?.fileName;
  const modelPathMatch = currentDocumentPath?.match(modelPathRegex);
  const modelPath = modelPathMatch ? modelPathMatch[0] : null;
  const modelName = modelPath?.replace("/", "_");

  // return modelName ? pluralize(modelName) : null;
  return modelName || null;
}

export function lookForCustomTableName(callback: Function): void {
  const currentDocumentUri = vscode.window.activeTextEditor?.document?.uri;
  if (currentDocumentUri === undefined) {
    callback(null);
    return;
  }

  vscode.workspace.openTextDocument(currentDocumentUri).then((document) => {
    const documentText = document.getText();
    const customTableRegex = /(?<=self\.table_name =)([\s\S]*?)\n/g;

    const customTableMatch = documentText.match(customTableRegex);
    if (customTableMatch === null || customTableMatch.length === 0) {
      callback(null);
      return;
    }

    const customTableText = customTableMatch[0].trim().replace(/'|"/g, "");
    callback(customTableText);
  });
}
