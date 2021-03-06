Quickstart
=====================

Install meteor globally as instructed on meteor.com

    $ curl https://install.meteor.com/ | sh

Install local npm packages.

    $ npm install

Run the application.

    $ meteor run
    
Install the Metamask chrome extension: https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en

Open Metamask, accept the terms of service, and click on "import existing DEM" at the bottom.

If you are using Ganache, copy paste the ganache seed phrase (candy maple cake sugar pudding cream honey rich smooth crumble sweet treat) into the "seed phrase" box, enter a password, and click create.

To connect to your local Ganache network, click on the "main network" dropdown at the top left of the window, and select "custom RPC." Type in "http://127.0.0.1:7545" and click save. You should now be logged in as the 0x627... account in metamask.

If you click the profile refresh icon and click "create account," metamask will automatically add additional ganache accounts.

Deployment
=====================

Install mup.

    $ npm install --global mup

Make sure your contract addresses are up to date in body.js, and that your ABIs are up to date in client/lib.

Move into the .deploy directory prepare install dependencies on the server.

    $ cd .deploy/
    $ mup setup
    
Build the app and deploy.

    $ mup deploy
