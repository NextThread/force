/* tslint:disable */
/* eslint-disable */

import { ConcreteRequest } from "relay-runtime";
import { FragmentRefs } from "relay-runtime";
export type SettingsEditProfileAboutYou_Test_QueryVariables = {};
export type SettingsEditProfileAboutYou_Test_QueryResponse = {
    readonly me: {
        readonly " $fragmentRefs": FragmentRefs<"SettingsEditProfileAboutYou_me">;
    } | null;
};
export type SettingsEditProfileAboutYou_Test_Query = {
    readonly response: SettingsEditProfileAboutYou_Test_QueryResponse;
    readonly variables: SettingsEditProfileAboutYou_Test_QueryVariables;
};



/*
query SettingsEditProfileAboutYou_Test_Query {
  me {
    ...SettingsEditProfileAboutYou_me
    id
  }
}

fragment SettingsEditProfileAboutYou_me on Me {
  location {
    display
    id
  }
  profession
  shareFollows
}
*/

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "SettingsEditProfileAboutYou_Test_Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Me",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SettingsEditProfileAboutYou_me"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query"
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SettingsEditProfileAboutYou_Test_Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Me",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "MyLocation",
            "kind": "LinkedField",
            "name": "location",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "display",
                "storageKey": null
              },
              (v0/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "profession",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "shareFollows",
            "storageKey": null
          },
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": null,
    "metadata": {},
    "name": "SettingsEditProfileAboutYou_Test_Query",
    "operationKind": "query",
    "text": "query SettingsEditProfileAboutYou_Test_Query {\n  me {\n    ...SettingsEditProfileAboutYou_me\n    id\n  }\n}\n\nfragment SettingsEditProfileAboutYou_me on Me {\n  location {\n    display\n    id\n  }\n  profession\n  shareFollows\n}\n"
  }
};
})();
(node as any).hash = '9520b3526bb5bfa422fb845648fe8131';
export default node;