import {readFile, writeFile, readFileSync, writeFileSync} from 'fs';
import {promisify, inspect} from 'util';

import {diff_match_patch} from '../src/diff_match_patch/diff_match_patch';
import Diff, {
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
import diff3Merge from 'diff3';


if (true) {
    const A = readFileSync('./test_data/A.txt', 'utf8');
    const B = readFileSync('./test_data/B.txt', 'utf8');
    const C = readFileSync('./test_data/C.txt', 'utf8');

    // console.log("A:", A);
    // console.log("B:", B);
    // console.log("C:", C);

    const diff01 = new diff_match_patch();
    const diff02 = new diff_match_patch();

    const d01 = diff01.diff_main(A, B);
    const d02 = diff01.diff_main(A, C);

    // console.log("d01:", d01);
    console.log("d01:", diff01.diff_toDelta(d01));
    // console.log("d02:", d02);
    console.log("d02:", diff02.diff_toDelta(d02));

    // const p1 = diff01.patch_make(A, d01);
    // const p2 = diff01.patch_make(A, d02);
    const p1 = diff01.patch_make(A, diff01.diff_fromDelta(A, diff01.diff_toDelta(d01)));
    const p2 = diff01.patch_make(A, diff01.diff_fromDelta(A, diff01.diff_toDelta(d02)));

    const rr = diff01.patch_apply(p1.concat(p2), A);
    console.log("rr:", rr);
}

if (false) {
    const A = readFileSync('./test_data/A.txt', 'utf8');
    const B = readFileSync('./test_data/B.txt', 'utf8');
    const C = readFileSync('./test_data/C.txt', 'utf8');

    // console.log("A:", A);
    // console.log("B:", B);
    // console.log("C:", C);

    const d01 = diffWords(A, B);
    const d02 = diffWords(A, C);

    console.log("d01:", d01.length);
    console.log("d01:", d01[1]);
    // console.log("d01:", convertChangesToXML(d01));
    // console.log("d01:", convertChangesToDMP(d01));
    console.log("d02:", d02.length);
    // console.log("d02:", convertChangesToXML(d02));
    // console.log("d02:", convertChangesToDMP(d02));
}

if (false) {
    const A = readFileSync('./test_data/A.txt', 'utf8');
    const B = readFileSync('./test_data/B.txt', 'utf8');
    const C = readFileSync('./test_data/C.txt', 'utf8');

    // console.log("A:", A);
    // console.log("B:", B);
    // console.log("C:", C);

    const rr = merge(B, C, A);
    console.log("rr:", JSON.stringify(rr, undefined, 2));
}

if (false) {
    const A = readFileSync('./test_data/A.txt', 'utf8');
    const B = readFileSync('./test_data/B.txt', 'utf8');
    const C = readFileSync('./test_data/C.txt', 'utf8');

    // console.log("A:", A);
    // console.log("B:", B);
    // console.log("C:", C);

    const d01 = createTwoFilesPatch('A', 'B', A, B);
    const d02 = createTwoFilesPatch('A', 'C', A, C);

    console.log("d01:", d01);
    // console.log("d01:", convertChangesToXML(d01));
    // console.log("d01:", convertChangesToDMP(d01));
    console.log("d02:", d02);
    // console.log("d02:", convertChangesToXML(d02));
    // console.log("d02:", convertChangesToDMP(d02));

    const p1 = parsePatch(d01);
    const p2 = parsePatch(d02);
    console.log("p1:", p1);
    console.log("p2:", p2);

    const rr = ([] as Diff.ParsedDiff[]).concat(p1).concat(p2).reduce((acc, b) => {
        acc = applyPatch(acc, b);
        console.log("acc:", acc);
        return acc;
    }, A);
    console.log("rr:", rr);
}

if (false) {
    const A = readFileSync('./test_data/A.txt', 'utf8');
    const B = readFileSync('./test_data/B.txt', 'utf8');
    const C = readFileSync('./test_data/C.txt', 'utf8');

    console.log("A:", A);
    console.log("B:", B);
    console.log("C:", C);

    const df = diff3Merge(B.split(''), A.split(''), C.split(''));

    console.log("df:", JSON.stringify(df, undefined, 2));
}
