Check deadlink in markdown file including git repository.

## How to install

```
$ npm install -g markdown-check-deadlink
```

## How to use

```
$ markdown-check-deadlink
[README.md]
[sample/README.md]
✓ child/README.md
✓ child
✖ children/README.md
- https://localhost http protocol is not supported now.
[sample/child/README.md]
✓ ../../package.json

Deadlink exists.
```
