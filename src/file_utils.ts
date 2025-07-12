import * as vscode from "vscode";

export async function getSchemaUris(): Promise<vscode.Uri[]> {
  const workspaceFolders = vscode.workspace.workspaceFolders;

  if (workspaceFolders === undefined || workspaceFolders.length === 0) {
    return [];
  }

  let schemaFiles = await vscode.workspace.findFiles("**/db/*schema.rb", "**/node_modules/**");
  schemaFiles = schemaFiles.sort((a, b) => a.fsPath.localeCompare(b.fsPath));

  return schemaFiles.reverse();
}

export async function getCurrentTableName(): Promise<string | null> {
  const pluralize = await import("pluralize-esm");
  const modelPathRegex = /(?<=models\/)([\s\S]*?)(?=(.rb))/g;

  const currentDocumentPath = vscode.window.activeTextEditor?.document?.fileName;
  const modelPathMatch = currentDocumentPath?.match(modelPathRegex);
  const modelPath = modelPathMatch ? modelPathMatch[0] : null;
  const modelName = modelPath?.replace("/", "_");

  return modelName ? pluralize.default(modelName) : null;
}

export async function lookForCustomTableName(): Promise<string | null> {
  const document = vscode.window.activeTextEditor?.document;

  if (!document) {
    return null;
  }

  const documentText = document.getText();
  const customTableRegex = /(?<=\.table_name\s*=)([\s\S]*?)\n/g;

  const customTableMatch = documentText.match(customTableRegex);
  if (customTableMatch === null || customTableMatch.length === 0) {
    return null;
  }

  const customTableText = customTableMatch[0].trim().replace(/'|"/g, "");
  return customTableText || null;
}

export function currentDocumentIsModel(): boolean {
  const currentDocument = vscode.window.activeTextEditor?.document;
  if (!currentDocument) {
    return false;
  }

  // Check if the current document is a Ruby file and matches the model file pattern
  return (
    currentDocument.languageId === "ruby" &&
    currentDocument.fileName.match(/models\/.*\.rb$/) !== null
  );
}
