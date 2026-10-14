import { chromium } from 'playwright';
import path from 'node:path';
export function launchBrowser(){
 const resources=process.env.SDC_RESOURCES||'D:\\Programming\\Open_Source\\hacktoberfest-week2-resources';
 return chromium.launch({headless:true,executablePath:process.env.SDC_CHROMIUM||path.join(resources,'browsers','chromium_headless_shell-1243','chrome-headless-shell-win64','chrome-headless-shell.exe'),args:['--disable-background-networking','--disable-component-update','--disable-sync']});
}
