# 🎨 ImageTo-ICO Converter

A powerful and modern CLI and GUI application to convert images to ICO format with ease. Built with Node.js, Electron, and Sharp for high-quality image processing.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)

## ✨ Features

### 🖥️ CLI Features

- **Powerful Command-Line Interface** - Convert images with simple commands
- **Batch Processing** - Convert multiple images at once
- **Custom Icon Sizes** - Choose from 16x16 to 256x256 or specify custom sizes
- **Progress Indicators** - Real-time progress bars and status updates
- **Colorful Output** - Beautiful, easy-to-read terminal output
- **Multiple Format Support** - JPG, PNG, WebP, GIF, SVG, TIFF, BMP

### 🎨 GUI Features

- **Modern Sleek Interface** - Beautiful gradient design with glass-morphism effects
- **Drag & Drop** - Simply drag images into the window
- **Batch Conversion** - Convert multiple files simultaneously
- **Live Preview** - See conversion progress in real-time
- **Custom Settings** - Select icon sizes and output directory
- **Statistics Dashboard** - Track conversions, successes, and failures
- **Cross-Platform** - Works on Windows, macOS, and Linux

## 📦 Installation

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn

### Install Dependencies

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

## 🚀 Usage

### CLI Usage

#### Basic Conversion

```bash
node src/cli.js convert image.png
```

#### Specify Output Path

```bash
node src/cli.js convert input.jpg output.ico
```

#### Custom Icon Sizes

```bash
node src/cli.js convert image.png -s 16,32,48,256
```

#### Batch Conversion

```bash
node src/cli.js batch image1.png image2.jpg image3.webp -o ./icons
```

#### Quiet Mode (No Output)

```bash
node src/cli.js convert image.png -q
```

#### Show Information

```bash
node src/cli.js info
```

### GUI Usage

#### Launch the GUI

```bash
npm start
```

Or use the CLI command:

```bash
node src/cli.js gui
```

#### Using the GUI

1. **Add Files**: Drag and drop images or click "Browse Files"
2. **Select Sizes**: Choose which icon sizes to include (16x16 to 256x256)
3. **Set Output**: Choose where to save converted icons
4. **Convert**: Click "Convert All" or select a file and click "Convert Selected"
5. **Monitor**: Watch real-time progress and statistics

## 🎯 CLI Commands Reference

### Convert Command

```bash
imageto-ico convert <input> [output] [options]

Arguments:
  input                    Input image file path
  output                   Output ICO file path (optional)

Options:
  -s, --sizes <sizes>      Icon sizes (comma-separated, e.g., 16,32,48,256)
                          Default: 16,32,48,64,128,256
  -q, --quiet             Suppress output messages
  -h, --help              Display help for command
```

### Batch Command

```bash
imageto-ico batch <input...> [options]

Arguments:
  input...                 Input image file paths

Options:
  -o, --output <dir>      Output directory (default: "./output")
  -s, --sizes <sizes>     Icon sizes (comma-separated)
                          Default: 16,32,48,64,128,256
  -q, --quiet            Suppress output messages
  -h, --help             Display help for command
```

### Info Command

```bash
imageto-ico info

Display supported formats and default settings
```

### GUI Command

```bash
imageto-ico gui

Launch the graphical user interface
```

## 📋 Supported Input Formats

- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **WebP** (.webp)
- **GIF** (.gif)
- **SVG** (.svg)
- **TIFF** (.tiff, .tif)
- **BMP** (.bmp)

## 🎨 Icon Sizes

Standard sizes included:

- 16×16 (Small toolbar icons)
- 32×32 (Standard toolbar icons)
- 48×48 (Large toolbar icons)
- 64×64 (Extra large icons)
- 128×128 (High DPI displays)
- 256×256 (Ultra high DPI displays)

## 🏗️ Project Structure

```
imageto-ico/
├── src/
│   ├── converter.js       # Core conversion logic
│   ├── cli.js            # Command-line interface
│   ├── main.js           # Electron main process
│   └── preload.js        # Electron preload script
├── renderer/
│   ├── index.html        # GUI main page
│   └── renderer.js       # GUI logic and interactions
├── package.json          # Project dependencies
└── README.md            # This file
```

## 🛠️ Development

### Run in Development Mode

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### CLI Development

```bash
npm run cli -- convert test.png
```

## 📝 Examples

### Example 1: Quick Conversion

```bash
# Convert a PNG to ICO with default settings
node src/cli.js convert logo.png
```

### Example 2: Custom Sizes

```bash
# Create ICO with only small sizes
node src/cli.js convert icon.png icon.ico -s 16,32,48
```

### Example 3: Batch Processing

```bash
# Convert all PNGs in current directory
node src/cli.js batch *.png -o ./output-icons
```

### Example 4: Silent Batch

```bash
# Batch convert without output messages
node src/cli.js batch img1.jpg img2.png img3.webp -o ./icons -q
```

## 💡 Tips for Best Results

1. **Use Square Images** - Icons look best when starting from square images
2. **High Resolution** - Start with at least 256×256 for best quality
3. **Transparent Backgrounds** - PNG files with transparency work great
4. **Simple Designs** - Icons with clear, simple designs scale better
5. **Test Multiple Sizes** - Always check how your icon looks at different sizes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Sharp** - High-performance image processing
- **Commander.js** - CLI framework
- **Electron** - Cross-platform desktop apps
- **Chalk & Ora** - Beautiful terminal output
- **Tailwind CSS** - Modern styling

## 📞 Support & Issues

If you encounter any issues or have questions:

1. Check the documentation above
2. Run `node src/cli.js info` for format information
3. Try with different image formats
4. Ensure Node.js version is 16.0.0 or higher

## 👤 About The Author

**Edward Joseph Terry** - Full Stack Developer

I'm passionate about building tools that making developers' lives easier. Check out my other projects and work:

- 💻 [Portfolio](https://ed-terry.github.io) - See my work and projects
- 🐙 [GitHub](https://github.com/ed-terry) - Follow my repositories  
- 📧 Email: [sir_edward@icloud.com](mailto:sir_edward@icloud.com)
- 📱 Phone: +255 763 815 413
- ☕ [Buy me a coffee](https://buymeacoffee.com/siredwardm) - Support my work

---

Made with ❤️ for the development community

**Happy Converting! 🎨✨**
