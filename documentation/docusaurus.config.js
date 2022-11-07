module.exports = {
  title: "FlashList",
  tagline:
    "FlashList is a more performant replacement of the FlatList component.",
  url: "https://shopify.github.io/flash-list/docs",
  baseUrl: "/flash-list/docs/",
  favicon:
    "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡️</text></svg>",
  organizationName: "Shopify",
  projectName: "flash-list",
  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    prism: {
      additionalLanguages: ["ruby", "sql"],
    },
    navbar: {
      style: "dark",
      logo: {
        alt: "FlashList",
        src: "img/FlashList.png",
        srcDark: "img/FlashList.png",
        href: "/",
        target: "_self",
      },
      items: [
        {
          href: "https://github.com/shopify/flash-list",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Website",
          items: [
            {
              label: "⚡️ FlashList",
              to: "/",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/shopify/flash-list",
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
            "https://github.com/Shopify/flash-list/blob/main/documentation",
        },
        blog: false,
        pages: false,
        sitemap: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
