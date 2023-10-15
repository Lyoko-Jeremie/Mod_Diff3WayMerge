import {Diff, DIFF_DELETE, DIFF_EQUAL, DIFF_INSERT, diff_match_patch} from "./diff_match_patch/diff_match_patch";
import {every, isArray, isNumber, isString} from "lodash";

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

export function mergeFile(
    dmp: diff_match_patch,
    gameFile: string,
    modBase: string,
    modDiff: Diff[],
) {
    // calc modBase -> modDiff
    // calc modBase -> gameFile
    // modBase -> patchTo -> gameFile -> patchTo -> modDiff
    // we get modBase -> gameFile -> modDiff
    const d01 = dmp.diff_main(modBase, gameFile);
    // const d02 = dmp.diff_main(modBase, modDiff);
    const p1 = dmp.patch_make(modBase, d01);
    const p2 = dmp.patch_make(modBase, modDiff);
    const rr = dmp.patch_apply(p1.concat(p2), modBase);
    return rr;
}
