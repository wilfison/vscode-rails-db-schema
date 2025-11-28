# Change Log

## [Unreleased]

### Added

- New configuration options to customize the schema explorer:
  - `rails-schemas.autoReveal`: Automatically reveal tables when opening model files (default: `true`)
  - `rails-schemas.showIndexes`: Toggle visibility of database indexes (default: `true`)
  - `rails-schemas.showTimestamps`: Toggle visibility of timestamp columns (default: `true`)
  - `rails-schemas.showRailsTables`: Toggle visibility of Rails internal tables (default: `true`)
- Filtering of Rails internal tables: `action_text_rich_texts`, `active_storage_attachments`, `active_storage_blobs`, `active_storage_variant_records`
- Filtering of timestamp columns: `created_at`, `updated_at`
- Automatic tree refresh when configuration changes
- Schema statistics: View total number of tables, columns, and indexes with a single click

## [1.0.6] - 2025-11-28

- Feat: Show relevant infos for columns, like precision, scale, limit, and default values.
- Fix: Copy only column names when copying columns from a table.
- Update preview image.

## [1.0.5] - 2025-11-28

- Add index and unique index icons in schema tree view.
- Add icons to column list for better visualization.
- Fix bug when open model file.
- Remove `plur` dependency.

## [1.0.3] - 2025-08-06

- Fix pluralize imports.
- Change pluralize lib.

## [1.0.2] - 2025-07-15

- Adds option to copy the name of all columns in a table

## [1.0.1] - 2025-07-14

### Added

- Initial release of Rails Schema Explorer
- Schema tree view displaying all database tables from Rails schema files
- Real-time file watching for automatic schema updates
- Search functionality to quickly find tables
- Quick navigation to table definitions in schema files
- Multi-workspace support for Rails projects
- Keyboard shortcuts for enhanced productivity
- Activity bar integration with dedicated Rails DB Schema view

### Features

- Automatic detection of `db/schema.rb` files
- Debounced file watching for optimal performance
- Context menu actions for schema exploration
- Clear search functionality
- Focus and expand capabilities for table navigation

## [Unreleased]

### Planned

- Support for additional schema file formats
- Enhanced table details view
- Column information display
- Relationship visualization
- Dark/light theme optimization
