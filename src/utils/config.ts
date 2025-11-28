import * as vscode from 'vscode';

const CONFIG_SECTION = 'rails-schemas';

export interface RailsSchemasConfig {
  autoReveal: boolean;
  showIndexes: boolean;
  showTimestamps: boolean;
  showRailsTables: boolean;
}

export function getConfig(): RailsSchemasConfig {
  const config = vscode.workspace.getConfiguration(CONFIG_SECTION);

  return {
    autoReveal: config.get<boolean>('autoReveal', true),
    showIndexes: config.get<boolean>('showIndexes', true),
    showTimestamps: config.get<boolean>('showTimestamps', true),
    showRailsTables: config.get<boolean>('showRailsTables', true),
  };
}

export const RAILS_INTERNAL_TABLES = [
  'action_text_rich_texts',
  'active_storage_attachments',
  'active_storage_blobs',
  'active_storage_variant_records',
];

export const TIMESTAMP_COLUMNS = ['created_at', 'updated_at'];
