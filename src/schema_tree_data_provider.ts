import * as vscode from "vscode";

import SchemaModel from "./schema_model.js";
import SchemaNode from "./schema_node.js";

const ICONS = {
  table: new vscode.ThemeIcon("table"),
  field: new vscode.ThemeIcon("layout-centered"),
  primaryKey: new vscode.ThemeIcon("key", new vscode.ThemeColor("list.warningForeground")),
  index: new vscode.ThemeIcon("symbol-property", new vscode.ThemeColor("charts.red")),
  uniqueIndex: new vscode.ThemeIcon("key", new vscode.ThemeColor("charts.red")),
  // icons by column type
  string: new vscode.ThemeIcon("symbol-text", new vscode.ThemeColor("charts.blue")),
  text: new vscode.ThemeIcon("symbol-parameter", new vscode.ThemeColor("charts.blue")),
  integer: new vscode.ThemeIcon("symbol-number", new vscode.ThemeColor("charts.yellow")),
  float: new vscode.ThemeIcon("regex", new vscode.ThemeColor("charts.yellow")),
  boolean: new vscode.ThemeIcon("symbol-boolean", new vscode.ThemeColor("charts.green")),
  date: new vscode.ThemeIcon("calendar", new vscode.ThemeColor("charts.purple")),
  datetime: new vscode.ThemeIcon("clock", new vscode.ThemeColor("charts.purple")),
  json: new vscode.ThemeIcon("symbol-object", new vscode.ThemeColor("charts.orange")),
};

const TYPE_ICON_MAP: { [key: string]: vscode.ThemeIcon } = {
  string: ICONS.string,
  text: ICONS.text,
  text_basic: ICONS.text,
  integer: ICONS.integer,
  boolean: ICONS.boolean,
  date: ICONS.date,
  datetime: ICONS.datetime,
  dateonly: ICONS.date,
  timestamp: ICONS.datetime,
  varchar: ICONS.string,
  int: ICONS.integer,
  bigint: ICONS.integer,
  decimal: ICONS.float,
  float: ICONS.float,
  double: ICONS.float,
  bool: ICONS.boolean,
  json: ICONS.json,
  jsonb: ICONS.json,
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

    const contextValue = element.isTable
      ? "schemaTable"
      : element.isIndex
      ? "schemaIndex"
      : "schemaField";

    return {
      label:
        element.type && !element.isIndex ? `${element.label} (${element.type})` : element.label,
      description: element.description,
      tooltip: element.tooltip,
      contextValue: contextValue,
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

      return table.children.some((child) => {
        if (child.label.toLowerCase().includes(this.searchTerm)) {
          return true;
        }
        // Para índices, também buscar nas colunas do índice
        if (child.isIndex && child.indexColumns) {
          return child.indexColumns.some((col) => col.toLowerCase().includes(this.searchTerm));
        }
        return false;
      });
    });
  }

  public getParent(element: SchemaNode): SchemaNode | undefined {
    return element.parent;
  }

  private getIconForNode(node: SchemaNode): vscode.ThemeIcon {
    if (node.isTable) {
      return ICONS.table;
    } else if (node.isIndex) {
      return node.isUnique ? ICONS.uniqueIndex : ICONS.index;
    } else if (node.isPrimaryKey) {
      return ICONS.primaryKey;
    } else if (node.type && TYPE_ICON_MAP[node.type]) {
      return TYPE_ICON_MAP[node.type];
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
