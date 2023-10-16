import {exit} from 'process';
import {readdir, stat, readFile, writeFile} from 'fs';
import {join} from 'path';
import {promisify} from 'util';
import {generateDiff, generateDiff2} from './generateDiff';
import {diff_match_patch} from "../src/diff_match_patch/diff_match_patch";

;(async () => {

    console.log('process.argv', process.argv);

    const base_dir = process.argv[2] || './mod';

    const mod_file_dir = join(base_dir, 'mod_file');
    const origin_file_dir = join(base_dir, 'origin_file');
    const patch_file_dir = join(base_dir, 'patch_diff');

    const dmp = new diff_match_patch();

    let files_mod = (await promisify(readdir)(mod_file_dir));
    // list all file
    let files_twee_passage = [];
    let files_js = [];
    for (const f of files_mod) {
        const s = await promisify(stat)(join(mod_file_dir, f));
        if (!s.isDirectory()) {
            if (f.endsWith('.js')) {
                files_js.push(f);
            } else if (f.endsWith('.twee')) {
                files_twee_passage.push(f);
            }
        }
    }
    console.log('files_js', files_js);
    console.log('files_twee_passage', files_twee_passage);

    const files_origin = (await promisify(readdir)(origin_file_dir));
    // check have origin file
    const files_twee_passage_t = [];
    for (const f of files_twee_passage) {
        if (!files_origin.find(T => T === f)) {
            console.error('origin file not found', f);
        } else {
            files_twee_passage_t.push(f);
        }
    }
    files_twee_passage = files_twee_passage_t;
    const files_js_t = [];
    for (const f of files_js) {
        if (!files_origin.find(T => T === f)) {
            console.error('origin file not found', f);
        } else {
            files_js_t.push(f);
        }
    }
    files_js = files_js_t;
    console.log('files_twee_passage', files_twee_passage);
    console.log('files_js', files_js);

    const files_twee_passage_diff = [];
    for (const f of files_twee_passage) {
        const fo = await promisify(readFile)(join(origin_file_dir, f), 'utf8');
        const fm = await promisify(readFile)(join(mod_file_dir, f), 'utf8');
        const fd = generateDiff(dmp, fo, fm);
        const fn = f + '.diff';
        const p = join(patch_file_dir, fn);
        await promisify(writeFile)(p, JSON.stringify(fd, null, 2), 'utf8');
        // await promisify(writeFile)(p, fd, 'utf8');
        files_twee_passage_diff.push(fn);
    }
    console.log('files_twee_passage_diff', files_twee_passage_diff);

    const files_js_diff = [];
    for (const f of files_js) {
        const fo = await promisify(readFile)(join(origin_file_dir, f), 'utf8');
        const fm = await promisify(readFile)(join(mod_file_dir, f), 'utf8');
        const fd = generateDiff(dmp, fo, fm);
        const fn = f + '.diff';
        const p = join(patch_file_dir, fn);
        await promisify(writeFile)(p, JSON.stringify(fd, null, 2), 'utf8');
        // await promisify(writeFile)(p, fd, 'utf8');
        files_js_diff.push(fn);
    }
    console.log('files_js_diff', files_js_diff);

    const bootJ = JSON.parse(await promisify(readFile)(join(base_dir, 'boot.json'), 'utf8'));
    if (!bootJ) {
        console.error('boot.json invalid');
        exit(1);
    }
    let addList = (bootJ?.addonPlugin as any[] | undefined) || [];
    let adObj = addList.find((T: any) => T?.modName === 'Diff3WayMerge' && T?.addonName === 'Diff3WayMergeAddon');
    if (adObj) {
        // remove it
        addList = addList.filter((T: any) => !(T?.modName === 'Diff3WayMerge' && T?.addonName === 'Diff3WayMergeAddon'));
    } else {
        adObj = {
            "modName": "Diff3WayMerge",
            "addonName": "Diff3WayMergeAddon",
            "modVersion": "^1.0.0",
            "params": {
                "patchFileList": []
            }
        };
    }
    console.log('addList', addList);
    adObj.modVersion = '^1.0.0';

    const patchFileList = [];

    for (const f of files_twee_passage_diff) {
        patchFileList.push({
            fileDiff: join(patch_file_dir, f),
            fileBase: join(origin_file_dir, f.replace('.diff', '')),
            passage: f.replace('.diff', '').replace('.twee', ''),  // TODO
        });
    }
    for (const f of files_js_diff) {
        patchFileList.push({
            fileDiff: join(patch_file_dir, f),
            fileBase: join(origin_file_dir, f.replace('.diff', '')),
            js: f.replace('.diff', '').replace('.js', ''),  // TODO
        });
    }

    adObj.params = {
        patchFileList: patchFileList,
    };
    addList.push(adObj);
    console.log('addList', addList);
    bootJ.addonPlugin = addList;

    await promisify(writeFile)(join(base_dir, 'boot.json'), JSON.stringify(bootJ, null, 2), 'utf8');

})().catch(E => {
    console.error(E);
});

