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
            // the diff file that will patch to base file
            // mod 对游戏的修改，以 diff 文件的形式提供，这个修改基于 fileBase 计算产生
            "fileDiff": "pathTo/passageA.diff",
            // the origin file that need to patch (it come from game and not change)
            // 来自游戏的原始文件，上面的 fileDiff 应用到这个文件上后产生的结果是mod说期望的结果
            "fileBase": "pathTo/passageA.txt",
            // the passage name that will be patched in game
            // 游戏中的 passage 名称，这个名称是游戏中的 passage 名称，不是文件名。
            // 这个patch需要应用到的游戏中的passage 名称
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


