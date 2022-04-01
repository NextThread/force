/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type HoverDetails_artwork = {
    readonly internalID: string;
    readonly attributionClass: {
        readonly name: string | null;
    } | null;
    readonly mediumType: {
        readonly name: string | null;
    } | null;
    readonly " $refType": "HoverDetails_artwork";
};
export type HoverDetails_artwork$data = HoverDetails_artwork;
export type HoverDetails_artwork$key = {
    readonly " $data"?: HoverDetails_artwork$data;
    readonly " $fragmentRefs": FragmentRefs<"HoverDetails_artwork">;
};



const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "HoverDetails_artwork",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "internalID",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "AttributionClass",
      "kind": "LinkedField",
      "name": "attributionClass",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ArtworkMedium",
      "kind": "LinkedField",
      "name": "mediumType",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    }
  ],
  "type": "Artwork",
  "abstractKey": null
};
})();
(node as any).hash = 'f2b85e1e0f7c36fa06484f674f64bc26';
export default node;