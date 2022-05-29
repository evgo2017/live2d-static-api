const fs = require('fs/promises')
const path = require('path').posix

// 支持命令行参数：node build.js fromBasePath=models toBasePath=indexes isCompress=false
const buildOptions = setBuildOptions({
  fromBasePath: 'models', // 模型文件夹，只读不写
  toBasePath: 'indexes', // 索引文件夹，每次 build 完全重建
  isCompress: false
})
const fromBasePath = buildOptions.fromBasePath
const toBasePath = buildOptions.toBasePath
const isCompress = buildOptions.isCompress

const modelTemplateJsonFileName = 'model.json'
const modelTexturesFolderPath = 'textures'

const modelsIndexJsonFileName = 'models.json'
const textureDefaultJsonFileName = 'default.json'
const texturesIndexJsonFileName = 'textures.json'

class Helper {
  static async ensureExistFolder (folderPath) {
    try {
      await fs.stat(folderPath)
    } catch (e) {
      await fs.mkdir(folderPath, { recursive: true })
      console.warn(`已新建 ${folderPath}`)
    }
  }

  static async deleteFolder (folderPath) {
    try {
      const stat = await fs.stat(folderPath)
      if (!stat.isDirectory()) {
        console.warn(`${folderPath} 不是文件夹`)
        return
      }
    } catch {
      return
    }

    await fs.rm(folderPath, { recursive: true, maxRetries: 5 })
    console.log(`已删除 ${folderPath}`)
  }

  static stringify (json) {
    return JSON.stringify(json, null, isCompress ? '' : '\t')
  }

  static factorial (rest, result = [], detail = []) {
    if (rest.length === 0) {
      result.push(detail)
      return result
    }

    const current = rest[0]
    const newRest = rest.slice(1)

    current.forEach(currentSub => {
      Helper.factorial(newRest, result, [...detail, currentSub])
    })

    return result
  }
}

class Setting {
  static updateModel (fromModelPath, toModelPath, json) {
    if (json.model) {
      json.model = path.relative(toModelPath, path.normalize(`${fromModelPath}/${json.model}`))
    }
  }

  static updatePose (fromModelPath, toModelPath, json) {
    if (json.pose) {
      json.pose = path.relative(toModelPath, path.normalize(`${fromModelPath}/${json.pose}`))
    }
  }

  static updatePhysics (fromModelPath, toModelPath, json) {
    if (json.physics) {
      json.physics = path.relative(toModelPath, path.normalize(`${fromModelPath}/${json.physics}`))
    }
  }

  static updateExpressions (fromModelPath, toModelPath, json) {
    if (json.expressions) {
      json.expressions.forEach(({ file }, index, array) => {
        array[index].file = path.relative(toModelPath, path.normalize(`${fromModelPath}/${file}`))
      })
    }
  }

  static updateMotions (fromModelPath, toModelPath, json) {
    if (json.motions) {
      Object.values(json.motions).forEach(groups => {
        groups.forEach(({ file }, index, array) => {
          array[index].file = path.relative(toModelPath, path.normalize(`${fromModelPath}/${file}`))
        })
      })
    }
  }

  static updateTextures (fromModelPath, toModelPath, json, textures = []) {
    json.textures = textures.map(texture => {
      return path.relative(toModelPath, path.normalize(`${fromModelPath}/${texture}`))
    })
  }
}

init()

async function init () {
  await Helper.deleteFolder(toBasePath)
  await Helper.ensureExistFolder(toBasePath)

  const modelPaths = await createModelsIndexJsonFile()

  modelPaths.map(async ({ modelPath }) => {
    console.log(`开始转换：${modelPath}`)

    const fromModelPath = `${fromBasePath}/${modelPath}`
    const toModelPath = `${toBasePath}/${modelPath}`

    await Helper.ensureExistFolder(toModelPath)

    await createTextureJsonFiles(fromModelPath, toModelPath)
    await createTexturesIndexJsonFile(toModelPath)

    console.log(`转换完成：${modelPath}`)
  })
}

async function createModelsIndexJsonFile () {
  const modelPaths = await getAllModelPaths()
  await fs.writeFile(`${toBasePath}/${modelsIndexJsonFileName}`, Helper.stringify(modelPaths))
  return modelPaths
}

