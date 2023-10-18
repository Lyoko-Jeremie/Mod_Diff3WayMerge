import type {AddonPluginHookPointEx} from "../../../dist-BeforeSC2/AddonPlugin";
import type {ModBootJsonAddonPlugin, ModInfo} from "../../../dist-BeforeSC2/ModLoader";
import type {ModZipReader} from "../../../dist-BeforeSC2/ModZipReader";
import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";
import type {LogWrapper} from "../../../dist-BeforeSC2/ModLoadController";
import type {SC2DataInfo} from "../../../dist-BeforeSC2/SC2DataInfoCache";
import {isNil, isString, isArray, every, isNumber} from 'lodash';
import {
    diff_match_patch,
} from './diff_match_patch/diff_match_patch';
import {checkDiffFormatFile, DiffFormat2Diff, mergeFile, mergeFile_t} from "./DiffFormat";
import {checkParams} from "./Diff3WayMergeParams";

export interface ModMergeInfo {
    addonName: string;
    mod: ModInfo;
    modZip: ModZipReader;
}

export class Diff3WayMerge implements AddonPluginHookPointEx {
    private log: LogWrapper;

    constructor(
        public gSC2DataManager: SC2DataManager,
        public gModUtils: ModUtils,
    ) {
        this.log = gModUtils.getLogger();
        this.gModUtils.getAddonPluginManager().registerAddonPlugin(
            'Diff3WayMerge',
            'Diff3WayMergeAddon',
            this,
        );
    }

    info: Map<string, ModMergeInfo> = new Map<string, ModMergeInfo>();

    async registerMod(addonName: string, mod: ModInfo, modZip: ModZipReader) {
        this.info.set(mod.name, {
            addonName,
            mod,
            modZip,
        });
    }

    async afterPatchModToGame() {
        const scOld = this.gSC2DataManager.getSC2DataInfoAfterPatch();
        const scOrigin = this.gSC2DataManager.getSC2DataInfoCache();
        const sc = scOld.cloneSC2DataInfo();
        for (const [name, ri] of this.info) {
            try {
                await this.do_patch(ri, sc, scOrigin);
            } catch (e: any | Error) {
                console.error(e);
                this.log.error(`Diff3WayMerge: [${name}] ${e?.message ? e.message : e}`);
            }
        }
        this.gModUtils.replaceFollowSC2DataInfo(sc, scOld);
    }

