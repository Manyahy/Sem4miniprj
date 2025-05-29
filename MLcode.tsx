import * as tf from '@tensorflow/tfjs';

// Define the earthquake data
const earthquakeData = [
  { city: "Sapporo", depth_km: 55.3, avg_magnitude: 4.8, days_since_last_eq: 5, risk_level: "Medium Risk" },
  { city: "Sendai", depth_km: 60.1, avg_magnitude: 5.2, days_since_last_eq: 2, risk_level: "High Risk" },
  { city: "Tokyo", depth_km: 80.4, avg_magnitude: 5.0, days_since_last_eq: 1, risk_level: "Medium Risk" },
  { city: "Yokohama", depth_km: 78.6, avg_magnitude: 4.9, days_since_last_eq: 1, risk_level: "Medium Risk" },
  { city: "Nagoya", depth_km: 50.7, avg_magnitude: 4.6, days_since_last_eq: 3, risk_level: "Medium Risk" },
  { city: "Osaka", depth_km: 45.2, avg_magnitude: 4.5, days_since_last_eq: 4, risk_level: "Medium Risk" },
  { city: "Kyoto", depth_km: 48.0, avg_magnitude: 4.4, days_since_last_eq: 6, risk_level: "Low Risk" },
  { city: "Kobe", depth_km: 70.2, avg_magnitude: 5.3, days_since_last_eq: 2, risk_level: "Medium Risk" },
  { city: "Hiroshima", depth_km: 42.8, avg_magnitude: 4.2, days_since_last_eq: 10, risk_level: "Low Risk" },
  { city: "Fukuoka", depth_km: 38.7, avg_magnitude: 4.3, days_since_last_eq: 12, risk_level: "Low Risk" },
  { city: "Kagoshima", depth_km: 60.9, avg_magnitude: 4.7, days_since_last_eq: 7, risk_level: "Low Risk" },
  { city: "Naha", depth_km: 45.5, avg_magnitude: 4.1, days_since_last_eq: 8, risk_level: "Low Risk" },
  { city: "Aomori", depth_km: 65.0, avg_magnitude: 4.9, days_since_last_eq: 5, risk_level: "Medium Risk" },
  { city: "Akita", depth_km: 63.3, avg_magnitude: 4.8, days_since_last_eq: 6, risk_level: "Medium Risk" },
  { city: "Niigata", depth_km: 67.2, avg_magnitude: 5.0, days_since_last_eq: 3, risk_level: "Medium Risk" },
  { city: "Toyama", depth_km: 72.6, avg_magnitude: 5.1, days_since_last_eq: 1, risk_level: "Medium Risk" },
  { city: "Nagano", depth_km: 68.4, avg_magnitude: 4.6, days_since_last_eq: 4, risk_level: "Medium Risk" },
  { city: "Shizuoka", depth_km: 52.7, avg_magnitude: 4.7, days_since_last_eq: 3, risk_level: "Medium Risk" },
  { city: "Matsue", depth_km: 41.3, avg_magnitude: 4.3, days_since_last_eq: 7, risk_level: "Low Risk" },
  { city: "Obihiro", depth_km: 60.5, avg_magnitude: 4.9, days_since_last_eq: 0, risk_level: "High Risk" }
];

// Map risk levels to numerical values
const riskLevelMap: { [key: string]: number } = {
  "Low Risk": 0,
  "Medium Risk": 1,
  "High Risk": 2
};

// Prepare training data
const inputs = earthquakeData.map(d => [d.depth_km, d.avg_magnitude, d.days_since_last_eq]);
const labels = earthquakeData.map(d => riskLevelMap[d.risk_level]);

// Convert data to tensors
const inputTensor = tf.tensor2d(inputs);
const labelTensor = tf.tensor1d(labels, 'int32');

// One-hot encode the labels
const labelOneHot = tf.oneHot(labelTensor, 3);

// Define the model
const model = tf.sequential();
model.add(tf.layers.dense({ inputShape: [3], units: 10, activation: 'relu' }));
model.add(tf.layers.dense({ units: 3, activation: 'softmax' }));

// Compile the model
model.compile({
  optimizer: tf.train.adam(),
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});

// Train the model
(async () => {
  await model.fit(inputTensor, labelOneHot, {
    epochs: 100,
    shuffle: true,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        console.log(Epoch ${epoch + 1}: loss = ${logs?.loss?.toFixed(4)}, accuracy = ${logs?.acc?.toFixed(4)});
      }
    }
  });

  // Make a prediction
  const testInput = tf.tensor2d([[60.0, 5.0, 2]]); // Example input
  const prediction = model.predict(testInput) as tf.Tensor;
  const predictedIndex = prediction.argMax(-1);
  const index = (await predictedIndex.data())[0];

  const riskLevels = ["Low Risk", "Medium Risk", "High Risk"];
  console.log(Predicted Risk Level: ${riskLevels[index]});
})();
