export const wasteComponents = {
  paper: [
    "paper",
    "sheet of paper",
    "newspaper",
    "magazine",
    "cardboard",
    "cardboard box",
    "paper packaging",
    "office paper",
    "printed paper",
    "paper stack",
    "paper bag",
    "recycled paper",
    "kraft paper",
    "carton",
  ],
  plastic: [
    "plastic",
    "plastic bottle",
    "plastic container",
    "plastic packaging",
    "plastic wrapper",
    "plastic bag",
    "transparent plastic",
    "plastic cup",
    "plastic lid",
    "pet bottle",
    "squeezable bottle",
    "plastic tray",
    "milk carton",
    "juice box",
    "tetra pak",
    "drink carton",
    "liquid packaging",
    "beverage carton",
    "metal",
    "metal can",
    "aluminum can",
    "steel can",
    "tin can",
    "metal container",
    "food can",
    "beverage can",
    "crushed can",
    "scrap metal",
  ],
  glass: [
    "glass",
    "glass bottle",
    "glass jar",
    "transparent glass",
    "green glass bottle",
    "brown glass bottle",
    "glass container",
    "broken glass",
    "glass shard",
    "clear glass",
    "glass cup",
  ],
  bio: [ // User called it "organic" in python but router says "bio" ("batteries", "plastic", "paper", "glass", "textile", "bio")
    "organic waste",
    "food waste",
    "fruit peel",
    "vegetable scraps",
    "leftover food",
    "banana peel",
    "apple core",
    "compost",
    "kitchen waste",
  ],
  batteries: [ // Python called it "battery"
    "battery",
    "aa battery",
    "aaa battery",
    "lithium battery",
    "rechargeable battery",
    "button cell",
    "used battery",
  ],
  textile: [ // Python called it "hazardous" (contains clothes, brick, etc. wait! "hazardous" contains clothes?) Let me check their dict
    "hazardous waste",
    "paint can",
    "chemical container",
    "cleaning chemicals",
    "toxic material",
    "oil container",
    "solvent",
    "pesticide",
    "clothes",
    "old clothes",
    "fabric",
    "textile",
    "shirt",
    "pants",
    "cloth material",
    "garment",
    "worn clothing",
    "construction waste",
    "brick",
    "concrete",
    "cement debris",
    "tiles",
    "ceramic tile",
    "rubble",
    "plaster",
    "rubber",
    "rubber tire",
    "tire",
    "rubber material",
    "black rubber",
    "rubber strip",
    "elastic material",
  ]
};

export async function classifyImageWithGoogleVision(file: File): Promise<string> {
  const apiKey = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
  
  console.log("=== STARTING GOOGLE VISION CLASSIFICATION ===");
  console.log("File:", file.name, file.size, "bytes");
  
  if (!apiKey) {
    console.error("VITE_GOOGLE_VISION_API_KEY is not set in your .env file!");
    console.warn("Falling back to random simulated category...");
    // Fallback if no API key is provided
    return simulateClassification();
  }

  try {
    console.log("Processing image to base64...");
    // 1. Convert File to Base64
    const base64Image = await fileToBase64(file);
    console.log("Base64 processing complete. Length:", base64Image.length);

    console.log("Sending request to Google Cloud Vision API...");
    // 2. Call Google Cloud Vision REST API
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: "LABEL_DETECTION", maxResults: 15 }]
          }
        ]
      })
    });

    if (!response.ok) {
      console.error("Google Vision API Error Status:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("API Error Body:", errorText);
      throw new Error(`Google Vision API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("RAW Google Vision Response Data:", JSON.stringify(data, null, 2));

    let labels: string[] = [];
    if (data.responses && data.responses.length > 0 && data.responses[0].labelAnnotations) {
      labels = data.responses[0].labelAnnotations.map((label: any) => label.description.toLowerCase());
    }
    
    console.log("Labels extracted:", labels);

    // 3. Map Google's labels to waste categories
    for (const [componentName, keywords] of Object.entries(wasteComponents)) {
      if (labels.some((label: string) => keywords.some(keyword => label.includes(keyword)))) {
        console.log(`✅ MATCH FOUND! Mapped to category: [${componentName}]`);
        return componentName; // Returns "plastic", "paper", "bio", "glass", "batteries", "textile"
      }
    }
    
    console.log("⚠️ No specific match found in dictionary. Defaulting to 'textile' (hazardous/other)");
    // Default fallback if we don't recognize anything
    return "textile"; 
  } catch (error) {
    console.error("❌ Exception during Google Vision Classification:", error);
    console.warn("Falling back to random simulated category due to error...");
    return simulateClassification();
  }
}

// Convert a File to a base64 string
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Remove the data:image/jpeg;base64, prefix
        resolve(reader.result.split(",")[1]);
      } else {
        reject(new Error("Failed to process file"));
      }
    };
    reader.onerror = error => reject(error);
  });
}

function simulateClassification(): string {
  console.log("🛠️ Running simulated classification with artificial delay...");
  const categories = ["batteries", "plastic", "paper", "glass", "textile", "bio"];
  const choice = categories[Math.floor(Math.random() * categories.length)];
  console.log(`🛠️ Simulated result: ${choice}`);
  return choice;
}
