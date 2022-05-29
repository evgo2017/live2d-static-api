# live2d-static-api

## 背景

我的 [vue-live2d](https://github.com/evgo2017/vue-live2d) 项目，在 vue 中使用看板娘，切换模型和服装是直接调用 [live2d_api](https://github.com/fghrsh/live2d_api) 提供的 api。但因为一些不可抗力，api 提供的服务出现了问题，导致加载不到数据。

所以我写了这个项目来代替  [live2d_api](https://github.com/fghrsh/live2d_api)  提供服务，同时提高 [vue-live2d](https://github.com/evgo2017/vue-live2d) 的易用。

## 介绍

live2d-static-api 是一款静态 api，和静态博客类似。运行时只需要通过 http 能拿到静态文件即可，不需要部署复杂的环境。当前项目的 url 地址就是提供服务的一个途径。

### 1. 在线浏览效果

在线 DEMO：https://evgo2017.com/repo/live2d-static-api

### 2. 使用

#### 2.1 可直接使用的服务地址：

| 说明                | 服务地址                                                     |
| ------------------- | ------------------------------------------------------------ |
| 当前项目的 url 地址 | https://github.com/evgo2017/live2d-static-api/blob/master/indexes |
| 我提供的服务地址    | https://evgo2017.com/api/live2d-static-api/indexes           |

#### 2.2 自行部署

将此项目直接放在服务器上，配置地址即可。

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

> [live2d_api](https://github.com/fghrsh/live2d_api) 使用的是 php，而我对 php 没什么经验（还懒得 docker 打个包），考虑过用 node 重写（还得部署服务），最后发现动态服务器不必要，静态服务器就解决问题了，完美。

## 版权

**API 内所有模型（models 文件夹内）版权均属于原作者，仅供研究学习，不得用于商业用途**

其他内容版权均属于 evgo2017，MIT。
