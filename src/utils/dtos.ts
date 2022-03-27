export interface LayersConfig {
  growEditionSizeTo?: number;
  layersOrder?: Array<string>;
}

export interface Format {
  width?: number;
  height?: number;
}

export interface NewAppFormState {
  name?: string;
  description?: string;
  layers?: Array<LayersConfig>;
  format?: Format;
  rarityDelimiter?: string;
  shuffleLayerConfigurations?: boolean;
  uniqueDnaTorrance?: number;
  layersDirName?: string;
  outputDirName?: string;
  outputJsonDirName?: string;
  outputImagesDirName?: string;
  outputJsonFileName?: string;
  editionNameFormat?: string;
  tags?: string;
}

export interface FormError {
    component: string;
    isError: boolean;
    error: string;
}
