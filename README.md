Flip!
=====

起動方法（ローカル）
--------

読み込みの都合があり、Webサーバを起動します

```sh
cd ..
ruby -rsinatra -e 'set :bind, "0.0.0.0"; set :public_folder, "./", get("/"){"Hello world"}'
```
