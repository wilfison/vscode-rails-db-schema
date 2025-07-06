import { Uri } from "vscode";

interface SchemaNode {
  label: string;
  type: string | null;
  description?: string;
  tooltip?: string;
  resourceUri?: Uri;
  isTable: boolean;
  isPrimaryKey?: boolean;
  children: SchemaNode[];
  parent: SchemaNode | undefined;
}

export default SchemaNode;
