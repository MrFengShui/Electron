# Electron Project #

<div style="display: flex;justify-content: center;align-items: center;">
    <img src="src/assets/image/angular-less.svg" alt="electron-less.svg" width="256" height="256"> 
    <span style="font-size: 128px;margin: auto 32px;">+</span>
    <img src="src/assets/image/electron-less.svg" alt="electron-less.svg" width="256" height="256">
</div>

## Description ##

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.2 and [Electron](https://www.electronjs.org/) version 18.1.0. The main purpose is entertainment and demonstration of algorithms.

> Already Implemented Algorithms:
> * SVG Icon
> * Maze Generating Algorithm
> * Maze Pathfinding Algorithm
> * Sorting Algorithm
> * Snake Game

## Development ##

Before developing this project, developers have to download and install `node (>= 14)` on `Windows`, `Linux`, or `MacOS`. After `node` installed successfully, the `Angular CLI` must be installed by command line `npm install --global @angular/cli`, as well as running `npm install --global electron` to install `Electron`.

There are two IDEs, which are JetBrain Webstorm or Visual Studio Code, used to develop this project. But the JetBrain Webstorm is recommended highly. Further more, developers DO NOT need to enter any commands in terminal, because all important commands are listed in `package.json` file. 

<div style="display: flex;justify-content: center;">
    <table style="border: white 1px solid;border-collapse: collapse;">
        <tr>
            <th style="text-align: center;border: white 1px solid;">Alias</th>
            <th style="text-align: center;border: white 1px solid;">Pipe Line</th>
            <th style="text-align: center;border: white 1px solid;">Description</th>
        </tr>
        <tr>
            <td style="border: white 1px solid">start</td>
            <td style="border: white 1px solid">npm-run-all -p angular:serve electron:serve</td>
            <td style="border: white 1px solid">Run for a electron app with angular dev-server</td>
        </tr>
        <tr>
            <td style="border: white 1px solid">build</td>
            <td style="border: white 1px solid">npm run angular:build && npm run electron:build</td>
            <td style="border: white 1px solid">Run for building electron project and generating an installing package</td>
        </tr>
        <tr>
            <td style="border: white 1px solid">angular:serve</td>
            <td style="border: white 1px solid">ng serve</td>
            <td style="border: white 1px solid">Run for an angular dev-server only</td>
        </tr>
        <tr>
            <td style="border: white 1px solid">angular:build</td>
            <td style="border: white 1px solid">ng build</td>
            <td style="border: white 1px solid">Run for building angular project</td>
        </tr>
    </table>
</div>

> Navigate to `http://localhost:8080/`. The app will automatically reload if you change any of the source files.

## Deployment ##

If deployment on web server only, please run `npm run angular:build` to build angular part of the project. The angular build artifacts will be stored in the `dist/web` directory. If an electron app expected, please run `npm run build` to build this project. The final build artifacts will be stored in the `pack` directory.

> Note: The configuration of nsis is only for Windows Platform. Developers can set custom configurations in this part, based on current developing platform. Please see details on this [link](https://www.electron.build/configuration/configuration "electron-builder").

## Unit Test ##

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

