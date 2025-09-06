# Contribution Guidelines

In your first PR, append a single line with your GitHub username (and
optionally your email) in `/CONTRIBUTORS.txt`

**Note:** If your contribution includes a webpage (`/public/XXXX.mustache`),
make sure you append a hyphen + the language code of the webpage in the
filename.

This is good:

`login-en.mustache`

`listings-kn.mustache`

`logout-confirmation-hi.mustache`

This is NOT good:

`login.mustache`

`listings.mustache`

`logout-confirmation.mustache`

We recommend that you create versions of your webpage for all (or as many)
supported languages as possible.

Use `kebab-case` for HTML file names.

## Coding Style

These guidelines exist to make sure that the project code is as uniform as
possible.

**Format script**: `npm run format`

1. Use tabs for indentation (width=8), and spaces for alignment.
2. Use `snake_case` for variable names.
3. Use ES6 syntax ONLY in TypeScript.
4. Always end TypeScript statements with semicolons (`;`).
5. Use double quotes for strings, not single quotes (`"Test"`, not `'Test'`).
   Use escape sequences if necessary (`"\'Test\'"`).
6. The line length in all files should not exceed 80 characters.
7. Imports ordering is:
   **External libs (first) -> Internal modules -> Relative paths (last)**
8. Use trailing commas.
9. The opening brace of a conditional statement or loop should be on the same
   line as the condition.

This is good:

```typescript
if (foo < bar) {
	console.log("Foobar");
}
```

This is NOT good:

```typescript
if (foo < bar) {
	console.log("Foobar");
}
```

10. Use guard clauses and early exits. Never exceed more than depth 3
    indentation.

This is good:

```typescript
const checkSomething = (foo: number, bar: number) => {
	if (foo == bar) {
		console.log("Equal");
		return;
	}

	// 200 more lines of code...
};
```

This is NOT good:

```typescript
const checkSomething = (foo: number, bar: number) => {
	if (foo == bar) {
		console.log("Equal");
	} else {
		// 200 more lines of code...
	}
};
```

11. Keep the code modular in separate files with functions and
    `import`/`export`/`export default`, **DON'T** use
    Object-Oriented Programming (OOP).

### Workspace settings for VSCode:

Create a `.vscode` directory in the root folder of your project and create a
`settings.json` file inside it:

```json
{
	"editor.tabSize": 8,
	"editor.insertSpaces": false,
	"editor.rulers": [80],
	"editor.wordWrap": "wordWrapColumn",
	"editor.wordWrapColumn": 80,
	"files.eol": "\n",
	"files.insertFinalNewline": true,
	"files.trimTrailingWhitespace": true,
	"editor.formatOnSave": true,
	"prettier.requireConfig": true
}
```