    async do_patch(ri: ModMergeInfo, sc: SC2DataInfo, scOrigin: SC2DataInfo) {
        const ad = ri.mod.bootJson.addonPlugin?.find((T: ModBootJsonAddonPlugin) => {
            return T.modName === 'Diff3WayMerge'
                && T.addonName === 'Diff3WayMergeAddon';
        });
        if (!ad) {
            // never go there
            console.error('Diff3WayMerge do_patch() (!ad).', [ri.mod]);
            return;
        }
        const params = ad.params;
        if (!checkParams(params)) {
            console.error('Diff3WayMerge do_patch() (!this.checkParams(p)).', [ri.mod, params]);
            this.log.error(`Diff3WayMerge do_patch() invalid params p: ${ri.mod.name} ${JSON.stringify(params)}`);
            return;
        }
        console.log('Diff3WayMerge do_patch() start.', [ri.mod]);
        this.log.log(`Diff3WayMerge do_patch() start: ${ri.mod.name}`);

        const dmp = new diff_match_patch();
        for (const p of params.patchFileList) {
            if (isString(p.js)) {
                const d = await this.readDiffFormatFile(ri, p.fileDiff);
                const b = await this.readOriginFile(ri, p.fileBase);
                if (!d || !b) {
                    continue;
                }
                const f = sc.scriptFileItems.map.get(p.js);
                if (!f) {
                    console.error('Diff3WayMerge do_patch() cannot find file.', [ri.mod, p.js]);
                    this.log.error(`Diff3WayMerge do_patch() cannot find file: [${ri.mod.name}] [${p.js}]`);
                    continue;
                }
                const originC = scOrigin.scriptFileItems.map.get(p.js)?.content;
                if (!originC) {
                    // never go there
                    console.error('Diff3WayMerge do_patch() cannot find origin file.', [ri.mod, p.js]);
                } else {
                    if (originC !== b) {
                        console.warn('Diff3WayMerge do_patch() origin file changed.', [ri.mod, p.js, dmp.patch_toText(dmp.patch_make(originC, b))]);
                        this.log.warn(`Diff3WayMerge do_patch() origin file changed: [${ri.mod.name}] [${p.js}]`);
                    }
                }
                const r = mergeFile(dmp, b, f.content, DiffFormat2Diff(d));
                if (!every(r[1], T => T)) {
                    console.error('Diff3WayMerge do_patch() cannot merge file.', [ri.mod, p.js, r]);
                    console.error('Diff3WayMerge do_patch() cannot merge file failed:',
                        r[1].filter(T => !T).length,
                        r[2].filter((T, i) => !r[1][i]));
                    console.error('Diff3WayMerge do_patch() merge file failed result:', [r[0]]);
                    this.log.error(`Diff3WayMerge do_patch() cannot merge file: [${ri.mod.name}] [${p.js}] . failed:[${r[1].filter(T => !T).length}]`);
                    continue;
                }
                f.content = r[0];
            } else if (isString(p.css)) {
                const d = await this.readDiffFormatFile(ri, p.fileDiff);
                const b = await this.readOriginFile(ri, p.fileBase);
                if (!d || !b) {
                    continue;
                }
                const f = sc.styleFileItems.map.get(p.css);
                if (!f) {
                    console.error('Diff3WayMerge do_patch() cannot find file.', [ri.mod, p.css]);
                    this.log.error(`Diff3WayMerge do_patch() cannot find file: [${ri.mod.name}] [${p.css}]`);
                    continue;
                }
                const originC = scOrigin.scriptFileItems.map.get(p.css)?.content;
                if (!originC) {
                    // never go there
                    console.error('Diff3WayMerge do_patch() cannot find origin file.', [ri.mod, p.css]);
                } else {
                    if (originC !== b) {
                        console.warn('Diff3WayMerge do_patch() origin file changed.', [ri.mod, p.css, dmp.patch_toText(dmp.patch_make(originC, b))]);
                        this.log.warn(`Diff3WayMerge do_patch() origin file changed: [${ri.mod.name}] [${p.css}]`);
                    }
                }
                const r = mergeFile(dmp, b, f.content, DiffFormat2Diff(d));
                if (!every(r[1], T => T)) {
                    console.error('Diff3WayMerge do_patch() cannot merge file.', [ri.mod, p.css, r]);
                    console.error('Diff3WayMerge do_patch() cannot merge file failed:',
                        r[1].filter(T => !T).length,
                        r[2].filter((T, i) => !r[1][i]));
                    console.error('Diff3WayMerge do_patch() merge file failed result:', [r[0]]);
                    this.log.error(`Diff3WayMerge do_patch() cannot merge file: [${ri.mod.name}] [${p.css}] . failed:[${r[1].filter(T => !T).length}]`);
                    continue;
                }
                f.content = r[0];
            } else if (isString(p.passage)) {
                const d = await this.readDiffFormatFile(ri, p.fileDiff);
                const b = await this.readOriginFile(ri, p.fileBase);
                if (!d || !b) {
                    continue;
                }
                const f = sc.passageDataItems.map.get(p.passage);
                if (!f) {
                    console.error('Diff3WayMerge do_patch() cannot find file.', [ri.mod, p.passage]);
                    this.log.error(`Diff3WayMerge do_patch() cannot find file: [${ri.mod.name}] [${p.passage}]`);
                    continue;
                }
                const gameFile = `:: ${f.name}`
                    + `${f.tags.length === 0 ? '' : (' [' + f.tags[0] + ']')}`
                    + `\n${f.content}`;
                const originP = scOrigin.passageDataItems.map.get(p.passage);
                if (!originP) {
                    // never go there
                    console.error('Diff3WayMerge do_patch() cannot find origin file.', [ri.mod, p.js]);
                } else {
                    const data = `:: ${originP.name}`
                        + `${originP.tags.length === 0 ? '' : (' [' + originP.tags[0] + ']')}`
                        + `\n${originP.content}`;
                    if (data.trimEnd() !== b.replace(/\r\n/g, '\n').trimEnd()) {
                        console.warn('Diff3WayMerge do_patch() origin file changed.', [ri.mod, p.passage, data.trimEnd(), b.replace(/\r\n/g, '\n').trimEnd(), dmp.patch_toText(dmp.patch_make(data, b))]);
                        this.log.warn(`Diff3WayMerge do_patch() origin file changed: [${ri.mod.name}] [${p.passage}]`);
                    }
                }
                // const rrr = mergeFile_t(dmp, gameFile, b, DiffFormat2Diff(d));
                // console.log('rrr', rrr);
                const r = mergeFile(dmp, gameFile, b, DiffFormat2Diff(d));
                if (!every(r[1], T => T)) {
                    console.error('Diff3WayMerge do_patch() cannot merge file.', [ri.mod, p.passage, r]);
                    console.error('Diff3WayMerge do_patch() cannot merge file failed:',
                        r[1].filter(T => !T).length,
                        r[2].filter((T, i) => !r[1][i]));
                    console.error('Diff3WayMerge do_patch() merge file failed result:', [r[0]]);
                    this.log.error(`Diff3WayMerge do_patch() cannot merge file: [${ri.mod.name}] [${p.passage}] . failed:[${r[1].filter(T => !T).length}]`);
                    continue;
                }
                f.content = r[0];
            }
        }
        sc.scriptFileItems.back2Array();
        sc.styleFileItems.back2Array();
        sc.passageDataItems.back2Array();
        console.log('ReplacePatcher do_patch() done.', [ri.mod]);
        this.log.log(`ReplacePatcher do_patch() done: ${ri.mod.name}`);
    }

