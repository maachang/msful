# msful is a Web API server for microservices.

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

日本語の説明は [こちら](https://github.com/maachang/msful/blob/master/README_JP.md)

msdul is a very easy and very simple web application server and aims to create ideas as soon as possible.

msful is RESTful and does not need to execute existing URL mapping, but uses directory-based URL access method, which enables more intuitive development.

A simple, thin framework, msful, so if you have experience developing with nodejs, or anyone who can handle web-based Javascript programs, you can develop quickly without requiring a lot of learning costs.

_

_

# Benefits of using msful

Before, I used spring-boot, a web application server that runs in java, and built a web application with Vert.x in Scala language.

Recently, Web application environment was also developed using node's node-express.

But I thought one time. The node-express Web application server running on node is very inefficient in development.

That is, once node-express fixes the api program, it has to restart the node.

The node-express "during development" is reducing the development efficiency.

And they felt the same when they used java's spring-boot and scala's Vert.x.

Both spring-boot and Vert.x are the same as node-express, and it was necessary to restart the server after each operation check for the api program correction.

What I think using spring-boot and Vert.x is the cause of poor development efficiency because the api program update part is not reflected unless the server is restarted.

In the case of java, this is not possible due to language reasons.

However, in the node script, the updated part of the api program can be reflected on the node.

However, with node-express, by design, the node server restart is required to reflect the updated part of the api program on the node.

As a result, it can be said that the development efficiency of the node-express development environment has deteriorated "in the same way as java".

It is not particularly good personally as a PHP language or Web server, but if the script of the target content is updated, PHP automatically reloads it, as there is no restart for the server. You can say that "development efficiency" is good.

After thinking about various things and examining various things "It is good if it is good to make a Web application server with high development efficiency." I thought so, and made msful.

msful, like PHP-based web servers, is automatically incorporated into updates to target Api programs, so I think it will be more comfortable to develop than node-express.

I hope that msful developers can provide a better development environment for you.

_

_

The following document describes msful. It would be appreciated if you could better understand msful.

・ [Description for installation of msful](https://github.com/maachang/msful/blob/master/docs/ENG/init.md)

・ [Msful basic function description](https://github.com/maachang/msful/blob/master/docs/ENG/next.md)

・ [Tutorial](https://github.com/maachang/msful/blob/master/docs/ENG/tutorial.md)

・ [Msful startup setting description](https://github.com/maachang/msful/blob/master/docs/ENG/startup.md)

・ [Msful start command description](https://github.com/maachang/msful/blob/master/docs/ENG/command.md)

・ [Description for rtx (Response Context)](https://github.com/maachang/msful/blob/master/docs/ENG/rtx.md)

・ [Description for msful base module](https://github.com/maachang/msful/blob/master/docs/ENG/base_mod.md)

・ [Msful initialization, description for built-in](https://github.com/maachang/msful/blob/master/docs/ENG/built_in.md)

_

_

日本語の説明は [こちら](https://github.com/maachang/msful/blob/master/README_JP.md)