import { Uri } from "vscode";

interface SchemaNode {
  label: string;
  type: string | null;
  description?: string;
  tooltip?: string;
  schemaUri?: Uri;
  isTable: boolean;
  isPrimaryKey?: boolean;
  children: SchemaNode[];
  parent: SchemaNode | undefined;
  tableName: string;
}

export default SchemaNode;
