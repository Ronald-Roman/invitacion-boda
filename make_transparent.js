const Jimp = require('jimp');

async function run() {
  console.log("Reading image...");
  const image = await Jimp.read('public/subaru.png');
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    // Si el pixel es muy blanco, lo hacemos transparente
    if (r > 230 && g > 230 && b > 230) {
      this.bitmap.data[idx + 3] = 0; // Alpha a 0
    }
  });

  console.log("Writing image...");
  await image.writeAsync('public/subaru.png');
  console.log("Done!");
}

run().catch(console.error);
