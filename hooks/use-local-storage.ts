"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log(`useLocalStorage: Initializing ${key}`);
    
    // 立即设置初始化状态，避免无限等待
    const immediateInit = () => {
      setIsInitialized(true);
      console.log(`useLocalStorage: ${key} initialized immediately`);
    };

    // 如果不在浏览器环境，立即初始化
    if (typeof window === "undefined") {
      immediateInit();
      return;
    }

    // 添加短暂延迟确保DOM完全加载
    const initTimer = setTimeout(() => {
      try {
        console.log(`useLocalStorage: Attempting to read ${key} from localStorage`);
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsedValue = JSON.parse(item);
          console.log(`useLocalStorage: Successfully loaded ${key}:`, parsedValue);
          setStoredValue(parsedValue);
        } else {
          console.log(`useLocalStorage: No existing value for ${key}, using default`);
        }
      } catch (error) {
        console.error(`useLocalStorage: Error reading ${key}:`, error);
        setStoredValue(initialValue);
      } finally {
        setIsInitialized(true);
        console.log(`useLocalStorage: ${key} initialization complete`);
      }
    }, 50); // 50ms延迟

    // 备用超时机制
    const fallbackTimer = setTimeout(() => {
      if (!isInitialized) {
        console.warn(`useLocalStorage: Fallback initialization for ${key}`);
        setIsInitialized(true);
      }
    }, 1000); // 1秒后强制初始化

    return () => {
      clearTimeout(initTimer);
      clearTimeout(fallbackTimer);
    };
  }, [key, initialValue, isInitialized]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // 只在客户端保存到localStorage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        console.log(`useLocalStorage: Saved ${key} to localStorage`);
      }
    } catch (error) {
      console.error(`useLocalStorage: Error setting ${key}:`, error);
    }
  };

  return [storedValue, setValue, isInitialized] as const;
}