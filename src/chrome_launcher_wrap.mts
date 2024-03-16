import {launch as CLlaunch,Options as CLOptions,Launcher as CLLauncher,LaunchedChrome as CLLaunchedChrome} from "chrome-launcher"
// import {chromePath} from "./my_cfg.cjs";

let chrome:CLLaunchedChrome=null;
export async function boot_chrome():Promise<number>{

  chrome= await CLlaunch( {
    chromePath: "/app/chrome-linux/chrome", //chromePath
    chromeFlags:["--no-first-run","--disable-gpu"]
  });

  return chrome.port
}

export function stop_chrome(){
  chrome.kill()
}
