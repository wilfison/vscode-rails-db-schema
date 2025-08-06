import * as vscode from "vscode";

import SchemaModel from "./schema_model.js";
import SchemaNode from "./schema_node.js";

const ICONS = {
  table: new vscode.ThemeIcon("table"),
  field: new vscode.ThemeIcon("layout-centered"),
  primaryKey: new vscode.ThemeIcon("key", new vscode.ThemeColor("list.warningForeground")),
};

export default class SchemaTreeDataProvider implements vscode.TreeDataProvider<SchemaNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<SchemaNode | undefined | null | void> =
    new vscode.EventEmitter<SchemaNode | undefined | null | void>();

  readonly onDidChangeTreeData: vscode.Event<SchemaNode | undefined | null | void> =
    this._onDidChangeTreeData.event;

  public searchTerm: string = "";

  constructor(public model: SchemaModel) {}

  public get currentSearchTerm(): string {
    return this.searchTerm;
  }

  public get isFiltered(): boolean {
    return this.searchTerm.length > 0;
  }

  public refresh(): any {
    this.model.refreshSchema();
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: SchemaNode): vscode.TreeItem {
    if (element.label.includes("result(s) for") || element.label.includes("No results for")) {
      return {
        label: element.label,
        description: element.description,
        tooltip: element.tooltip,
        contextValue: "searchInfo",
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        iconPath: element.label.includes("No results")
          ? new vscode.ThemeIcon("warning", new vscode.ThemeColor("list.warningForeground"))
          : new vscode.ThemeIcon("search", new vscode.ThemeColor("list.highlightForeground")),
      };
    }

    return {
      label: element.type ? `${element.label} (${element.type})` : element.label,
      description: element.description,
      tooltip: element.tooltip,
      contextValue: element.isTable ? "schemaTable" : "schemaField",
      collapsibleState: element.isTable ? vscode.TreeItemCollapsibleState.Collapsed : void 0,
      iconPath: this.getIconForNode(element),
    };
  }

  public getChildren(element?: SchemaNode): SchemaNode[] | Thenable<SchemaNode[]> {
    if (element) {
      return element.children;
    }

    if (this.searchTerm) {
      const filteredTables = this.getFilteredTables();

      if (filteredTables.length === 0) {
        return [this.createNoResultsNode()];
      }

      return [this.createSearchSummaryNode(filteredTables.length), ...filteredTables];
    }

    return this.model.data;
  }

  public setSearchTerm(searchTerm: string): void {
    this.searchTerm = searchTerm.toLowerCase();
    vscode.commands.executeCommand(
      "setContext",
      "rails-schemas.hasActiveSearch",
      searchTerm.length > 0
    );
    this._onDidChangeTreeData.fire();
  }

  public clearSearch(): void {
    this.searchTerm = "";
    vscode.commands.executeCommand("setContext", "rails-schemas.hasActiveSearch", false);
    this._onDidChangeTreeData.fire();
  }

  private getFilteredTables(): SchemaNode[] {
    return this.model.data.filter((table) => {
      if (table.label.toLowerCase().includes(this.searchTerm)) {
        return true;
      }

      return table.children.some((column) => column.label.toLowerCase().includes(this.searchTerm));
    });
  }

  public getParent(element: SchemaNode): SchemaNode | undefined {
    return element.parent;
  }

  private getIconForNode(node: SchemaNode): vscode.ThemeIcon {
    if (node.isTable) {
      return ICONS.table;
    } else if (node.isPrimaryKey) {
      return ICONS.primaryKey;
    } else {
      return ICONS.field;
    }
  }

  private createSearchSummaryNode(resultCount: number): SchemaNode {
    return {
      label: `${resultCount} result(s) for "${this.searchTerm}"`,
      type: null,
      description: "",
      tooltip: `${resultCount} tables match the search term "${this.searchTerm}"`,
      isTable: false,
      isPrimaryKey: false,
      children: [],
      parent: undefined,
      schemaUri: undefined,
      tableName: "",
    };
  }

  private createNoResultsNode(): SchemaNode {
    return {
      label: `No results for "${this.searchTerm}"`,
      type: null,
      description: "",
      tooltip: `No tables or columns match the search term "${this.searchTerm}"`,
      isTable: false,
      isPrimaryKey: false,
      children: [],
      parent: undefined,
      schemaUri: undefined,
      tableName: "",
    };
  }
}
