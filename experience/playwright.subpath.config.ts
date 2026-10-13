import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  testMatch:'subpath.spec.ts',
  timeout:30000,
  retries:process.env.CI?1:0,
  reporter:process.env.CI?'github':'list',
  use:{baseURL:'http://127.0.0.1:4179/POELIO/',trace:'retain-on-failure'},
  projects:[
    {name:'subpath-desktop',use:{...devices['Desktop Chrome']}},
    {name:'subpath-mobile',use:{...devices['Desktop Chrome'],viewport:{width:375,height:812},isMobile:true,hasTouch:true}}
  ],
  webServer:{
    command:'npm run preview -- --base /POELIO/ --port 4179 --strictPort',
    url:'http://127.0.0.1:4179/POELIO/',
    reuseExistingServer:!process.env.CI,
    timeout:60000
  }
});
