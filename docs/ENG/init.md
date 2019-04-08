# Description of the introduction of msful

<p align = "center">
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/dt/msful.svg" alt = "Downloads"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/v/msful.svg" alt = "Version"> </a>
  <a href="https://www.npmjs.com/package/msful"> <img src = "https://img.shields.io/npm/l/msful.svg" alt = "License"> </a>
</ p>

日本語の説明は [こちら](https://github.com/maachang/msful/blob/master/docs/JP/init.md)

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README_JP.md)

_

_

## Installation

※ It is assumed that nodepm is installed and npm can be used.

```
$ npm install -g msful
```

## Create a project.

Here we are creating a new project called myProject.

```
$ msful project myProject
$ cd myProject
```

## Create Content File

First of all, create a static HTML file. Static files such as HTML are created under html folder.

```
 $ vi html/index.html
```

```html
<html>
  <head> </ head>
  <body>
    hoge !!
  </ body>
</ html>
```

## Create webapi file

Next we will create a dynamic web API. Web API files are created under the api folder.

```
 $ vi api/index.js
```

```javascript
rtx.send ({hello: "world"});
```

-msful start

Run msful server.

```
 $ msful
```

When it is executed, the following contents are displayed.
When such a display is displayed, it has started normally.
(The following is the number of CPUs for listen content

```cmd
## listen: 3333 env: [development] timeout: 15 (sec) contentCache: true pid: 13400
```

_

_

# Check the server execution result of msful


Let's look at the static HTML file we created earlier.

Launch your browser and put `http://localhost:3333/` in the URL address input field.

Then, the following display content will be displayed on the browser.

```
 hoge !!
```

Next, let's look at the result of Web API.

Launch your browser and put `http://localhost:3333/api/` in the URL address input field.

Then, the following display content will be displayed on the browser.

```
 {"hello": "world"}
```

It is very easy, but msful can be used easily and intuitively like this.

_

_

Return to the readme.md documentation [readme](https://github.com/maachang/msful/blob/master/README_JP.md)