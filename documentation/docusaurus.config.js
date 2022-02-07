module.exports = {
  title: "RecyclerFlatList",
  tagline:
    "RecyclerFlatList is a more performant replacement of the FlatList component.",
  url: "https://recycler-flat-list.docs.shopify.io",
  baseUrl: "/",
  onBrokenLinks: "error",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "Shopify",
  projectName: "recycler-flat-list",
  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    prism: {
      additionalLanguages: ["ruby", "sql"],
    },
    navbar: {
      title: "RecyclerFlatList",
      items: [
        {
          href: "https://github.com/shopify/recycler-flat-list",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Microsite Docs",
          items: [
            {
              label: "Microsite Docs",
              to: "https://development.shopify.io/engineering/keytech/apidocs/microsites",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/shopify/recycler-flat-list",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Shopify Inc.`,
    },
  },
  plugins: [
    [
      "@easyops-cn/docusaurus-search-local",
      {
        docsDir: "docs",
        indexPages: true,
        docsRouteBasePath: "/",
      },
    ],
  ],
  themes: ["@shopify/docusaurus-shopify-theme"],
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          path: "docs",
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl:
            "https://github.com/shopify/recycler-flat-list/edit/main/docusaurus/",
        },
        blog: false,
        pages: false,
        sitemap: false,
      },
    ],
  ],
};
