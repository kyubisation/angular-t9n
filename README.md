# angular-t9n

This project is a tool to manage `.xlf` translation files. It is implemented as an Angular builder and can be added to a project via schematics.

`angular-t9n` allows adding translation targets, editing translations, exporting to Excel, importing from Excel and migrating orphaned translations.

The focus of this project is on Angular specific XLIFF files with UTF-8 encoding.

## Installation

```
ng add angular-t9n
```

This will add a `t9n` section to the architect section of your `angular.json`.

## Configuration

The following properties can be configured in the `t9n` section in the `angular.json` file.

| Property               | Description                                                                                                                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| translationFile        | The file path to the source translation file.<br>**Default:** message.xlf                                                                                                                             |
| targetTranslationPath  | The path to the target translation files.<br>**Default:** src/locales                                                                                                                                 |
| includeContextInTarget | Whether to include the context information<br>(like notes) in the target files. This is<br>useful for sending the target translation<br>files to translation agencies/services.<br>**Default:** false |
| port                   | The port on which to host the translation app.<br>**Default:** 4300                                                                                                                                   |

## Usage

Run `ng run {projectName}:t9n`, where `{projectName}` is the name of the project in the `angular.json` file, to start the translation app and open your browser at [http://localhost:4300/](http://localhost:4300/).

### Standalone Usage

This library can also be used without an angular.json.
Install the package globally via `npm install angular-t9n --global` or `yarn global add angular-t9n`.

Create a config file with `ng-t9n init [name-of-config]` and start a translation server with `ng-t9n path/to/config/file.json`.
