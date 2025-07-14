# Rails DB Schema Explorer

A Visual Studio Code extension that provides an intuitive way to explore and navigate Rails database schema files. This extension adds a dedicated view in the sidebar to display your Rails application's database tables and their structure, making it easier to understand and work with your database schema.

## Features

- **Schema Tree View**: Display all database tables from your Rails schema file in a convenient tree structure
- **Real-time Updates**: Automatically refresh the schema view when your schema files change
- **Quick Navigation**: Jump directly to table definitions in your schema file
- **Search Functionality**: Find tables quickly with the built-in search feature
- **Multi-workspace Support**: Works with multiple Rails projects open simultaneously

![Rails DB Schema Explorer](https://github.com/wilfison/vscode-rails-db-schema/raw/HEAD/resources/preview.png)

## Getting Started

1. Open a Rails project in VS Code
2. The extension will automatically detect your `db/schema.rb` file
3. Click on the Rails DB Schema icon in the activity bar to view your database tables
4. Use the search functionality to quickly find specific tables
5. Click on any table to navigate to its definition in the schema file

## Requirements

- A Rails application with a `db/schema.rb` file
- Visual Studio Code version 1.101.0 or higher

## Keyboard Shortcuts

- `Ctrl+F` (when focused on the schema view): Search for tables

## Usage

### Viewing Database Tables

Once installed, the extension will automatically scan your Rails project for schema files. The database tables will appear in the Rails DB Schema view in the sidebar.

### Searching Tables

Use the search icon in the view title or press `Ctrl+F` when the view is focused to search for specific tables.

### Navigating to Schema Definitions

Click on any table in the tree view to jump directly to its definition in the `schema.rb` file.

## Configuration

This extension works out of the box with standard Rails applications. It automatically detects schema files matching the pattern `**/db/*schema.rb`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Issues

If you encounter any issues or have feature requests, please file them on the [GitHub Issues page](https://github.com/wilfison/vscode-rails-db-schema/issues).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Thanks

Special thanks to [Gustavo Delgado](https://github.com/tavo/vscode-rails-schema-extension) for the inspiration and initial implementation of this extension.

**Enjoy exploring your Rails database schema!**
