# Security

feynjs turns diagram source into SVG, which pages insert into their HTML. A way to make it emit
script, or anything else that runs in a reader's browser, is a security problem; so is a way to
make the command line read or write files it was not asked to.

## Reporting

Please report a vulnerability privately, through GitHub:
[Security → Report a vulnerability](https://github.com/hepjs/feynjs/security/advisories/new).
Include the diagram source or command that shows it. You will hear back within a week; a fix is
released as a new version and noted in the [changelog](CHANGELOG.md).

Please do not open a public issue for a vulnerability until it is fixed.

## Supported versions

The latest release on npm receives security fixes.
