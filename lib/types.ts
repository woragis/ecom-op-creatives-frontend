export type Product = {
  id: string;
  name: string;
  url?: string;
  niche?: string;
  createdAt: string;
  updatedAt: string;
};

export type PipelineStep = {
  id: string;
  creativeRunId: string;
  stepType: string;
  stepOrder: number;
  status: string;
  outputJson: unknown;
};

export type RunAssets = {
  personaImage?: string;
  productImage?: string;
  introClip?: string;
};

export type CreativeRun = {
  id: string;
  productId: string;
  videoProvider: string;
  imageProvider: string;
  inputAssets?: RunAssets;
  status: string;
  hook?: string;
  createdAt: string;
  updatedAt: string;
  steps?: PipelineStep[];
};
