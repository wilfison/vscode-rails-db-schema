import * as vscode from "vscode";

import SchemaNode from "./schema_node";
import SchemaModel from "./schema_model";
import SchemaTreeDataProvider from "./schema_tree_data_provider";

import {
  currentDocumentIsModel,
  getCurrentTableName,
  getSchemaUris,
  lookForCustomTableName,
} from "./file_utils";

class SchemaExplorer {
  public treeDataProvider: SchemaTreeDataProvider;

  private schemaViewer: vscode.TreeView<SchemaNode>;
  private schemaModels: SchemaModel[];
  private currentSchemaModel: SchemaModel;

  constructor() {
    this.schemaModels = [];
    this.currentSchemaModel = new SchemaModel(vscode.Uri.parse("/"));

    this.treeDataProvider = new SchemaTreeDataProvider(this.currentSchemaModel);

    this.schemaViewer = vscode.window.createTreeView("RailsDbSchema", {
      treeDataProvider: this.treeDataProvider,
    });

    this.updateViewTitle();
  }

  public async initialize(): Promise<void> {
    this.schemaModels = await this.createSchemaModels();

    if (this.schemaModels.length > 0) {
      this.currentSchemaModel = this.schemaModels[0];
      this.treeDataProvider.model = this.currentSchemaModel;
    }

    // Define se há múltiplos esquemas para controlar UI
    await vscode.commands.executeCommand(
      "setContext",
      "rails-db-schema.hasMultipleSchemas",
      this.schemaModels.length > 1
    );

    this.updateViewTitle();
    this.reveal();
  }

  public async reveal(): Promise<void> {
    await this.currentSchemaModel.refreshSchema();

    // check if current document is a model file
    if (!currentDocumentIsModel()) {
      this.schemaViewer.reveal(this.currentSchemaModel.data[0], {
        expand: false,
        select: true,
        focus: true,
      });

      return;
    }

    let currentTables = await Promise.all([getCurrentTableName(), lookForCustomTableName()]);
    console.log("Current tables:", currentTables);
    let node = this.getNode(currentTables);

    if (node) {
      this.schemaViewer.reveal(node, { expand: true, select: true, focus: true });
      return;
    }

    this.schemaViewer.reveal(this.currentSchemaModel.data[0], {
      expand: false,
      select: true,
      focus: true,
    });
  }

  private async createSchemaModels(): Promise<SchemaModel[]> {
    const schemaUris = await getSchemaUris();

    return schemaUris.map((uri) => {
      return new SchemaModel(uri);
    });
  }

  public async openInSchema(document: vscode.TextDocument, node: SchemaNode): Promise<void> {
    const lineCount = document.lineCount;
    let tableLine = 0;

    for (let index = 0; index < lineCount; index++) {
      const schemaTextLine = document.lineAt(index);
      if (schemaTextLine.text.trimStart().startsWith(`create_table "${node.label}"`)) {
        tableLine = index;
      }
    }

    const editor = await vscode.window.showTextDocument(document.uri);
    const position = new vscode.Position(tableLine, 0);
    editor.selection = new vscode.Selection(position, position);
    editor.revealRange(editor.selection, vscode.TextEditorRevealType.InCenter);
  }

  private getNode(labels: (string | null)[]): SchemaNode | undefined {
    const validLabels = labels.filter(Boolean) as string[];

    if (validLabels.length === 0) {
      return undefined;
    }

    const schemaNodes = this.currentSchemaModel.data;

    if (schemaNodes.length === 0) {
      return undefined;
    }

    return schemaNodes.find((node) => {
      if (validLabels.includes(node.label)) {
        return node;
      }
    });
  }

  public async searchTables(): Promise<void> {
    const searchTerm = await vscode.window.showInputBox({
      prompt: "Enter search term for table or column names",
      placeHolder: "Search tables and columns...",
    });

    if (searchTerm !== undefined) {
      this.treeDataProvider.setSearchTerm(searchTerm);
      this.updateViewTitle();
    }
  }

  public clearSearch(): void {
    this.treeDataProvider.clearSearch();
    this.updateViewTitle();
  }

  public async selectSchema(): Promise<void> {
    if (this.schemaModels.length <= 1) {
      vscode.window.showInformationMessage("Only one schema file found.");
      return;
    }

    const schemaOptions = this.schemaModels.map((model, index) => {
      const fileName = model.uri.path.split("/").pop() || "Unknown";
      const isActive = model === this.currentSchemaModel ? " ✓" : "";
      const relativePath = vscode.workspace.asRelativePath(model.uri);
      return {
        label: `${fileName}${isActive}`,
        description: relativePath,
        detail: isActive ? "Currently active schema" : undefined,
        index: index,
        model: model,
      };
    });

    const selectedOption = await vscode.window.showQuickPick(schemaOptions, {
      placeHolder: "Select a schema file to work with",
      matchOnDescription: true,
      ignoreFocusOut: true,
    });

    if (selectedOption && selectedOption.model !== this.currentSchemaModel) {
      this.currentSchemaModel = selectedOption.model;
      this.treeDataProvider.model = this.currentSchemaModel;
      this.treeDataProvider.refresh();
      this.updateViewTitle();

      this.reveal();
    }
  }

  public async copyColumnReference(node: SchemaNode): Promise<void> {
    let tableName: string;
    let fieldName: string = `.${node.label}`;

    // Usa o tableName se disponível, senão tenta usar o parent
    if (node.tableName) {
      tableName = node.tableName;
    } else if (node.parent && node.parent.isTable) {
      tableName = node.parent.label;
    } else {
      // Fallback: procura a tabela que contém esta coluna
      const allTables = this.currentSchemaModel.data;
      tableName = "unknown_table";

      for (const table of allTables) {
        if (table.children.some((child) => child.label === node.label)) {
          tableName = table.label;
          break;
        }
      }

      if (tableName === "unknown_table") {
        fieldName = node.label;
        return;
      }
    }

    const reference = `${tableName}${fieldName}`;
    await vscode.env.clipboard.writeText(reference);
    vscode.window.showInformationMessage(`Copied: ${reference}`);
  }

  private updateViewTitle(): void {
    let title = "";

    // Mostra o nome do schema atual se há múltiplos schemas
    if (this.schemaModels.length > 1) {
      const schemaName = this.currentSchemaModel.uri.path.split("/").pop() || "schema.rb";
      title = `${schemaName}`;
    }

    // Adiciona informação de filtro se estiver filtrado
    if (this.treeDataProvider.isFiltered) {
      const filterInfo = `(Filtered: "${this.treeDataProvider.currentSearchTerm}")`;
      title = title ? `${title} ${filterInfo}` : filterInfo;
    }

    this.schemaViewer.title = title;
  }
}

export default SchemaExplorer;
