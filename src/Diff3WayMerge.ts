import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";

import {diff_match_patch} from './diff_match_patch/diff_match_patch';
import Diff, {diffWords, createPatch, applyPatch, convertChangesToDMP} from 'diff';

export class Diff3WayMerge {
    constructor(
        public gSC2DataManager: SC2DataManager,
        public gModUtils: ModUtils,
    ) {
        // Diff.createPatch('a', 'b', 'c', 'd', 'e');
    }
}

