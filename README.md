# rougher.js

CLI tool that applies [rough.js](https://roughjs.com/) ( [GitHub](https://github.com/pshihn/rough) ) to existing SVG file and generate new rough SVG.

## Example

#### Base image:

<img src="./examples/source.svg" />

#### Translated image:

By using `rougher.js`, the base image above will be converted into the following:

<img src="./examples/translated.svg" />


## Build and Execution

```sh
$ git clone $THIS_REPOSITORY
$ cd $REPOSITORY_DIRECTORY
$ yarn install
$ yarn build ; yarn link ; rougher ./examples/source.svg > examples/translated.svg
```

## Dependencies

- Node.js
- Yarn
