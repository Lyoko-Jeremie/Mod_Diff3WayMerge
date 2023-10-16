# Diff3WayMergeExampleMode

这是一个示例mod，用于演示如何使用 Diff3WayMerge mod

---

有关各个目录：

`Diff3WayMergeExampleMode/origin_file` ：mod 需要修改的游戏css/js源文件或passage，这里是没有任何修改的英文版游戏原始源文件，这些文件**需要**打包到最终 mod 中

`Diff3WayMergeExampleMode/mod_file` ： mod 修改后的游戏css/js源文件或passage，和上面origin_file文件夹中的文件一一对应，这些文件**不需要**打包到最终 mod 中

`Diff3WayMergeExampleMode/patch_diff` ： mod_file 相对于 origin_file 的差异信息，这些文件**由脚本自动生成**且**需要**打包到最终 mod 中



