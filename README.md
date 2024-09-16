# Gatika (demo)

PoC for a project management application featuring Gantt charts.\
Built with modern web technologies, focusing on usability and speed.

## Stack & Development

- SolidStart (framework)
- BiomeJS (linting + formatting)
- Vitest (unit testing)
- Playwright (integration testing)

### Setup

1. Clone the repository
2. In the project directory, run:

```bash
npm i -g bun  # if not installed
bun i         # install dependencies
bun dev       # start development server
```

3. Navigate to `http://localhost:3000/`

## BiomeJS IDE Setup

### Visual Studio Code, Cursor

1. Install Biome Extension
2. Open Command Palette (`Ctrl+Shift+P`)
3. Search: `Preferences: Open User Settings (JSON)`
4. Add:

```json
"[javascript][typescript][typescriptreact][css][json][jsonc]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
}
```

### Other Editors

For Zed, IntelliJ, Helix, Vim, etc., see
[BiomeJS editor setup](https://biomejs.dev/guides/editors/third-party-plugins/).
