export interface Layer {
  name: string;
}

export interface LayersConfig {
  growEditionSizeTo: number;
  layersOrder: Array<Layer>;
}

export interface Format {
  width: number;
  height: number;
}

export interface Preview {
  thumbPerRow: number;
  thumbWidth: number;
  imageRatio: number;
  imageName: string;
}

export enum Stage {
  NEW_PROJECT
}

export enum Status {
  PENDING, COMPLETED, FAILED, START_NEW_BASH_COMPLETED
}

export interface Project {
  name: string;
  wallet: string;
  hash?: string;
  signature?: string;
  description: string;
  layerConfigurations: Array<LayersConfig>;
  format: Format;
  rarityDelimiter: string;
  shuffleLayerConfigurations: boolean;
  uniqueDnaTorrance: number;
  layersDirName?: string;
  outputDirName: string;
  outputJsonDirName: string;
  outputImagesDirName: string;
  outputJsonFileName: string;
  editionNameFormat: string;
  tags?: string;
  svgBase64DataOnly: boolean;
  outputImagesCarFileName: string;
  outputMetadataCarFileName: string;
  preview: Preview;
  stage?: Stage;
  status?: Status;
  nfts?: Array<any>;
}

export interface Data {
  message: string;
}

export interface Response {
  status: "error" | "success";
  data: Data;
}