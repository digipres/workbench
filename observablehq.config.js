// See https://observablehq.com/framework/config for documentation.
import MarkdownItFootnote from "markdown-it-footnote";

// Set up anonymised analytics if building on GITHUB:
const analytics = process.env.GITHUB_JOB == undefined ? '' : '<script defer src="https://cloud.umami.is/script.js" data-website-id="0ed0c854-0297-411f-b19c-4688ea996bdc"></script>';

export default {
  // The project’s title; used in the sidebar and webpage titles.
  title: "DigiPres Workbench",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    {
      name: "Formats",
      collapsible : true,
      open: true,
      pages: [
        { name: "All About Formats", path: "/formats/"},
        { name: "About the Registries", path: "/formats/about"},
        { name: "Comparing Registries", path: "/formats/compare"},
        { name: "Using Collection Profiles", path: "/formats/profiles"},
        { name: "Format Diversity Estimation", path: "/formats/species"},
      ]
    },
    {
      name: "Publications",
      open: true,
      pages: [
        {name: "Publication Statistics", path: "/publications/"},
        //{name: "Dashboard", path: "/example-dashboard"},
        //{name: "Report", path: "/example-report"}
      ]
    },
    {
      name: "Tools",
      open: true,
      pages: [
        {name: "Introduction", path: "/tools/"},
        {name: "File System Scanner", path: "/tools/scanner/"},
        {name: "DigiPres Sandbox", path: "/tools/sandbox"}
      ]
    },
    {
      name: "Workshop Activities",
      open: false,
      pages: [
        {name: "Introduction", path: "/workshops/"},
        {name: "Put iPRES In Context 🫶🏼", path: "/workshops/ipres-in-context"},
        {name: "Find Formats 💾", path: "/workshops/find-formats"},
        {name: "Reveal Hidden Gems 💎", path: "/workshops/hidden-gems"}
      ]
    }
  ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  //theme: "light", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  footer: ({path}) => `<a href="https://github.com/digipres/workbench/blob/main/src${path}.md?plain=1">View/edit the source for this page</a>.`,
  // sidebar: true, // whether to show the sidebar
  toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // cleanUrls: true, // drop .html from URLs

  // Add footnote support:
  markdownIt: (md) => md.use(MarkdownItFootnote),

  // Page header, based on Observable Frameworks one:
  header: `<div style="display: flex; align-items: center; gap: 0.5rem; height: 2.2rem; margin: -1.5rem -2rem 2rem -2rem; padding: 0.5rem 2rem; border-bottom: solid 1px var(--theme-foreground); font: 500 16px var(--sans-serif); --theme-foreground-focus: #000;">
  <a href="https://digipres.org/" target="_self" rel="" style="display: flex; align-items: center;">
    <svg width="22" height="22" viewBox="0 0 21.92930030822754 22.68549919128418" fill="currentColor">
      <path d="M10.9646 18.9046C9.95224 18.9046 9.07507 18.6853 8.33313 18.2467C7.59386 17.8098 7.0028 17.1909 6.62722 16.4604C6.22789 15.7003 5.93558 14.8965 5.75735 14.0684C5.56825 13.1704 5.47613 12.2574 5.48232 11.3427C5.48232 10.6185 5.52984 9.92616 5.62578 9.26408C5.7208 8.60284 5.89715 7.93067 6.15391 7.24843C6.41066 6.56618 6.74143 5.97468 7.14438 5.47308C7.56389 4.9592 8.1063 4.54092 8.72969 4.25059C9.38391 3.93719 10.1277 3.78091 10.9646 3.78091C11.977 3.78091 12.8542 4.00021 13.5962 4.43879C14.3354 4.87564 14.9265 5.49454 15.3021 6.22506C15.6986 6.97704 15.9883 7.7744 16.1719 8.61712C16.3547 9.459 16.447 10.3681 16.447 11.3427C16.447 12.067 16.3995 12.7593 16.3035 13.4214C16.2013 14.1088 16.0206 14.7844 15.7644 15.437C15.4994 16.1193 15.1705 16.7108 14.7739 17.2124C14.3774 17.714 13.8529 18.1215 13.1996 18.4349C12.5463 18.7483 11.8016 18.9046 10.9646 18.9046ZM12.8999 13.3447C13.4242 12.8211 13.7159 12.0966 13.7058 11.3427C13.7058 10.5639 13.4436 9.89654 12.92 9.34074C12.3955 8.78495 11.7441 8.50705 10.9646 8.50705C10.1852 8.50705 9.53376 8.78495 9.00928 9.34074C8.49569 9.87018 8.21207 10.5928 8.22348 11.3427C8.22348 12.1216 8.48572 12.7889 9.00928 13.3447C9.53376 13.9005 10.1852 14.1784 10.9646 14.1784C11.7441 14.1784 12.3891 13.9005 12.8999 13.3447ZM10.9646 22.6855C17.0199 22.6855 21.9293 17.6068 21.9293 11.3427C21.9293 5.07871 17.0199 0 10.9646 0C4.90942 0 0 5.07871 0 11.3427C0 17.6068 4.90942 22.6855 10.9646 22.6855Z"></path>
    </svg>
  </a>
  <div style="display: flex; flex-grow: 1; justify-content: space-between; align-items: baseline;">
    <a href="/">
      <span class="hide-if-small">Digital Preservation</span> Workbench
    </a>
    <span style="display: flex; align-items: baseline; gap: 1rem; font-size: 14px;">
      <a target="_blank" title="${
        process.env.npm_package_version
      } release notes" href="https://github.com/digipres/workbench/releases"><span>${
        process.env.npm_package_version
      }</span></a>
      <a target="_blank" title="GitHub" href="https://github.com/digipres/workbench"><span>GitHub️</span></a>
    </span>
  </div>
  </div>`,

  // HTML head:
  head: `${analytics}`

};
