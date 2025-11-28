import * as vscode from "vscode";
import SchemaNode, { SchemaColumnAttributes } from "./schema_node.js";
import { filterColumnAttributes } from "./utils/columns.js";
import { rubyHashToJson } from "./utils/json.js";

export default class SchemaModel {
  public data: SchemaNode[];
  public readonly uri: vscode.Uri;

  constructor(uri: vscode.Uri) {
    this.data = [];
    this.uri = uri;
  }

  public schemaFIleName(): string {
    return this.uri.fsPath.split("/").pop() || "schema.rb";
  }

  public async refreshSchema(): Promise<void> {
    this.data = [];

    await this.getRailsSchema();
  }

  public async getRailsSchema(): Promise<void> {
    if (this.uri.fsPath === "/") {
      return;
    }

    const document = await vscode.workspace.openTextDocument(this.uri);

    try {
      const schemaText = document.getText();
      const tablesRegex = /create_table([\s\S]*?)(  end)/g;
      const tablesRegexMatch = schemaText.match(tablesRegex);

      if (tablesRegexMatch === null || tablesRegexMatch.length === 0) {
        return;
      }

      const schemaNodes = this.getSchemaNodes(tablesRegexMatch);
      this.data = schemaNodes;
    } catch (err) {
      vscode.window.showInformationMessage(`Error parsing schema file: ${this.schemaFIleName()}`);
      throw err;
    }
  }

  private getSchemaNodes(tablesRegexMatch: RegExpMatchArray): SchemaNode[] {
    const tableNameRegex = /(?<=create_table ")([\s\S]*?)(?=("))/g;
    const tableDefinitionRegex = /(?=create_table )([\s\S]*?)(do)/g;
    const commentsInfoRegex = /(?=comment: )([\s\S]*?)(?=(" do)|(",))/;

    return tablesRegexMatch.map((tableText) => {
      const tableLableMatch = tableText.match(tableNameRegex);
      const tableDefinitionMatch = tableText.match(tableDefinitionRegex);
      const commentsInfo = tableDefinitionMatch
        ? tableDefinitionMatch[0].match(commentsInfoRegex)
        : "";
      const label = tableLableMatch ? tableLableMatch[0] : "";
      const tooltip = commentsInfo ? `${commentsInfo[0]}"` : "";

      // Cria o nó da tabela
      const tableNode: SchemaNode = {
        label: label,
        type: null,
        tooltip: tooltip,
        isTable: true,
        children: [],
        parent: undefined,
        tableName: label,
        schemaUri: this.uri,
      };

      // Cria os nós filhos (colunas e índices) e define o parent e tableName
      const fields = this.getTableFields(tableText, label, tableNode);
      const indexes = this.getTableIndexes(tableText, label, tableNode);
      tableNode.children = [...fields, ...indexes];

      return tableNode;
    });
  }

  private getTableFields(
    tableText: string,
    tableName: string,
    parentTable?: SchemaNode
  ): SchemaNode[] {
    const fieldsRegex =
      /(?= t\.(?!index))([\s\S]*?)(?=\n)|(primary_key:[\s\S]*?)\sdo\s\|t\|(?=\n)/g;
    const fieldLabelRegex = /(?<=")([\s\S]*?)(?=("))/g;
    const typeLabelRegex = /(?<=t\.)([\s\S]*?)(?=( ))|(?<=id:\s:)([\s\S]*?)(?=[,\s])/g;
    const extraInfoRegex = /(?<=,)[\s\S]*?(.*)(?:\s*do\s*\|\w*\|)?/g;
    const commentsInfoRegex = /(?=comment: )([\s\S]*?)*("|')/;
    const matchFields = tableText.match(fieldsRegex) || [];

    const fields = matchFields.map((fieldText) => {
      const fieldMatch = fieldText.match(fieldLabelRegex);
      const typeMatch = fieldText.match(typeLabelRegex);
      const extraInfo = fieldText.match(extraInfoRegex);
      const commentsInfo = fieldText.match(commentsInfoRegex);
      const label = fieldMatch ? fieldMatch[0] : "";
      const type = typeMatch ? typeMatch[0] : null;
      const tooltip = commentsInfo ? commentsInfo[0] : "";
      const isPrimaryKey =
        (fieldMatch && fieldMatch[0] === "id") || fieldText.includes("primary_key:");

      const fieldConfig: Record<string, unknown> = extraInfo
        ? rubyHashToJson(`{${extraInfo[0]}}`)
        : {};
      const attributesDescription = filterColumnAttributes(
        type || "",
        fieldConfig as SchemaColumnAttributes
      );

      let description = `${type}`;
      description += attributesDescription ? `, ${attributesDescription}` : "";

      return {
        label: label,
        type: type,
        description: `(${description})`,
        tooltip: tooltip,
        isTable: false,
        isPrimaryKey: isPrimaryKey,
        children: [],
        parent: parentTable,
        tableName: tableName,
      };
    });

    // Add primary key field if not present and table has not declare 'primary_key: false'
    const hasPrimaryKey = fields.some((field) => field.isPrimaryKey);
    const declaresNoPrimaryKey = /primary_key:\s*false|id:\s*false/.test(tableText);
    if (!hasPrimaryKey && !declaresNoPrimaryKey) {
      fields.unshift({
        label: "id",
        type: "primary_key",
        description: "(primary_key)",
        tooltip: "Primary Key",
        isTable: false,
        isPrimaryKey: true,
        children: [],
        parent: parentTable,
        tableName: tableName,
      });
    }

    return fields;
  }

  private getTableIndexes(
    tableText: string,
    tableName: string,
    parentTable?: SchemaNode
  ): SchemaNode[] {
    // Regex para capturar linhas de índice: t.index ["column"], name: "index_name", unique: true
    const indexRegex = /t\.index\s+([\s\S]*?)(?=\n)/g;
    const indexes = tableText.match(indexRegex) || [];

    return indexes.map((indexText) => {
      // Extrai as colunas do índice
      const columnsMatch = indexText.match(/\[([\s\S]*?)\]/);
      const columnsStr = columnsMatch ? columnsMatch[1] : "";
      const columns = columnsStr
        .split(",")
        .map((col) => col.trim().replace(/["']/g, ""))
        .filter(Boolean);

      // Extrai o nome do índice
      const nameMatch = indexText.match(/name:\s*["']([^"']+)["']/);
      const indexName = nameMatch ? nameMatch[1] : columns.join("_");

      // Verifica se é um índice único
      const isUnique = /unique:\s*true/.test(indexText);

      // Cria o label e tooltip
      const label = `${indexName}`;
      const columnsList = columns.join(", ");
      const uniqueLabel = isUnique ? " (unique)" : "";
      const tooltip = `Index on [${columnsList}]${uniqueLabel}`;

      return {
        label: label,
        type: "index",
        description: `${uniqueLabel} [${columnsList}]`.trim(),
        tooltip: tooltip,
        isTable: false,
        isIndex: true,
        isUnique: isUnique,
        indexColumns: columns,
        children: [],
        parent: parentTable,
        tableName: tableName,
      };
    });
  }
}
