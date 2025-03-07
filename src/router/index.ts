// import "@/utils/sso";
import Cookies from "js-cookie";
import { getConfig } from "@/config";
import NProgress from "@/utils/progress";
import { buildHierarchyTree } from "@/utils/tree";
import remainingRouter from "./modules/remaining";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { isUrl, openLink, storageLocal, isAllEmpty } from "@pureadmin/utils";
import {
  ascending,
  getTopMenu,
  initRouter,
  isOneOfArray,
  getHistoryMode,
  findRouteByPath,
  handleAliveRoute,
  formatTwoStageRoutes,
  formatFlatteningRoutes
} from "./utils";
import {
  type Router,
  createRouter,
  type RouteRecordRaw,
  type RouteComponent
} from "vue-router";
import {
  type DataInfo,
  userKey,
  removeToken,
  multipleTabsKey
} from "@/utils/auth";

import pdIcon from "../assets/png/prodIcon.png";
import priceIcon from "../assets/png/priceIcon.png";
import suplierIcon from "../assets/png/suplierIcon.png";

/** 自动导入全部静态路由，无需再手动引入！匹配 src/router/modules 目录（任何嵌套级别）中具有 .ts 扩展名的所有文件，除了 remaining.ts 文件
 * 如何匹配所有文件请看：https://github.com/mrmlnc/fast-glob#basic-syntax
 * 如何排除文件请看：https://cn.vitejs.dev/guide/features.html#negative-patterns
 */
const modules: Record<string, any> = import.meta.glob(
  ["./modules/**/*.ts", "!./modules/**/error.ts", "!./modules/**/remaining.ts"],
  {
    eager: true
  }
);
const Layout = () => import("@/layout/index.vue");

/** 原始静态路由（未做任何处理） */
const routes = [
  // {
  // path: "/classify",
  // name: "category",
  // component: () => import("@/views/classify/index.vue"),
  // meta: {
  //   title: "商品分类管理",
  // },
  //   children: [
  //   {
  //     path: "/fighting/index",
  //     name: "Fighting",
  //     component: () => import("@/views/fighting/index.vue"),
  //     meta: {
  //       title: "加油"
  //     }
  //   }
  // ]
  // },
  {
    path: "/productFile",
    name: "productFile",
    redirect: "/productFile/index",
    component: Layout,
    meta: {
      icon: "prime:book",
      title: "首页",
      rank: 0
    },
    children: [
      {
        path: "/productFile/index",
        name: "productFile",
        component: () => import("@/views/productFile/index.vue"),
        meta: {
          title: "产品档案",
          showParent: false
        }
      }
    ]
  },
  {
    path: "/quota",
    name: "quota",
    redirect: "/quota/index",
    component: Layout,
    meta: {
      icon: "akar-icons:coin",
      title: "报价管理",
      rank: 0
    },
    children: [
      {
        path: "/quota/index",
        name: "quota",
        component: () => import("@/views/quota/index.vue"),
        meta: {
          title: "报价管理",
          showParent: false
        }
      }
    ]
  },
  {
    path: "/supplier",
    name: "supplier",
    redirect: "/supplier/index",
    component: Layout,
    meta: {
      icon: "flowbite:address-book-outline",
      title: "供应商管理",
      rank: 0
    },
    children: [
      {
        path: "/supplier/index",
        name: "supplier",
        component: () => import("@/views/supplier/index.vue"),
        meta: {
          title: "供应商管理",
          showParent: false,
          icon: "flowbite:address-book-outline"
        }
      }
    ]
  }
];

Object.keys(modules).forEach(key => {
  routes.push(modules[key].default);
});

/** 导出处理后的静态路由（三级及以上的路由全部拍成二级） */
export const constantRoutes: Array<RouteRecordRaw> = formatTwoStageRoutes(
  formatFlatteningRoutes(buildHierarchyTree(ascending(routes.flat(Infinity))))
);

/** 用于渲染菜单，保持原始层级 */
export const constantMenus: Array<RouteComponent> = ascending(
  routes.flat(Infinity)
).concat(...remainingRouter);

/** 不参与菜单的路由 */
export const remainingPaths = Object.keys(remainingRouter).map(v => {
  return remainingRouter[v].path;
});

/** 创建路由实例 */
export const router: Router = createRouter({
  history: getHistoryMode(import.meta.env.VITE_ROUTER_HISTORY),
  routes: constantRoutes.concat(...(remainingRouter as any)),
  strict: true,
  scrollBehavior(to, from, savedPosition) {
    return new Promise(resolve => {
      if (savedPosition) {
        return savedPosition;
      } else {
        if (from.meta.saveSrollTop) {
          const top: number =
            document.documentElement.scrollTop || document.body.scrollTop;
          resolve({ left: 0, top });
        }
      }
    });
  }
});

/** 重置路由 */
export function resetRouter() {
  router.getRoutes().forEach(route => {
    const { name, meta } = route;
    if (name && router.hasRoute(name) && meta?.backstage) {
      router.removeRoute(name);
      router.options.routes = formatTwoStageRoutes(
        formatFlatteningRoutes(
          buildHierarchyTree(ascending(routes.flat(Infinity)))
        )
      );
    }
  });
  usePermissionStoreHook().clearAllCachePage();
}

/** 路由白名单 */
const whiteList = ["/login"];

const { VITE_HIDE_HOME } = import.meta.env;

router.beforeEach((to: ToRouteType, _from, next) => {
  // 无论访问哪个路径，均跳转到 /login
  if (to.path !== "/login") {
    next({ path: "/login" });
  } else {
    next();
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
