# gulpfile.js

This gulpfile is designed for use with [Aurora theme](https://www.drupal.org/project/aurora) for Drupal.

Use ```gulp``` for development and ```gulp build``` and for production.

```gulp build``` will:<br>

1. Run clean to delete the contents of the dest directory and rebuild the file from scratch.
2. Watch the files in the src directory if changes and if they are detected with selectively:
  1. Compile the scss files without minification and with sourcemaps.
  2. Concatenate the js files with sourcemaps and output any errors with jshint.
  3. Rebuild the svg/png sprite.
  
```gulp``` will:<br>

1. Run build.
2. Watch the files in the src directory if changes and if they are detected with selectively:
  1. Compile the scss files without minification and with sourcemaps.
  2. Concatenate the js files with sourcemaps and output any errors with jshint.
  3. Rebuild the svg/png sprite.

There's also some git flow tasks for incrementing the version in [SemVer style](http://semver.org) (albeit with the addition of the Drupal 7.x- namespace) and tagging with the version number.

For these I've chosen the semantic commands ```gulp patch```, ```gulp feature```, and ```gulp release``` to represent the SemVer equivalents PATCH, MINOR and MAJOR version.

# package.json and bower.json

These setup all the dependencies for the gulpfile. The package file includes postinstall hooks to download the bower libraries and remove the .info files from the node_modules directory which cause a WSOD in Drupal.