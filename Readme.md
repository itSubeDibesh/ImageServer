
<!-- markdownlint-disable MD041 -->
<!-- markdownlint-disable MD033 -->
<div style="margin-bottom:150px">
    <a href="https://www.sunderland.ac.uk/">
        <img src="./documents//sunderland.png" alt="University of Sunderland" align="left" height="100" >
    </a>
    <a href="https://www.ismt.edu.np/">
        <img src="./documents//ismt.png" alt="ismt College"  height="100" align="right">
    </a>
</div>

# Image Server

!["HTML"](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white) !["Css"](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white) !["Bootstrap"](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white) !["JS"](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) !["Express"](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) !["Node"](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) !["NPM"](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white) !["VUE"](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D) !["SQLITE"](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white) !["Markdown"](https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white) !["VSCode"](https://img.shields.io/badge/VSCode-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white) !["JSON"](https://img.shields.io/badge/json-5E5C5C?style=for-the-badge&logo=json&logoColor=white)

[![wakatime](https://wakatime.com/badge/user/31d076e5-7f32-41dd-b1a2-a772c1767c0c/project/43d9dc89-718c-47a3-99dc-23c4bda734fa.svg)](https://wakatime.com/badge/user/31d076e5-7f32-41dd-b1a2-a772c1767c0c/project/43d9dc89-718c-47a3-99dc-23c4bda734fa)

## Table of Contents

- [Image Server](#image-server)
  - [Table of Contents](#table-of-contents)
  - [Students Declaration](#students-declaration)
  - [Introduction](#introduction)
  - [Requirements](#requirements)
  - [Setup](#setup)
    - [Pre-Requisites](#pre-requisites)
    - [Assumptions](#assumptions)
    - [Suggestions](#suggestions)
    - [Instructions](#instructions)
  - [References](#references)

## Students Declaration

|Title          |   Description                 |
|--------------:|:------------------------------|
|Programme      | Computer Systems Engineering  |
|Module Name    | Advanced CyberSecurity        |
|Module Code    | CET324                        |
|Assignment     | Two                           |
|Module Leader  | Mr. Binod Rimal               |
|Batch          | 2021-2022                     |
|Student Name   | Dibesh Raj Subedi             |
|Student ID     | 219327253                     |

## Introduction

Image server is a web application created in completion of **Advanced CyberSecurity** module and part of second Assignment of the module. This web application is developed to provide a registration system and demonstrate a good security approach to avoid the security issues.

## Requirements

Produce a computer programme (in your choice of language) for a prototype system which illustrates appropriate design of security systems and the application of programming principles to cybersecurity applications.

Participating in online communities require users to register on the platform to create a user account. The registration process should be secure to protect user information. One of the steps often involves using captcha to validate that the request for registration is made by a human user rather a machine, e.g., bot.

You are required to produce a computer programme containing the following
features as minimum:

- A user interface to prompt a user to create an account by providing username and password.
- Algorithmically determine the strength of the chosen password by the user.
- Provides suitable feedback to user about the password strength. You should research password strength criteria and use your finding to help you with this task.
- Implement a captcha function to determine that registration request is made by a human user. For this task, you should research different types of captcha and implement one type.

Your prototype and prototype design should illustrate and embed good secure system design and apply appropriate cybersecurity principles and techniques showing your understanding and knowledge of secure system design. Where appropriate, you should make use of robust policies and procedures for password – for example (but not limited to) frequency of change, strength of password, preventing repetition of passwords, use of encryption etc.

## Setup

Setting up project is relatively easy if you have `Node.js` installed in your pc.

1. Clone the repo or download the repo from [https://github.com/itSubeDibesh/ImageServer](https://github.com/itSubeDibesh/ImageServer)
2. Open terminal pointing to cloned directory and follow the [Instructions](#instructions) section.

### Pre-Requisites

1. Internet connection to download required packages.
1. [**Node.js version 12.x.x or higher. (v14+ recommended)**](https://nodejs.org/)
1. [**VisualStudio Code (VsCode) latest version.**](https://code.visualstudio.com/)

### Assumptions

I assume that the user has installed Node.js version 12.x.x or higher. (v14+ recommended) and the user has internet connection to download required packages. The user knows how to install  **Node.js** version 12.x.x or higher if not installed. The user also have basic knowledge of how to use **command line** and **VsCode**.

### Suggestions

Please use VisualStudio Code(VsCode) to have a better experience exploring files and all the   documents of the project. Open the "Readme.md" file in VsCode and use "ctrl+shift+v" command to have a better experience.

### Instructions

  To run the project open your command line interface (CLI) and navigate to the current directory and observe whether the `node_modules` folder is created. If not then run the following command:

```bash
  npm run setup
```

  This will install all the required _packages_. Now simply run another command to start the project:

``` bash
  npm run prod
```

You would see your browser opening URL `http://localhost:8080`. If it does not check the terminal [CLI] which would show logs as shown in below.

```bash
> image_server@1.0.0 open:prod
> open-cli http://localhost:8080

 FileLogger: 📂 Directory created - file://E:/College/Advanced Cyber Security/ImageServer/logs
 FileLogger: 📂 Directory created - file://E:/College/Advanced Cyber Security/ImageServer/logs/all
 FileLogger: 📄 File created - file://E:/College/Advanced Cyber Security/ImageServer/logs/all/all_01_20220703.log
 FileLogger: 🔧 Log file 'Server' setup complete.
 FileLogger: 📂 Directory created - file://E:/College/Advanced Cyber Security/ImageServer/logs/response
 FileLogger: 📄 File created - file://E:/College/Advanced Cyber Security/ImageServer/logs/response/response_01_20220703.log
 FileLogger: 🔧 Log file 'Response' setup complete.
 FileLogger: 📂 Directory created - file://E:/College/Advanced Cyber Security/ImageServer/logs/request
 FileLogger: 📄 File created - file://E:/College/Advanced Cyber Security/ImageServer/logs/request/request_01_20220703.log
 FileLogger: 🔧 Log file 'Request' setup complete.
 FileLogger: 📂 Directory created - file://E:/College/Advanced Cyber Security/ImageServer/logs/database
 FileLogger: 📄 File created - file://E:/College/Advanced Cyber Security/ImageServer/logs/database/database_01_20220703.log
 FileLogger: 🔧 Log file 'SqlLite' setup complete.
 FileLogger: 📂 Directory created - file://E:/College/Advanced Cyber Security/ImageServer/logs/query
 FileLogger: 📄 File created - file://E:/College/Advanced Cyber Security/ImageServer/logs/query/query_01_20220703.log
 FileLogger: 🔧 Log file 'SqlQueries' setup complete.
 SqlLite: 📁 Directory Created: E:\College\Advanced Cyber Security\ImageServer\database\SQLite
 FileLogger: 🔧 Log file 'Server' setup complete.
 Server: 👂 Listening on PORT 8080, URL:http://localhost:8080
 SqlLite: 🌎 Database Connected : [ImageServer] at database/SQLite/ImageServer.db
Index->Database: Administrator Not Found.
Index->Database: Creating New Administrator.
Index: Administrator Created: "true".
```

Open your browser and open `http://localhost:8080` URl and you are good to go.

## References

1. [OWASP - SQL Injection](https://www.owasp.org/index.php/SQL_Injection)
2. [Synk - SQL Injection Cheat Sheet](https://snyk.io/blog/sql-injection-cheat-sheet/)
