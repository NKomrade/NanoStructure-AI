import * as tf from "@tensorflow/tfjs";

let model: tf.LayersModel | null = null;

export const loadModel = async (): Promise<tf.LayersModel> => {
  if (model) {
    return model;
  }
  try {
    model = await tf.loadLayersModel("/tfjs_model/model.json");
    console.log("Model loaded successfully");
    return model;
  } catch (error) {
    console.error("Error loading model:", error);
    throw new Error("Could not load the model.");
  }
};
