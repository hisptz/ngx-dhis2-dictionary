export interface FunctionObject {
  selected?: boolean;
  unsaved?: boolean;
  active?: boolean;
  deleting?: boolean;
  id?: string;
  name?: string;
  displayName?: string;
  function?: string;
  rules?: Array<any>;
  description?: string;
  lastUpdated?: string;
  created?: string;
  externalAccess?: boolean;
  userGroupAccesses?: Array<any>;
  attributeValues?: Array<any>;
  translations?: Array<any>;
  userAccesses?: Array<any>;
  publicAccess?: string;
  href?: string;
  user?: any;
  saving?: boolean;
  isNew?: boolean;
  simulating?: boolean;
}
