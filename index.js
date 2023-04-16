#!/usr/bin/env node

const program = require("commander");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const mkdirp = require("mkdirp");
const handlebars = require("handlebars");
const inquirer = require("inquirer");

/**
 * This code sets up the commander library to create a new command-line interface
 * with a single command called init.
 * When the init command is run, it will print a message to the console.
 */
program
  .version("1.0.0")
  .description("A CLI for React development")
  .command("init <projectName>")
  .action(async (projectName) => {
    // uses the inquirer library to prompt the user for the project name,
    // and then calls the necessary functions to create the new React project.
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Project Name",
        default: projectName,
      },
    ]);
    const projectDir = createProject(answers.projectName);
    generateFiles(projectDir, answers.projectName);
    installDependencies(projectDir);
    addScripts(projectDir);
    console.log("Done!");
  });

/**
 * This code adds a new component command to the CLI tool,
 *
 * which generates a new React component in the src/components directory.
 *
 * It checks if the component already exists, creates a new directory for the component,
 *
 * and generates the necessary files using Handlebars.js
 */
program
  .command("component <componentName>")
  .description("Generate a new react component")
  .action((componentName) => {
    const componentPath = path.join(
      process.cwd(),
      "src",
      "components",
      componentName
    );

    if (fs.existsSync(componentPath)) {
      console.error(`Component ${componentName} already exists!`);
      return;
    }
    mkdirp.mkdirpSync(componentPath);
    const templateFiles = [
      {
        src: "templates/Component.js",
        dest: path.join(componentPath, `${componentName}.js`),
      },
      {
        src: "templates/Component.css",
        dest: path.join(componentPath, `${componentName}.css`),
      },
      { src: "templates/index.js", dest: path.join(componentPath, "index.js") },
    ];
    for (const file of templateFiles) {
      const template = fs.readFileSync(file.src, "utf-8");
      const content = handlebars.compile(template)({ componentName });
      fs.writeFileSync(file.dest, content);
    }
    console.log(`Component ${componentName} generated!`);
  });

program.parse(process.argv);

// uses the mkdirp library to create the directories for the new project
function createProject(projectName) {
  const rootDir = path.join(process.cwd(), projectName);
  mkdirp.mkdirpSync(rootDir);
  mkdirp.mkdirpSync(path.join(rootDir, "src"));
  mkdirp.mkdirpSync(path.join(rootDir, "public"));
  // mkdirp.sync(rootDir);
  // mkdirp.sync(path.join(rootDir, "src"));
  // mkdirp.sync(path.join(rootDir, "public"));
  return rootDir;
}

/**
 * uses the execSync function from Node.js to run the npm install command in the new project directory.
 *
 * It also installs the required react and react-dom dependencies.
 */
function installDependencies(projectDir) {
  console.log("Installing dependenices ...");
  try {
    execSync(`cd ${projectDir} && npm init && npm install react react-dom`, {
      stdio: "inherit",
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

/**
 *
 * reads the `package.json` file from the new project directory,
 *
 * adds the necessary scripts, and writes the updated file back to disk.
 */
function addScripts(projectDir) {
  console.log("Adding scripts ...");
  try {
    const pkgFile = path.join(projectDir, "package.json");
    const pkg = require(pkgFile);
    pkg.scripts = {
      start: "react-scripts start",
      build: "react-scripts build",
      test: "react-scripts test",
    };
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

/**
 *
 * reads the template files from the templates directory,
 *
 * compiles them using Handlebars.js with the user's input,
 *
 * and writes the resulting files to the new project directory.
 */
function generateFiles(projectDir, projectName) {
  console.log("Generating files ...");
  try {
    const templateFiles = [
      { src: "templates/index.html", dest: "public/index.html" },
      { src: "templates/index.js", dest: "src/index.js" },
      { src: "templates/package.json", dest: "package.json" },
    ];
    for (const file of templateFiles) {
      const template = fs.readFileSync(file.src, "utf-8");
      const content = handlebars.compile(template)({ projectName });
      const dest = path.join(projectDir, file.dest);
      fs.writeFileSync(dest, content);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
