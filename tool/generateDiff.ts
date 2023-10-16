import {Diff, diff_match_patch} from "../src/diff_match_patch/diff_match_patch";
import {DiffFormat} from "../src/DiffFormat";

export function covertDiff2DiffFormat(d: Diff[]) {
    return d.map<DiffFormat>(T => {
        return {
            op: T[0],
            text: T[1],
        };
    })
}

export function generateDiff(
    dmp: diff_match_patch,
    modBase: string,
    modDiff: string,
): DiffFormat[] {
    const d02 = dmp.diff_main(modBase, modDiff);
    return covertDiff2DiffFormat(d02);
}

// export function generateDiff2(
//     dmp: diff_match_patch,
//     modBase: string,
//     modDiff: string,
// ): string {
//     const d02 = dmp.patch_make(modBase, modDiff);
//     return dmp.patch_toText(d02);
// }