async function createTexturesIndexJsonFile (toModelPath) {
  const dirents = await fs.readdir(toModelPath, { withFileTypes: true })
  const textureNames = dirents.map(dirent => path.parse(dirent.name).name)
  await fs.writeFile(`${toModelPath}/${texturesIndexJsonFileName}`, Helper.stringify(textureNames))
  return textureNames
}

async function createTextureJsonFiles (fromModelPath, toModelPath) {
  const textureDefaultJsonStr = await getTextureDefaultJsonStr(fromModelPath, toModelPath)

  await fs.writeFile(`${toModelPath}/${textureDefaultJsonFileName}`, textureDefaultJsonStr)

  const textureGroups = await getTextureGroups(fromModelPath, toModelPath)

  const allTextures = Helper.factorial(textureGroups.map(({ textures }) => textures))

  await Promise.all(allTextures.map(async textures => {
    const textureJson = JSON.parse(textureDefaultJsonStr)

    Setting.updateTextures(fromModelPath, toModelPath, textureJson, textures.map((texture, index) => {
      const { partName } = textureGroups[index]
      return `${modelTexturesFolderPath}/${partName}/${texture}`
    }))

    await fs.writeFile(`${toModelPath}/${textures.map(texture => path.parse(texture).name).join('&')}.json`, Helper.stringify(textureJson))
  }))
}

async function getTextureDefaultJsonStr (fromModelPath, toModelPath) {
  const modelTemplateJsonFile = await fs.readFile(`${fromModelPath}/${modelTemplateJsonFileName}`, 'utf-8')

  const defaultTextureJson = JSON.parse(modelTemplateJsonFile)

  Setting.updateModel(fromModelPath, toModelPath, defaultTextureJson)
  Setting.updatePose(fromModelPath, toModelPath, defaultTextureJson)
  Setting.updatePhysics(fromModelPath, toModelPath, defaultTextureJson)
  Setting.updateExpressions(fromModelPath, toModelPath, defaultTextureJson)
  Setting.updateMotions(fromModelPath, toModelPath, defaultTextureJson)
  Setting.updateTextures(fromModelPath, toModelPath, defaultTextureJson, defaultTextureJson.textures)

  return Helper.stringify(defaultTextureJson)
}

async function getTextureGroups (fromModelPath) {
  // texture 是分部分的，几个文件夹就几部分，也就是数组的长度，从模板文件获取顺序
  const modelTemplateJsonFile = await fs.readFile(`${fromModelPath}/${modelTemplateJsonFileName}`, 'utf-8')

  const defaultPartNames = JSON.parse(modelTemplateJsonFile).textures.map(texture => path.parse(texture).dir.split('/').pop())

  const textureGroups = Array(defaultPartNames.length).fill(null)

  await Promise.all(defaultPartNames.map(async (partName, index) => {
    textureGroups[index] = {
      partName,
      textures: await fs.readdir(`${fromModelPath}/${modelTexturesFolderPath}/${partName}`)
    }
  }))

  return textureGroups
}

async function getAllModelPaths () {
  const modelPaths = []
  await fillModelPath(fromBasePath)
  return modelPaths

  async function fillModelPath (path) {
    const modelTemplateJsonFilePath = `${path}/${modelTemplateJsonFileName}`
    try {
      const stat = await fs.stat(modelTemplateJsonFilePath)
      if (stat.isFile()) {
        modelPaths.push({
          modelIntroduce: JSON.parse(await fs.readFile(modelTemplateJsonFilePath, 'utf-8')).modelIntroduce,
          modelPath: path.slice(path.indexOf('/') + 1)
        })
        return
      }
    } catch (e) {
      // do nothing
    }

    const dirents = await fs.readdir(path, { withFileTypes: true })

    await Promise.all(dirents.map(async dirent => {
      if (!dirent.isDirectory()) {
        return
      }

      await fillModelPath(`${path}/${dirent.name}`)
    }))
  }
}

function setBuildOptions (buildOptions) {
  process.argv.slice(2).forEach(arg => {
    const [key, val] = arg.split('=')
    switch (key) {
      case 'isCompress':
        Object.assign(buildOptions, {
          [key]: val === 'true'
        })
        break
      case 'fromBasePath':
      case 'indexes':
        Object.assign(buildOptions, {
          [key]: val
        })
    }
  })
  return buildOptions
}
