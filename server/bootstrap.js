'use strict';

const RBAC_ACTIONS = [
  {
    section: "plugins",
    displayName: "View and access the plugin",
    uid: "use",
    pluginName: "github-projects"
  },
  {
    section: "plugins",
    subCategory: "Repositories",
    displayName: "Read GitHub Repositories",
    uid: "repos.read",
    pluginName: "github-projects"
  },
  {
    section: "plugins",
    subCategory: "Projects",
    displayName: "Read Projects",
    uid: "projects.read",
    pluginName: "github-projects"
  },
  {
    section: "plugins",
    subCategory: "Projects",
    displayName: "Create Projects from GitHub Repositories",
    uid: "projects.create",
    pluginName: "github-projects"
  },
  {
    section: "plugins",
    subCategory: "Projects",
    displayName: "Delete Projects",
    uid: "projects.delete",
    pluginName: "github-projects"
  }
]

module.exports = async ({ strapi }) => {
  await strapi.admin.services.permission.actionProvider.registerMany(RBAC_ACTIONS);
};
