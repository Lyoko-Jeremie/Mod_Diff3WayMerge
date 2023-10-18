import {
    Diff,
    DIFF_DELETE,
    DIFF_EQUAL,
    DIFF_INSERT,
    diff_match_patch,
    patch_obj
} from "./diff_match_patch/diff_match_patch";
import {every, isArray, isNumber, isString} from "lodash";
import {
    diffWords,
    createPatch,
    applyPatch,
    convertChangesToDMP,
    convertChangesToXML,
    createTwoFilesPatch,
    applyPatches,
    parsePatch,
    merge,
} from 'diff';

export interface DiffFormat {
    op: number | typeof DIFF_DELETE | typeof DIFF_INSERT | typeof DIFF_EQUAL;
    text: string;
}

export function DiffFormat2Diff(l: DiffFormat[]) {
    return l.map((T) => new Diff(T.op, T.text));
}

export function checkDiffFormatFile(a: any): a is DiffFormat {
    if (isArray(a) && every(a, T => isString(T.text) && isNumber(T.op))) {
        return true;
    }
    return false;
}

export function mergeFile0(
    dmp: diff_match_patch,
    gameFile: string,
    modBase: string,
    modDiff: Diff[],
): [string, boolean[], patch_obj[]] {
    // calc modBase -> modDiff
    // calc modBase -> gameFile
    // modBase -> patchTo -> gameFile -> patchTo -> modDiff
    // we get modBase -> gameFile -> modDiff
    const d01 = dmp.diff_main(modBase, gameFile);
    // const d02 = dmp.diff_main(modBase, modDiff);
    const p1 = dmp.patch_make(modBase, d01);
    const p2 = dmp.patch_make(modBase, modDiff);
    const pp = p1.concat(p2);
    const rr = dmp.patch_apply(pp, modBase);
    return [rr[0], rr[1], pp];
}

export function mergeFile(
    dmp: diff_match_patch,
    gameFile: string,
    modBase: string,
    modDiff: Diff[],
): [string, boolean[], patch_obj[]] {
    // calc modBase -> modDiff
    // calc modBase -> gameFile
    // modBase -> patchTo -> gameFile -> patchTo -> modDiff
    // we get modBase -> gameFile -> modDiff


    const p0 = dmp.patch_make(modBase, modDiff);
    const modFile = dmp.patch_apply(p0, modBase)[0];

    const newBase = modBase.replaceAll('\r\n', '\n').trimEnd();
    const d01 = dmp.diff_main(newBase, gameFile.replaceAll('\r\n', '\n').trimEnd());
    const p1 = dmp.patch_make(newBase, d01);

    const d02 = dmp.diff_main(newBase, modFile.replaceAll('\r\n', '\n').trimEnd());
    const p2 = dmp.patch_make(newBase, d02);

    // const p12 = dmp.patch_make(newBase, d01.concat(d02));

    const pp = p1.concat(p2);
    const rr = dmp.patch_apply(pp, newBase);
    return [rr[0], rr[1], pp];
}

export function mergeFile_v2(
    dmp: diff_match_patch,
    gameFile: string,
    modBase: string,
    modFile: string,
): [string, boolean[], patch_obj[]] {
    // calc modBase -> modDiff
    // calc modBase -> gameFile
    // modBase -> patchTo -> gameFile -> patchTo -> modDiff
    // we get modBase -> gameFile -> modDiff

    const newBase = modBase.replaceAll('\r\n', '\n').trimEnd();
    const d01 = dmp.diff_main(newBase, gameFile.replaceAll('\r\n', '\n').trimEnd());
    const p1 = dmp.patch_make(newBase, d01);

    const d02 = dmp.diff_main(newBase, modFile.replaceAll('\r\n', '\n').trimEnd());
    const p2 = dmp.patch_make(newBase, d02);

    // const p12 = dmp.patch_make(newBase, d01.concat(d02));

    const pp = p1.concat(p2);
    const rr = dmp.patch_apply(pp, newBase);
    return [rr[0], rr[1], pp];
}

export function mergeFile_t(
    dmp: diff_match_patch,
    gameFile: string,
    modBase: string,
    modDiff: Diff[],
) {
    // calc modBase -> modDiff
    // calc modBase -> gameFile
    // modBase -> patchTo -> gameFile -> patchTo -> modDiff
    // we get modBase -> gameFile -> modDiff


    const p0 = dmp.patch_make(modBase, modDiff);
    const modFile = dmp.patch_apply(p0, modBase)[0].replace(/\r\n/g, '\n').trimEnd();

    const newBase = modBase.replace(/\r\n/g, '\n').trimEnd();
    console.log([gameFile, modFile, newBase]);
    const mR = merge(gameFile, modFile, newBase);
    console.log('mR', mR);
    const R = applyPatch(newBase, mR, {fuzzFactor: 10});
    return R;
}

function diff_lineMode(text1: string, text2: string) {
    var dmp = new diff_match_patch();
    var a = dmp.diff_linesToChars_(text1, text2);
    var lineText1 = a.chars1;
    var lineText2 = a.chars2;
    var lineArray = a.lineArray;
    var diffs = dmp.diff_main(lineText1, lineText2, false);
    dmp.diff_charsToLines_(diffs, lineArray);
    return diffs;
}

function diff_linesToWords(text1: string, text2: string) {
    var dmp = new diff_match_patch();
    var a = dmp.diff_linesToChars_(text1, text2);
    var lineText1 = a.chars1;
    var lineText2 = a.chars2;
    var lineArray = a.lineArray;
    var diffs = dmp.diff_main(lineText1, lineText2, false);
    dmp.diff_charsToLines_(diffs, lineArray);
    return diffs;
}
