# live2d-static-api

## 背景

[vue-live2d](https://github.com/evgo2017/vue-live2d) 之前通过调用 [live2d_api](https://github.com/fghrsh/live2d_api) 提供的 api 来加载模型，但该 api 出现了问题，导致长时间加载不到数据。

所以我写了这个项目来代替  [live2d_api](https://github.com/fghrsh/live2d_api)  ，同时提高 [vue-live2d](https://github.com/evgo2017/vue-live2d) 的易用。

## 介绍

live2d-static-api 是一款静态 api，不需要部署复杂环境，只需要 web 服务（如 Nginx 等）即可。

网站怎么部署，这个项目怎么部署。当前项目的 url 就已是一个 api 服务了。

### 1. 在线浏览效果

在线 DEMO：https://evgo2017.com/repo/vue-live2d

### 2. API 地址

#### 2.1 可直接使用的 api 地址：

| 说明                | 服务地址                                                     |
| ------------------- | ------------------------------------------------------------ |
| 基于 Github 提供的 api 地址 | https://github.com/evgo2017/live2d-static-api/blob/master/indexes |
| 我提供的 api 地址    | https://evgo2017.com/api/live2d-static-api/indexes           |

#### 2.2 自行部署 api

在服务器（如 Nginx、IIS 等）上配置，等同部署网站。

如 Nginx 的 `conf` 文件：
```
server {
    location /api/live2d-static-api {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Content-Type';
        alias /var/www/live2d-static-api;
    }
}
```

### 3. 接口

接口使用请参考 [vue-live2d](https://github.com/evgo2017/vue-live2d)。

| 请求数据的接口 url                              | 含义               | 备注                                                         |
| ----------------------------------------------- | ------------------ | ------------------------------------------------------------ |
| /indexes/models.json                            | 获得模型索引       |                                                              |
| /indexes/\<modelPath\>/textures.json            | 获得模型的服装索引 | modelPath 值从模型索引文件取得                               |
| /indexes/\<modelPath\>/\<modelTexturesId\>.json | 获得模型的特定配置 | modelTexturesId 值从服装索引文件取得，默认为 default；这也是模型最终要加载的文件 |

### 4. 文件结构

```
├─indexes // 索引文件夹，每次 build 完全重建
│  │  models.json // 模型索引文件
│  │
│  └─Potion-Maker
│  │   ├─Pio
│  │   │      animal-costume-racoon.json // 特定服装配置
│  │   │      animal-costume.json // 特定服装配置
│  │   │      ... // 特定服装配置，从<默认服装配置>进一步转义而来
│  │   │      default.json // 默认服装配置，从<模板文件>转义而来
│  │   │      textures.json // 服装索引文件
│  │   │
│  │   └─Tia ...
│  │
│  └─bilibili-live
│      ├─22
│      │      closet-default-v2&cba-normal-upper&cba-normal-lower&cba-hat.json // 特定服装配置，服装各部分使用 & 连接
│      │      ...
│
└─models // 模型文件夹，只读不写
    └─Potion-Maker
        ├─Pio
        │  │  model.json // 模型配置（模板文件）
        │  │  model.moc
        │  │
        │  ├─motions
        │  │      Breath Dere1.mtn
        │  │      Breath Dere2.mtn
        │  │      Breath ...
        │  │
        │  └─textures // 服装文件夹
        │      └─textures_00 // 服装是分部分且有顺序的，几个文件夹就几部分，顺序从<模板文件>获取
        │              animal-costume-racoon.png
        │              animal-costume.png
        │              ...
        │
        └─Tia ...
```

### 5. 编译

如果服务提供的模型和服装有修改，需要重新生成索引文件。每次 build 会完全重建索引文件夹。

| 可配置参数   | 含义                   | 默认值  |
| ------------ | ---------------------- | ------- |
| fromBasePath | 模型文件夹地址         | models  |
| toBasePath   | 索引文件夹地址         | indexes |
| isCompress   | 是否压缩生成索引的文件 | true    |

支持命令行参数：

```shell
$ node build.js // 使用默认值
$ node build.js fromBasePath=models toBasePath=indexes isCompress=false
```

## 参考资料

[1] https://github.com/fghrsh/live2d_api

> [live2d_api](https://github.com/fghrsh/live2d_api) 使用的是 php，而我对 php 没什么经验（还得 docker 打个包），考虑过用 node 重写（还得部署服务），最后通过静态文件就解决问题了，完美。

## 版权

**API 内所有模型（models 文件夹内）版权均属于原作者，仅供研究学习，不得用于商业用途**

其他内容版权均属于 evgo2017，MIT。
