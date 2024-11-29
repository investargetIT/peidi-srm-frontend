const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");
import cateIcon from "../../assets/png/cateIcon.png";
export default {
  path: "/",
  name: "Home",
  redirect: "/index",
  component: Layout,
  meta: {
    icon: "prime:box",
    title: "首页",
    rank: 0
  },
  children: [
    {
      path: "/index",
      name: "category",
      component: () => import("@/views/classify/index.vue"),
      meta: {
        title: "商品分类管理",
        showParent: false
      }
    }
  ]
} satisfies RouteConfigsTable;
