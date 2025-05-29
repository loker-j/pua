'use client';

import { useEffect } from 'react';

const stagewiseConfig = {
  plugins: []
};

export function StagewiseProvider() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // 动态导入 stagewise 工具，避免在生产环境中包含
      import('@stagewise/toolbar').then(({ initToolbar }) => {
        initToolbar(stagewiseConfig);
      }).catch((error) => {
        console.warn('Failed to load stagewise toolbar:', error);
      });
    }
  }, []);

  // 仅在开发模式下渲染工具栏容器
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <div id="stagewise-toolbar-container" />;
} 