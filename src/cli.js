#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const ora = require("ora");
const cliProgress = require("cli-progress");
const path = require("path");
const fs = require("fs").promises;
const IcoConverter = require("./converter");

const program = new Command();
const converter = new IcoConverter();

// ASCII Art Banner
const banner = `
╔═══════════════════════════════════════════╗
║                                           ║
║     🖼️  ImageTo-ICO Converter 🎨          ║
║     Convert images to ICO format          ║
║                                           ║
╚═══════════════════════════════════════════╝
`;

program
  .name("imageto-ico")
  .description("A powerful CLI tool to convert images to ICO format")
  .version("1.0.0");

// Convert command
program
  .command("convert")
  .alias("c")
  .description("Convert an image to ICO format")
  .argument("<input>", "Input image file path")
  .argument("[output]", "Output ICO file path (optional)")
  .option(
    "-s, --sizes <sizes>",
    "Icon sizes (comma-separated, e.g., 16,32,48,256)",
    "16,32,48,64,128,256"
  )
  .option("-q, --quiet", "Suppress output messages")
  .action(async (input, output, options) => {
    try {
      if (!options.quiet) {
        console.log(chalk.cyan(banner));
      }

      // Validate input file
      const inputPath = path.resolve(input);
      if (!converter.isSupported(inputPath)) {
        console.log(chalk.red("❌ Unsupported file format!"));
        console.log(
          chalk.yellow(
            `Supported formats: ${converter.getSupportedFormats().join(", ")}`
          )
        );
        process.exit(1);
      }

      // Determine output path
      const outputPath = output
        ? path.resolve(output)
        : path.join(
            path.dirname(inputPath),
            `${path.basename(inputPath, path.extname(inputPath))}.ico`
          );

      // Parse sizes
      const sizes = options.sizes
        .split(",")
        .map((s) => parseInt(s.trim()))
        .filter((s) => s > 0);

      // Start conversion
      const spinner = options.quiet ? null : ora("Converting image...").start();

      const result = await converter.convert(inputPath, outputPath, sizes);

      if (result.success) {
        if (spinner) spinner.succeed("Conversion complete!");

        if (!options.quiet) {
          console.log(chalk.green("\n✅ Success!\n"));
          console.log(chalk.white("Details:"));
          console.log(chalk.gray(`  Input:  ${result.inputPath}`));
          console.log(chalk.gray(`  Output: ${result.outputPath}`));
          console.log(chalk.gray(`  Sizes:  ${result.sizes.join("x, ")}x`));
          console.log(
            chalk.gray(`  File size: ${(result.fileSize / 1024).toFixed(2)} KB`)
          );
          console.log(
            chalk.gray(
              `  Original: ${result.originalFormat} (${result.originalSize})`
            )
          );
        }
      } else {
        if (spinner) spinner.fail("Conversion failed!");
        console.log(chalk.red(`\n❌ Error: ${result.error}`));
        process.exit(1);
      }
    } catch (error) {
      console.log(chalk.red(`\n❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Batch convert command
program
  .command("batch")
  .alias("b")
  .description("Convert multiple images to ICO format")
  .argument("<input...>", "Input image file paths or glob patterns")
  .option("-o, --output <dir>", "Output directory", "./output")
  .option(
    "-s, --sizes <sizes>",
    "Icon sizes (comma-separated)",
    "16,32,48,64,128,256"
  )
  .option("-q, --quiet", "Suppress output messages")
  .action(async (inputs, options) => {
    try {
      if (!options.quiet) {
        console.log(chalk.cyan(banner));
      }

      // Resolve all input files
      const inputFiles = [];
      for (const input of inputs) {
        const inputPath = path.resolve(input);
        try {
          const stat = await fs.stat(inputPath);
          if (stat.isFile() && converter.isSupported(inputPath)) {
            inputFiles.push(inputPath);
          }
        } catch (error) {
          console.log(chalk.yellow(`⚠️  Skipping ${input}: ${error.message}`));
        }
      }

      if (inputFiles.length === 0) {
        console.log(chalk.red("❌ No valid input files found!"));
        process.exit(1);
      }

      // Parse sizes
      const sizes = options.sizes
        .split(",")
        .map((s) => parseInt(s.trim()))
        .filter((s) => s > 0);

      // Create output directory
      const outputDir = path.resolve(options.output);
      await fs.mkdir(outputDir, { recursive: true });

      console.log(
        chalk.blue(`\n🔄 Converting ${inputFiles.length} file(s)...\n`)
      );

      // Create progress bar
      const progressBar = options.quiet
        ? null
        : new cliProgress.SingleBar({
            format:
              chalk.cyan("{bar}") +
              " | {percentage}% | {value}/{total} files | {filename}",
            barCompleteChar: "\u2588",
            barIncompleteChar: "\u2591",
            hideCursor: true,
          });

      if (progressBar)
        progressBar.start(inputFiles.length, 0, { filename: "" });

      // Convert files
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < inputFiles.length; i++) {
        const inputPath = inputFiles[i];
        const fileName = path.basename(inputPath, path.extname(inputPath));
        const outputPath = path.join(outputDir, `${fileName}.ico`);

        if (progressBar) {
          progressBar.update(i, { filename: path.basename(inputPath) });
        }

        const result = await converter.convert(inputPath, outputPath, sizes);

        if (result.success) {
          successCount++;
        } else {
          failCount++;
          if (!options.quiet) {
            console.log(
              chalk.red(
                `\n❌ Failed: ${path.basename(inputPath)} - ${result.error}`
              )
            );
          }
        }
      }

      if (progressBar) {
        progressBar.update(inputFiles.length, { filename: "Complete" });
        progressBar.stop();
      }

      // Summary
      if (!options.quiet) {
        console.log(chalk.green(`\n\n✅ Batch conversion complete!\n`));
        console.log(chalk.white("Summary:"));
        console.log(chalk.gray(`  Total files: ${inputFiles.length}`));
        console.log(chalk.green(`  Successful: ${successCount}`));
        if (failCount > 0) console.log(chalk.red(`  Failed: ${failCount}`));
        console.log(chalk.gray(`  Output directory: ${outputDir}`));
      }
    } catch (error) {
      console.log(chalk.red(`\n❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Info command
program
  .command("info")
  .alias("i")
  .description("Show supported formats and default settings")
  .action(() => {
    console.log(chalk.cyan(banner));
    console.log(chalk.white("Supported Input Formats:"));
    console.log(chalk.gray(`  ${converter.getSupportedFormats().join(", ")}`));
    console.log(chalk.white("\nDefault Icon Sizes:"));
    console.log(chalk.gray(`  ${converter.defaultSizes.join("x, ")}x`));
    console.log(chalk.white("\nUsage Examples:"));
    console.log(chalk.gray("  imageto-ico convert image.png"));
    console.log(
      chalk.gray("  imageto-ico convert image.png output.ico -s 16,32,48")
    );
    console.log(chalk.gray("  imageto-ico batch *.png -o icons"));
  });

// GUI command
program
  .command("gui")
  .alias("g")
  .description("Launch the graphical user interface")
  .action(() => {
    console.log(chalk.cyan(banner));
    console.log(chalk.blue("🚀 Launching GUI..."));

    const { spawn } = require("child_process");
    const electronPath = require("electron");

    const gui = spawn(electronPath, [path.join(__dirname, "..")], {
      stdio: "inherit",
      detached: true,
    });

    gui.unref();
    process.exit(0);
  });

// Parse arguments
if (process.argv.length === 2) {
  console.log(chalk.cyan(banner));
  program.help();
} else {
  program.parse();
}
