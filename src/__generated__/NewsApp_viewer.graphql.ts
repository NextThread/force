/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type NewsApp_viewer = {
    readonly " $fragmentRefs": FragmentRefs<"NewsIndexArticles_viewer">;
    readonly " $refType": "NewsApp_viewer";
};
export type NewsApp_viewer$data = NewsApp_viewer;
export type NewsApp_viewer$key = {
    readonly " $data"?: NewsApp_viewer$data | undefined;
    readonly " $fragmentRefs": FragmentRefs<"NewsApp_viewer">;
};



const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "NewsApp_viewer",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "NewsIndexArticles_viewer"
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};
(node as any).hash = '4ffa0e5cf3a7d02307a9cabaf6b894c8';
export default node;