# HtmlJs
> Optimize effort of building large scale web application

![NPM Version][npm-image]
![Build Status][travis-image]
![License][license-image]
![Dependencies][dependencies]

HtmlJs is a JavaScript MVVM library. It is built with OOP and speed in mind.
It helps you to build the most sophisticated and complicated components with ease.
Integrate well with most existing libraries/frameworks like jQuery, AngularJs.

![Project screen shot](https://nhanfu.github.io/htmljs/api/images/code.png)

![Project screen shot](https://nhanfu.github.io/htmljs/api/images/shopping_cart.png)

## Installation

Nuget:

```sh
Install-Package HtmlJs
```

Bower:

```sh
bower install htmljs
```

## Getting started
Go to [Homepage](https://nhanfu.github.io/htmljs/api/index.html) for more details.

Totally new to HtmlJs? Play with [HtmlJs interactive tutorial](https://nhanfu.github.io/htmljs/api/tutorial.html#step1).

## Build from source

Clone the repo from GitHub

```sh
git clone https://github.com/nhanfu/htmljs.git
cd htmljs
```

`Install build tool`. Make sure that [Node.js](nodejs.org) already installed.

```sh
npm install
```

Run the build tool

```sh
gulp build
```

## Running the tests

If you have PhantomJs installed, then `gulp` will execute the test suite and report its result.

## Release History

* 1.0.4
    * Rename html.data to html.observable
    * Add html.observableArray
    * Remove `createElementNoParent()` function
    * Replace getter and setter by `data` property
* 1.0.3
    * Fix bug for ajax module and dropdown component
    * Use property instead of function to render DOM

## Author

Nhan Nguyen – [@nhan_htmljs](https://twitter.com/nhan_htmljs) – nhan.htmljs@gmail.com

Distributed under the MIT license. See [LICENSE](https://opensource.org/licenses/MIT) for more information.

[npm-image]: https://img.shields.io/badge/npm-v1.0.4-orange.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dm/datadog-metrics.svg?style=flat-square
[travis-image]: https://img.shields.io/travis/dbader/node-datadog-metrics/master.svg?style=flat-square
[license-image]: https://img.shields.io/packagist/l/doctrine/orm.svg?style=flat-square
[dependencies]: https://img.shields.io/versioneye/d/ruby/rails.svg?style=flat-square