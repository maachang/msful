# msfulはマイクロサービス用のWeb APIサーバーです。

<p align="center">
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/dt/msful.svg" alt="Downloads"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/v/msful.svg" alt="Version"></a>
  <a href="https://www.npmjs.com/package/msful"><img src="https://img.shields.io/npm/l/msful.svg" alt="License"></a>
</p>

English documents [here](https://github.com/maachang/msful/blob/master/README.md)

msdulは非常に簡単で非常にシンプルなWebアプリケーションサーバーであり、できるだけ早くアイデアを作成することを目指しています。

msfulはRESTfulで既存のURLマッピングを実行する必要はなく、ディレクトリベースのURLアクセス方式を採用しているため、より直感的な開発が可能です。

簡単で薄いフレームワークであるmsfulなので、nodejsでの開発経験があったり、webベースでのJavascriptプログラムを扱える人ならば、多くの学習コストを必要とせずにすぐに開発することができます。

_

_

# msful を利用する利点

以前私は java で動くWebアプリケーションサーバ spring-boot を主に利用し、またScala言語では Vert.x でWebアプリケーションを構築したりしていました。

最近では、Webアプリケーション環境は node の node-express を利用して開発もしました。

でも、ある時思いました。 node上で動く node-express Webアプリケーションサーバは、とても開発効率が悪いんですよね。

それは  node-express はapiプログラムの修正をしたら、nodeを再起動しなければならないこと。

node-express のこれが「開発時」において、開発効率を低下させているわけですよ。

そして、それらはjavaの spring-boot や scalaの Vert.x これを使ってきた時も同じことを感じたわけです。

spring-boot も Vert.x も、exporess と同じで、apiプログラムの修正に対して、動作確認の度にサーバを再起動させる必要がありました。

spring-boot や Vert.x などを使っていて思うことは、apiプログラム更新部分に対して、サーバ再起動しないと反映されないことが、開発効率の悪さの原因だとね。

java の場合、これは言語仕様的に理由があってできない。

しかしnodeスクリプトではapiプログラムの更新部分を、node上に反映することができる。

だが、node-expressでは設計によって、apiプログラムの更新部分を、node上に反映するためにnodeサーバ再起動が必要となります。

これによって node-expressの開発環境は、開発効率が「java並」に悪くなっていると言えます。

PHPの言語やWebサーバとして、別段個人的には良いとは言いませんが、対象コンテンツのスクリプトが更新されたら、自動で再読込してくれるPHPの方が、サーバの再起動分が無い分「開発効率」が良いと言えますよね。

色々と考え、色々と調べた結果 「開発効率のよいWebアプリケーションサーバを作れば良い」 そう思い、そしてmsfulを作りました。

msfulは、PHP製のWebサーバなどと同じく、対象Apiプログラムの更新に対して、自動取り込みが行われるので、node-express と比べて、快適な開発ができると思います。

私ことmsfulの開発者は、あなたに対してより良い開発環境を提供できることを願っています。

_

_

以下ドキュメントに msful について、記載しております。msfulの理解を深めていただければ幸いです。

・[msfulの導入に対する説明](https://github.com/maachang/msful/blob/master/docs/JP/init.md)

・[msful基本機能説明](https://github.com/maachang/msful/blob/master/docs/JP/next.md)

・[チュートリアル](https://github.com/maachang/msful/blob/master/docs/JP/tutorial.md)

・[msfulの起動設定説明](https://github.com/maachang/msful/blob/master/docs/JP/startup.md)

・[msful起動コマンド説明](https://github.com/maachang/msful/blob/master/docs/JP/command.md)

・[rtx(Response Context)に対する説明](https://github.com/maachang/msful/blob/master/docs/JP/rtx.md)

・[msful基本モジュールに対する説明](https://github.com/maachang/msful/blob/master/docs/JP/base_mod.md)

_

_

English documents [here](https://github.com/maachang/msful/blob/master/README.md)