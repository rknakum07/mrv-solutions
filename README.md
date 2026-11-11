# MRV Solutions – responsive landing page

Files
- index.html – markup (nav, hero, logos, about, form, why choose, testimonials, CTA, footer)
- styles.css – design tokens + responsive layout (breakpoints: 1200 / 1024 / 860 / 640 / 380)
- script.js – mobile menu, video swap, stat count-up, form validation
- download-assets.sh – downloads all images/icons from Figma into assets/

Setup
1. Download the images (Figma asset links expire after ~7 days):
   - Windows: double-click download-assets.bat
   - Mac/Linux: ./download-assets.sh
2. Open index.html in a browser.

To do
- Set data-video-src on #video in index.html (YouTube/Vimeo embed URL or .mp4).
- Connect the form submit in script.js to your backend or form service.

FormSubmit
- Submissions go to vrteam.designs@gmail.com via https://formsubmit.co/ajax/…
- The very first submission triggers an activation email from FormSubmit – click "Activate Form" in it, otherwise no leads arrive.
- Must be served from a real URL (https://… or a local server). It will not work from a file:// page.
