<!-- 解析路由中的菜单项, 调用Item和Link组件, 组合成菜单项 -->
<template>
  <div v-if="!item.hidden">
    <!-- 以下条件三个条件同时满足时，渲染一个菜单项：
      1）有一个可显示的子菜单；且
      2）子菜单不是唯一的或唯一的子菜单不显示；且
      3）菜单项的 alwaysShow 属性为 false -->
    <template v-if="hasOneShowingChild(item.children, item) &&
      (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
      !item.alwaysShow
      ">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{ 'submenu-title-noDropdown': !isNest }">
          <item :icon="onlyOneChild.meta.icon || (item.meta && item.meta.icon)" :title="onlyOneChild.meta.title" />
        </el-menu-item>
      </app-link>
    </template>

    <!-- 有多个子菜单项，则进行遍历渲染 -->
    <el-submenu v-else ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body>
      <template slot="title">
        <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
      </template>
      <sidebar-item v-for="child in item.children" :key="child.path" :is-nest="true" :item="child"
        :base-path="resolvePath(child.path)" class="nest-menu" />
    </el-submenu>
  </div>
</template>

<script>
import path from "path";
import { isExternal } from "@/utils/validate";
import Item from "./Item";
import AppLink from "./Link";
import FixiOSBug from "./FixiOSBug";

export default {
  name: "SidebarItem",
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    // route object
    item: {
      type: Object,
      required: true,
    },
    isNest: {
      type: Boolean,
      default: false,
    },
    basePath: {
      type: String,
      default: "",
    },
  },
  data() {
    // To fix https://github.com/PanJiaChen/vue-admin-template/issues/237
    // TODO: refactor with render function
    this.onlyOneChild = null;
    return {};
  },
  methods: {
    // 判断菜单项是否只有一个子路由
    hasOneShowingChild(children = [], parent) {
      // 设置是否要显示菜单项的属性
      const showingChildren = children.filter((item) => {
        if (item.hidden) {
          return false;
        } else {
          // 如果菜单项没有被隐藏，则将此菜单项对象赋值给 this.onlyOneChild
          this.onlyOneChild = item;
          return true;
        }
      });

      // 如果菜单项的子路由只有一个，则直接返回true
      if (showingChildren.length === 1) {
        return true;
      }

      // 如果菜单项没有子路由，则创建一个新的对象，复制parent的所有属性，但重新设置path和noShowingChildren的值
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ...parent, path: "", noShowingChildren: true };
        return true;
      }

      return false;
    },

    // 从路由字符串中获取访问路径
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath;
      }
      if (isExternal(this.basePath)) {
        return this.basePath;
      }
      return path.resolve(this.basePath, routePath);
    },
  },
};
</script>
