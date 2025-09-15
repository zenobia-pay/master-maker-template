So you want to add a new page? First, decide if the page is static, or if it's a dynamic page. For static pages, just create a page-name folder and put in an index.html. Include these scripts:

<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/basecoat-css@0.3.2/dist/basecoat.cdn.min.css"
/>
<script
  src="https://cdn.jsdelivr.net/npm/basecoat-css@0.3.2/dist/js/all.min.js"
  defer
></script>

so that we can use shadcn components. View src/client/index.html to see what you need.

Make sure to add the route to the vite config.

## To make a dynamic page, like dashboard

First, view all the files in dashboard/ folder. You'll need an index.html and an index.tsx, a PageContext file and a Page.tsx file.
