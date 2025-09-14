/// <reference types="webpack/module" />

declare const __DEV__: boolean;
declare const __ENTRY_TARGET__: 'node' | 'serviceWorker' | 'webPage';

declare module '*.module.css' {
  const css: { [key: string]: string };
  export = css;
}

declare module '*.eot' {
  const path: string;
  export default path;
}

declare module '*.gif' {
  const path: string;
  export default path;
}

declare module '*.ico' {
  const path: string;
  export default path;
}

declare module '*.jpeg' {
  const path: string;
  export default path;
}

declare module '*.jpg' {
  const path: string;
  export default path;
}

declare module '*.otf' {
  const path: string;
  export default path;
}

declare module '*.png' {
  const path: string;
  export default path;
}

declare module '*.svg' {
  const path: string;
  export default path;
}

declare module '*.ttf' {
  const path: string;
  export default path;
}

declare module '*.webp' {
  const path: string;
  export default path;
}

declare module '*.woff' {
  const path: string;
  export default path;
}

declare module '*.woff2' {
  const path: string;
  export default path;
}

declare module 'assets.json' {
  const assets: Record<
    'async' | 'initial',
    Partial<
      Record<
        string,
        Record<
          'auxiliary' | 'css' | 'js',
          Array<{
            immutable: boolean;
            path: string;
          }>
        >
      >
    >
  >;

  export = assets;
}
