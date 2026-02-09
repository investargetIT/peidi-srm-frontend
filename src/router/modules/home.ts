const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");
export default {
  path: "/",
  name: "Home",
  redirect: "/index",
  component: Layout,
  meta: {
    icon: "prime:box",
    title: "工厂产品分类管理",
    rank: 0
  },
  children: [
    {
      path: "/index",
      name: "classifyPro",
      component: () => import("@/views/classifyPro/index.vue"),
      meta: {
        title: "工厂产品分类管理",
        showParent: false
      }
    }
  ]
} satisfies RouteConfigsTable;
