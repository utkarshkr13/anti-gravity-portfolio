// Run with a local server on port 4173 and Playwright available in Node's module path.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true, ...(process.env.CHROMIUM_EXECUTABLE ? {executablePath:process.env.CHROMIUM_EXECUTABLE, args:['--no-sandbox','--disable-dev-shm-usage']} : {})});
  const errors = [];
  const page = await browser.newPage({viewport:{width:1440,height:1000},colorScheme:'dark'});
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if(response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto('http://127.0.0.1:4173', {waitUntil:'networkidle'});
  for (const theme of ['dark', 'light']) {
    await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
    for (const width of [320,375,768,1024,1440]) {
      await page.setViewportSize({width,height:1000});
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${theme}: overflow at ${width}`);
      for (const image of await page.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(img => img.decode());
        assert(await image.evaluate(img => img.naturalWidth > 0), 'Broken image');
      }
    }
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.evaluate(() => {document.documentElement.dataset.theme='dark';scrollTo({top:0,behavior:"instant"});});
  await page.screenshot({path:'/tmp/portfolio-desktop.png'});
  await page.getByRole('button',{name:'Data & research',exact:true}).click();
  assert.equal(await page.locator('.project-card:visible').count(),2);
  assert.equal(await page.locator('#filterStatus').textContent(),'2 projects shown.');
  await page.getByRole('button',{name:'All work',exact:true}).click();
  assert.equal(await page.locator('.project-card:visible').count(),4);
  await page.locator('#sap-tracker').scrollIntoViewIfNeeded();
  await page.screenshot({path:'/tmp/portfolio-projects.png'});
  const link=page.locator('#sap-tracker .case-link');
  await link.click();
  assert(await page.locator('dialog').evaluate(el=>el.open));
  assert(await page.locator('#modalClose').evaluate(el=>el===document.activeElement));
  await page.keyboard.press('Tab');
  assert(await page.locator('#modalClose').evaluate(el=>el===document.activeElement),'Modal focus escapes');
  await page.keyboard.press('Escape');
  assert(!await page.locator('dialog').evaluate(el=>el.open));
  assert(await link.evaluate(el=>el===document.activeElement),'Focus not restored');
  await link.click();
  await page.getByRole('button',{name:'Close project notes'}).click();
  assert(!await page.locator('dialog').evaluate(el=>el.open));
  await page.getByRole('button',{name:'Switch to light theme'}).click();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  await page.screenshot({path:'/tmp/portfolio-light.png'});
  await page.getByRole('button',{name:'Switch to dark theme'}).click();
  await page.setViewportSize({width:375,height:900});
  await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
  await page.screenshot({path:'/tmp/portfolio-mobile.png'});
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900}});
  const fallback=await context.newPage();
  await fallback.goto('http://127.0.0.1:4173');
  assert.equal(await fallback.locator('.project-card:visible').count(),4);
  await fallback.locator('#case-sap summary').click();
  assert(await fallback.locator('#case-sap').evaluate(el=>el.open));
  assert.equal(await fallback.locator('script[src]').count(),1);
  assert.equal(await fallback.locator('link[rel="stylesheet"]').count(),1);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('PASS: 10 viewport/theme combinations; images; filters; modal keyboard/focus; theme persistence; no-JS fallback; reduced motion; no browser errors.');
})().catch(error=>{console.error(error);process.exit(1);});
