import {every, isArray, isNil, isString} from "lodash";

export function checkPatchFileItem(n: PatchFileItem): n is PatchFileItem {
    if (
        // @ts-ignore
        (isString(n.css) + isString(n.js) + isString(n.passage)) !== 1 ||
        // @ts-ignore
        (isNil(n.css) + isNil(n.js) + isNil(n.passage)) !== 2
    ) {
        return false;
    }
    if (!isString(n.fileDiff)) {
        return false;
    }
    if (!isString(n.fileBase)) {
        return false;
    }
    return true;
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

    passage?: string;
    js?: string;
    css?: string;
}

export interface Diff3WayMergeParams {
    patchFileList: PatchFileItem[];
}

export function checkParams(a: any): a is Diff3WayMergeParams {
    if (isArray(a) && every(a, checkPatchFileItem)) {
        return true;
    }
    return false;
}
