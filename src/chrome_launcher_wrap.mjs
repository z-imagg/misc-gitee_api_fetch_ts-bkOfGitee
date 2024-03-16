import {launch as CLlaunch,Options as CLOptions,Launcher as CLLauncher,LaunchedChrome as CLLaunchedChrome} from "chrome-launcher"
import {chromePath} from "./my_cfg";

const chrome:CLLaunchedChrome= await CLlaunch( {
  chromePath:chromePath, // "/app/chrome-linux/chrome"
  chromeFlags:["--no-first-run","--disable-gpu"]
});

chrome.kill()
