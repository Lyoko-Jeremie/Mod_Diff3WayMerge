# Diff3WayMerge

---

this mod export addon:

`Diff3WayMerge` : `Diff3WayMergeAddon`

```json lines
{
  "addonPlugin": [
    {
      "modName": "Diff3WayMerge",
      "addonName": "Diff3WayMergeAddon",
      "modVersion": "^1.0.0",
      "params": {
        "patchFileList": [
          {
            // the info of modify that mod want to do in the game, provide as a diff file, it is calc base on fileBase
            // mod 对游戏的修改，以 diff 文件的形式提供，这个修改基于 fileBase 计算产生
            "fileDiff": "pathTo/passageA.diff",
            // 来自游戏的原始文件，上面的 fileDiff 应用到这个文件上后产生的结果是mod所期望的结果
            // this file come from origin game, the result of apply fileDiff to this file is what mod want to do
            "fileBase": "pathTo/passageA.txt",
            // 游戏中的 passage 名称，这个名称是twee中的 passage 名称，不是文件名。
            // the passage name in the game, this name is the passage name in the twee, not the file name.
            // 这个patch需要应用到的游戏中的passage 名称
            // the passage name in the game that this patch need to apply to
            "passage": "passageA"
          },
          {
            "fileDiff": "pathTo/passageB.diff",
            "fileBase": "pathTo/passageB.txt",
            "passage": "passageB"
          },
          {
            "fileDiff": "pathTo/passageC.diff",
            "fileBase": "pathTo/passageC.txt",
            "passage": "passageC"
          },
          {
            "fileDiff": "pathTo/aaa_js.diff",
            "fileBase": "pathTo/aaa.js",
            // 这个patch需要应用到的游戏中的 js 文件
            // the js file in the game that this patch need to apply to
            "js": "aaa.js"
          },
          {
            "fileDiff": "pathTo/bbb_css.diff",
            "fileBase": "pathTo/bbb.css",
            "css": "bbb.css"
          }
        ]
      }
    }
  ],
  "dependenceInfo": [
    {
      "modName": "ModLoader",
      "version": "^1.5.3"
    },
    {
      "modName": "Diff3WayMerge",
      "version": "^1.0.0"
    }
  ]
}
```

`fileDiff.diff` 文件使用 [generateDiff.ts](tool%2FgenerateDiff.ts) 中的 `generateDiff()`函数生成，大致格式如下 ， `DiffFormat[]`

`fileDiff.diff` file is generate by `generateDiff()` function in [generateDiff.ts](tool%2FgenerateDiff.ts), the format is `DiffFormat[]`


```json lines
[
  {
    "op": 1,
    "text": "ABC"
  },
  {
    "op": -1,
    "text": "ABC"
  },
  {
    "op": 1,
    "text": "ABC"
  }
]
```

---

## example mod

example mod in the `mod` dir.


1. copy origin `xxx.js` file from game (english verion) to `origin_file` dir as `xxx.js`. copy origin passage `AAA`(passage name) from game to `origin_file` dir as `AAA.twee`.
2. copy the same file from `origin_file` dir to `mod_file` dir , modify it as you want.
3. use `node <path to/dist-tool/make-mod-diff.js> <path to mod dir>` to auto generate diff info in `patch_diff` and auto fill `boot.json`.
4. use the mod pack tool `packModZip.ts` in ModLoader to pack the mod.

command example:

```
node ./dist-tool/make-mod-diff.js mod
```


## 范例 mod

1. 从英文原版游戏复制你要修改的原始文件到`origin_file`文件夹。例如复制原始游戏的`xxx.js`到`origin_file`作为`xxx.js`，或从原始游戏找到整个passage（从`:: passage name`的双冒号开始到下一个双冒号的前一行或者文件结尾结束）到`origin_file`并命名为`passage name.twee`。
2. 从`origin_file`复制相同的文件到`mod_file`文件夹，按照你的需要修改它。
3. 按照 `node <path to/dist-tool/make-mod-diff.js> <path to mod dir>` 的格式使用调用 `make-mod-diff.js` 来自动生成diff文件到`patch_diff`文件夹，并自动填充`boot.json`文件中的`Diff3WayMergeAddon`和`additionFile`。
4. 使用ModLoader中的mod打包工具`packModZip.ts`打包生成 mod.zip。

命令范例：

```
node ./dist-tool/make-mod-diff.js mod
```