    async readOriginFile(ri: ModMergeInfo, fName: string) {
        const fd = ri.modZip.zip.file(fName);
        if (!fd) {
            console.error('Diff3WayMerge readOriginFile() cannot find diff file.', [ri.mod, fName]);
            this.log.error(`Diff3WayMerge readOriginFile() cannot find diff file: [${ri.mod.name}] [${fName}]`);
            return undefined;
        }
        const dd = await fd.async('string');
        return dd;
    }

    async readDiffFormatFile(ri: ModMergeInfo, fName: string) {
        const fd = ri.modZip.zip.file(fName);
        if (!fd) {
            console.error('Diff3WayMerge readDiffFormatFile() cannot find diff file.', [ri.mod, fName]);
            this.log.error(`Diff3WayMerge readDiffFormatFile() cannot find diff file: [${ri.mod.name}] [${fName}]`);
            return undefined;
        }
        const dd = await fd.async('string');
        // @ts-ignore
        let d: DiffFormat[];
        try {
            d = JSON.parse(dd);
        } catch (e) {
            console.error('Diff3WayMerge readDiffFormatFile() cannot parse diff file.', [ri.mod, fName, dd]);
            this.log.error(`Diff3WayMerge readDiffFormatFile() cannot parse diff file: [${ri.mod.name}] [${fName}]`);
            return undefined;
        }
        if (!checkDiffFormatFile(d)) {
            console.error('Diff3WayMerge readDiffFormatFile() invalid diff file DiffFormat.', [ri.mod, fName, d]);
            this.log.error(`Diff3WayMerge readDiffFormatFile() invalid diff file DiffFormat: [${ri.mod.name}] [${fName}]`);
            return undefined;
        }
        return d;
    }

}

