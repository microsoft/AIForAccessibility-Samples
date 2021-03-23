# Video Indexer Demo Web App

Welcome to the Video Indexer demo web application. The app demonstrates various features of the Azure video indexer service as they relate to accessibility. More specifically, the app provides for training of custom speech models, extracting text from videos and visual descriptions using the Azure computer vision API.

## Prerequisites
* [Node.js](https://nodejs.org/en/download/) - Download and install the LTS version.

## Setup

### Add Node.js to your path
Node.js needs to be in your path. To add it, follow the steps:

1. Find the Node.js install location - commonly `C:\Program Files\nodejs\`
2. Follow the same steps provided in the MongoDB instructions above using the Node.js location.

## Installation
Create a folder where you want to install the project. Usually one at the root of your drive is best. Something like `C:\dev`. You can use any location, but be aware that spaces in the path make it difficult to navigate with command prompt.

Open a terminal and navigate to your chosen directory. Type `git clone <repoURL> **.**`. Dont' forget the dot, or you'll install in a sub-folder.

Once Git is finished installing, type `npm install`. This should install all the required packages at the root level in your current directory.

When `npm install` is finished, type `cd client` in the same terminal to change to the `client` subfolder.

Type `npm install` again. This will install the client side of things including the React.js app and all of its required packages.

Type `cd..` to switch back to root level of the project, and then type `cd server` to change to `server` subfolder.

Type `npm install` again. This will install the server side of things and all of its required packages.

### Setup the database for the project
Database for this project is under Azure Cosmos DB and the info related to it is located under server/.env file

### Launch the server and view the site
1. Open a third terminal and navigate to the root directory of the project.
2. Type `npm start`. This will launch the node.js server on port 3001 and proxy requests from the client on port 3000.
3. Follow the link given by terminal when it is finished loading if it doesn't open a new browser tab. The site should load at [http://localhost:3000/](http://localhost:3000/). If the error `'nodemon' is not recognized as an internal or external command,[0] operable program or batch file` appears, you need to install nodemon globally. To do this, type `npm install -g nodemon` and press `enter`.

### Deployment of App to Azure App Service from VS code
1. This is the deployment method described in this link (https://docs.microsoft.com/en-us/azure/developer/javascript/tutorial-vscode-azure-app-service-node-01?tabs=bash)
### Prerequisites
1. An Azure account with an active subscription. Create one for free.
2. Visual Studio Code.
3. The Azure App Service extension for VS Code (installed from within VS Code).
4. Node.js and npm, the Node.js package manager.

### Deployment Steps
1. Install the Azure App Service extension (https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azureappservice)
2. Sign into Azure (After signing in, verify that the email address of your Azure account (or "Signed In") appears in the Status Bar and your subscription(s) appears in the Azure explorer).

### Deploying Server folder (Node JS API)
1. From the command palette (Ctrl+Shift+P), type "create web" and select Azure App Service: Create New Web App...Advanced. You use the advanced command to have full control over the deployment including resource group, App Service Plan, and operating system rather than use Linux defaults.
2. Select your Subscription account.
3. For Enter a globally unique name, enter a name that's unique across all of Azure. Use only alphanumeric characters ('A-Z', 'a-z', and '0-9') and hyphens ('-')
4. Select Create new resource group and provide a name like AppServiceTutorial-rg.
5. Select an operating system (Windows or Linux)
6. Linux only: select a Node.js version. (For Windows, you set the version using an app setting later on).
7. Select Create a new App Service plan, provide a name like AppServiceTutorial-plan, and select the F1 Free pricing tier.
8. Select Skip for now for the Application Insights resource.
9. Select a location near you.
10. After a short time, VS Code notifies you that creation is complete.
11. At the prompts, select the server folder from repo, select your subscription account again and then select the name of the web app created earlier.
12. When deploying to Linux, select Yes when prompted to update your configuration to run npm install on the target server.
13. Once deployment is complete, select Browse Website in the prompt to view your freshly deployed web app. The browser should display the Express.

### Deploying the client folder (React code)
1. From the command prompt, run 'npm run build' against the client folder which creates the minified version of production build.
2. Follow the same steps as above server folder deployment except that the operating system is Windows here
3. From the command palette (Ctrl+Shift+P), type "create web" and select Azure App Service: Create New Web App...Advanced. You use the advanced command to have full control over the deployment including resource group, App Service Plan, and operating system rather than use Linux defaults.
4. Select your Subscription account.
5. For Enter a globally unique name, enter a name that's unique across all of Azure. Use only alphanumeric characters ('A-Z', 'a-z', and '0-9') and hyphens ('-')
6. Select Create new resource group and provide a name like AppServiceTutorial-rg.
7. Select an operating system (Windows)
8. Select Create a new App Service plan, provide a name like AppServiceTutorial-plan, and select the F1 Free pricing tier.
9. Select Skip for now for the Application Insights resource.
10. Select a location near you.
11. After a short time, VS Code notifies you that creation is complete.
12. At the prompts, select the "build" subfolder from client folder under the repo, select your subscription account again and then select the name of the web app created earlier.
13. When deploying to Linux, select Yes when prompted to update your configuration to run npm install on the target server.
14. Once deployment is complete, select Browse Website in the prompt to view your freshly deployed web app. The browser should display the Express.

### Deploying the python API (found in the video indexer directory)
### Configure your environment
1. Make sure you have a local installation of Python 3.7 or 3.8.

Install the following software:
2. Visual Studio Code.
3. Python and the Python extension as described on VS Code Python Tutorial - Prerequisites.
4. The Azure App Service extension, which provides interaction with Azure App Service from within VS Code. For general information, explore the App Service extension tutorial and visit the vscode-azureappservice GitHub repository.
5. Navigate to the Azure Explorer.
6. Select Sign in to Azure and follow the prompts. (If you have multiple Azure extensions installed, select the one for the area in which you're working, such as App Service, Functions, etc.)
7. After signing in, verify that Azure: Signed In" appears in the Status Bar and your subscription(s) appears in the Azure explorer.
8. Next, in the Azure: App Service explorer, select the + command to create a new App Service (You can alternately use the Azure App Service: Create New Web App command from the VS Code Command Palette).
9. In the prompts that follow,
  a. Enter a name for your app, which must be globally unique across all of Azure. To ensure uniqueness, you typically use your name or company name followed by the app name.
  b. Select Python 3.7 as the runtime.
10. When a message appears indicating that the new App Service was created, select View Output to switch to the Output window in VS Code.
11. To confirm that the App Service is running properly, expand your subscription in the Azure: App Service explorer, right-click the App Service name, and select Browse website.
12. Use this procedure to deploy your Python app to an Azure App Service.
13. In Visual Studio Code, open the Azure: App Service explorer and select the blue up arrow:
14. Deploy your web app to App Service in App Service explorer
15. Alternately, you can right-click the App Service name and select the Deploy to Web App command.

16. In the prompts that follow, provide the following details:

  1. For "Select the folder to deploy," select your current app folder.
  2. For "Select Web App," choose the App Service you created in the previous step.
  3. If prompted to update your build configuration to run build commands, answer Yes.
  4. If prompted about overwriting the existing deployment, answer Deploy.
  5. If prompted to "always deploy the workspace", answer Yes.
17. While the deployment process is underway, you can view progress in the VS Code Output window.
18. When deployment is complete after a few minutes (depending on how many dependencies need to be installed), the message below appears. Select the Browse Website button to view the running site.

