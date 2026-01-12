import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack'

export default defineConfig({
  plugins: [pluginReact()],
  resolve: {
    alias: {
      '@': './src',
    },
  },
  // 复制 public 目录中的文件到构建输出（包含 _redirects 等 Cloudflare 配置）
  server: {
    publicDir: {
      name: 'public',
    },
  },
  output: {
    // Cloudflare Pages 静态资源目录
    assetPrefix: '/',
    copy: [{ from: 'public', to: '' }],
  },
  tools: {
    rspack: {
      plugins: [
        TanStackRouterRspack({
          autoCodeSplitting: true,
          routesDirectory: './src/routes',
          generatedRouteTree: './src/routeTree.gen.ts',
        }),
      ],
    },
  },
  html: {
    title: 'Game Paradise - 幼儿游戏乐园',
    meta: {
      viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
    },
  },
})
