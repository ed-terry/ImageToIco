const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

/**
 * ICO file format converter
 * Supports multiple sizes and modern image formats
 */
class IcoConverter {
  constructor() {
    // Standard ICO sizes for different use cases
    this.defaultSizes = [16, 32, 48, 64, 128, 256];
  }

  /**
   * Convert an image to ICO format
   * @param {string} inputPath - Path to input image
   * @param {string} outputPath - Path for output ICO file
   * @param {Array<number>} sizes - Array of icon sizes to include
   * @returns {Promise<Object>} Conversion result
   */
  async convert(inputPath, outputPath, sizes = null) {
    try {
      const iconSizes = sizes || this.defaultSizes;

      // Validate input file exists
      await fs.access(inputPath);

      // Create output directory if it doesn't exist
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Read the input image
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      // Generate PNG images for each size
      const imageBuffers = [];
      for (const size of iconSizes) {
        const buffer = await sharp(inputPath)
          .resize(size, size, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png()
          .toBuffer();

        imageBuffers.push({ size, buffer });
      }

      // Create ICO file structure
      const icoBuffer = this.createIcoFile(imageBuffers);

      // Write the ICO file
      await fs.writeFile(outputPath, icoBuffer);

      return {
        success: true,
        inputPath,
        outputPath,
        sizes: iconSizes,
        fileSize: icoBuffer.length,
        originalFormat: metadata.format,
        originalSize: `${metadata.width}x${metadata.height}`,
      };
    } catch (error) {
      return {
        success: false,
        inputPath,
        outputPath,
        error: error.message,
      };
    }
  }

  /**
   * Create ICO file format from PNG buffers
   * @param {Array} imageBuffers - Array of {size, buffer} objects
   * @returns {Buffer} ICO file buffer
   */
  createIcoFile(imageBuffers) {
    const iconCount = imageBuffers.length;

    // ICO header (6 bytes)
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // Reserved (must be 0)
    header.writeUInt16LE(1, 2); // Type (1 = ICO)
    header.writeUInt16LE(iconCount, 4); // Number of images

    // Icon directory entries (16 bytes each)
    const dirEntries = [];
    let currentOffset = 6 + iconCount * 16; // Header + all directory entries

    for (let i = 0; i < iconCount; i++) {
      const { size, buffer } = imageBuffers[i];
      const entry = Buffer.alloc(16);

      entry.writeUInt8(size === 256 ? 0 : size, 0); // Width (0 means 256)
      entry.writeUInt8(size === 256 ? 0 : size, 1); // Height (0 means 256)
      entry.writeUInt8(0, 2); // Color palette
      entry.writeUInt8(0, 3); // Reserved
      entry.writeUInt16LE(1, 4); // Color planes
      entry.writeUInt16LE(32, 6); // Bits per pixel
      entry.writeUInt32LE(buffer.length, 8); // Image size
      entry.writeUInt32LE(currentOffset, 12); // Image offset

      dirEntries.push(entry);
      currentOffset += buffer.length;
    }

    // Combine all parts
    const buffers = [
      header,
      ...dirEntries,
      ...imageBuffers.map((img) => img.buffer),
    ];
    return Buffer.concat(buffers);
  }

  /**
   * Batch convert multiple images
   * @param {Array<string>} inputPaths - Array of input image paths
   * @param {string} outputDir - Output directory
   * @param {Object} options - Conversion options
   * @returns {Promise<Array>} Array of conversion results
   */
  async batchConvert(inputPaths, outputDir, options = {}) {
    const results = [];

    for (const inputPath of inputPaths) {
      const fileName = path.basename(inputPath, path.extname(inputPath));
      const outputPath = path.join(outputDir, `${fileName}.ico`);

      const result = await this.convert(inputPath, outputPath, options.sizes);
      results.push(result);
    }

    return results;
  }

  /**
   * Get supported input formats
   * @returns {Array<string>} Array of supported formats
   */
  getSupportedFormats() {
    return ["jpg", "jpeg", "png", "webp", "gif", "svg", "tiff", "bmp"];
  }

  /**
   * Validate if file is supported
   * @param {string} filePath - Path to file
   * @returns {boolean} True if supported
   */
  isSupported(filePath) {
    const ext = path.extname(filePath).toLowerCase().slice(1);
    return this.getSupportedFormats().includes(ext);
  }
}

module.exports = IcoConverter;
