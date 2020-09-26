# <img src='assets/images/fibi-logo.png' alt='Mataf logo' width=25/> Mataf schematics

This is an installer for custom Mataf schematics.

## Features
`Mataf Schematics` is a workflow tool that applies transformations to your newly created projects. It is designed to improve your development productivity by adding scaffolding to your project, including both best practices and security in mind.
- Amongst the differnt features, `Mataf Schematics` adds support for:
   - Swagger OpenAPI Specification
   - GZIP Compression
   - Elastic APM
   - Cross-Origin Resource Sharing
   - Security best practices (e.g `helmet`, `csurf`)
   - HTTP request timeout management
   - `ESLint` static code analysis tool
   - Health check components

- Currently, this extension supports:
    - `NestJS` projects.
    - `NestJS` plugins on a `@nrwl/NX` workspace.

## Requirements
All the schematics are designed to be applied on a newly created project. 
> **`:warning:`** `Applying the schematics on a WIP project will override vital files, resulting in a filesystem corruption.`

- #### <ins>**NX-NestJS:**<ins />
    -   This extension will not work outside of an `@nrwl/NX` workspace root    directory.
    -   A `NestJS` plugin must already be installed to apply the schematic.
    -   `workspace.json` must be present in the workspace's root folder for this schematic to work. 
- #### <ins>**NestJS:**<ins />
    -   This extension will not work outside of an `NestJS` project root    directory.
    -   `nest-cli.json` must be present in project's the root folder for this schematic to work. 

## Instructions

1. Activate the command-line (`Ctrl+Shift+P`) and enter `"Mataf schematic"`.
2. Choose the relevant schematic.
3. You will thereafter be prompted with the related instruction by the terminal.

## Release Notes

This extension currently supports:
1. `NestJS` projects.
2. `NestJS` plugins on a `@nrwl/NX` workspace.

### 1.0.0

Initial release of - `"Mataf Schematics Extension"` .

**Enjoy!**
