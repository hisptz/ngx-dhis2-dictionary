export interface MetadataDictionary {
  id: string;
  name: string;
  description: string;
  progress: {
    loading: boolean;
    loadingSucceeded: boolean;
    loadingFailed: boolean;
  };
}
