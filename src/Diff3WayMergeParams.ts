import {every, isArray, isNil, isString, isObject, get} from "lodash";

export function checkPatchFileItem(n: PatchFileItem): n is PatchFileItem {
    // if (
    //     // @ts-ignore
    //     (isString(n.css) + isString(n.js) + isString(n.passage)) !== 1 ||
    //     // @ts-ignore
    //     (isNil(n.css) + isNil(n.js) + isNil(n.passage)) !== 2
    // ) {
    //     return false;
    // }
    if (
        (isString(n.css) && !isString(n.js) && !isString(n.passage)) ||
        (!isString(n.css) && isString(n.js) && !isString(n.passage)) ||
        (!isString(n.css) && !isString(n.js) && isString(n.passage))
    ) {
        // if (!isString(n.fileDiff)) {
        //     console.error('checkPatchFileItem false (!isString(n.fileDiff))', [n]);
        //     return false;
        // }
        if (!isString(n.fileBase)) {
            console.error('checkPatchFileItem false (!isString(n.fileBase))', [n]);
            return false;
        }
        if (!isString(n.fileMod)) {
            console.error('checkPatchFileItem false (!isString(n.fileMod))', [n]);
            return false;
        }
        return true;
    }
    console.error('checkPatchFileItem false', [
        n,
        (isString(n.css) && !isString(n.js) && !isString(n.passage)),
        (!isString(n.css) && isString(n.js) && !isString(n.passage)),
        (!isString(n.css) && !isString(n.js) && isString(n.passage)),
    ]);
    return false;
}

export interface PatchFileItem {
    /**
     * the diff patch file path , the patch file is a diff format file that apply to the base file to get the mod modify
     * a file contains a list of Diff:  Diff[]
     *
     * file content example:
     * ```json
     * [
     *   { op:0, text:'' },
     *   { op:0, text:'' },
     *   { op:0, text:'' },
     *   { op:0, text:'' }
     * ]
     * ```
     *
     * @type {string}
     */
    fileDiff: string;
    /**
     * the origin file path
     */
    fileBase: string;
    /**
     * the mod file path
     * the fileDiff must calc from fileBase to fileMod
     */
    fileMod: string;

    passage?: string;
    js?: string;
    css?: string;
}

export interface Diff3WayMergeParams {
    patchFileList: PatchFileItem[];
}

export function checkParams(a: any): a is Diff3WayMergeParams {
    if (isObject(a) && isArray(get(a, 'patchFileList')) && every(get(a, 'patchFileList'), checkPatchFileItem)) {
        return true;
    }
    console.error('checkParams false', [
        a,
        isObject(a),
        isArray(get(a, 'patchFileList')),
        every(a, checkPatchFileItem),
    ]);
    return false;
}
